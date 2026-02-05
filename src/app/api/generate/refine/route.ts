import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateWithFallback } from '@/lib/ai/model-router';
import { buildRefinementMessages } from '@/lib/ai/prompts';
import { calculateCost } from '@/lib/ai/cost';
import { checkDailyLimit, incrementDailyUsage } from '@/lib/db/usage';
import { getGeneration, saveGeneration } from '@/lib/db/generations';
import { sanitizeGeneratedCode } from '@/lib/utils/sanitize';
import { formatCode } from '@/lib/utils/format';
import { generateCacheKey } from '@/lib/ai/cache';
import { createHash } from 'crypto';

/** Vercel serverless function timeout (seconds). */
export const maxDuration = 60;

/**
 * POST /api/generate/refine
 *
 * Follow-up refinement on an existing generation. Takes the parent generation
 * and a modification instruction, then streams refined code via SSE.
 *
 * Request body: `{ generationId: string, instruction: string }`
 *
 * SSE events are identical to the main /api/generate endpoint.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse & validate request body
  let body: { generationId?: string; instruction?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { generationId, instruction } = body;

  if (!generationId || !instruction) {
    return Response.json(
      { error: 'Missing required fields: generationId, instruction' },
      { status: 400 }
    );
  }

  // 3. Check daily limit
  const limitCheck = await checkDailyLimit(userId);
  if (!limitCheck.allowed) {
    return Response.json(
      {
        error: 'Daily limit reached',
        limit: limitCheck.limit,
        used: limitCheck.used,
        plan: limitCheck.plan,
      },
      { status: 429 }
    );
  }

  // 4. Load parent generation
  const parent = await getGeneration(generationId, userId);
  if (!parent) {
    return Response.json(
      { error: 'Generation not found' },
      { status: 404 }
    );
  }

  if (!parent.output_code) {
    return Response.json(
      { error: 'Parent generation has no code to refine' },
      { status: 400 }
    );
  }

  // 5. Build refinement messages
  const messages = buildRefinementMessages(
    parent.input_image_url,
    parent.output_code,
    parent.input_framework,
    instruction
  );

  // 6. Generate a cache key for this refinement
  const refinementHash = createHash('sha256')
    .update(`${parent.cache_key}:${instruction}`)
    .digest('hex');
  const cacheKey = generateCacheKey(refinementHash, parent.input_framework);

  // 7. Stream refined code via SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { stream: aiStream, modelUsed } = await generateWithFallback(
          messages,
          { maxTokens: 8192, temperature: 0.6 }
        );

        let fullCode = '';
        let inputTokens = 0;
        let outputTokens = 0;
        const startTime = Date.now();

        for await (const chunk of aiStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullCode += content;

          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? 0;
            outputTokens = chunk.usage.completion_tokens ?? 0;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', data: content })}\n\n`
            )
          );
        }

        const latencyMs = Date.now() - startTime;
        const costUsd = calculateCost(modelUsed, inputTokens, outputTokens);

        // Post-process
        let processedCode = sanitizeGeneratedCode(fullCode);
        processedCode = await formatCode(processedCode, parent.input_framework);

        // Save as child generation
        const generation = await saveGeneration({
          userId,
          imageUrl: parent.input_image_url,
          imageHash: parent.input_image_hash,
          framework: parent.input_framework,
          outputCode: processedCode,
          cacheKey,
          modelUsed,
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs,
          parentGenerationId: parent.id,
          iterationNumber: (parent.iteration_number ?? 1) + 1,
          refinementPrompt: instruction,
        });

        // Track usage
        await incrementDailyUsage(
          userId,
          inputTokens + outputTokens,
          costUsd
        );

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'complete',
              data: processedCode,
              generationId: generation.id,
              modelUsed,
              latencyMs,
            })}\n\n`
          )
        );

        controller.close();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown refinement error';

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', data: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
