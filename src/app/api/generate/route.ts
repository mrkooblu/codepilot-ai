import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { preprocessScreenshot } from '@/lib/ai/image-processor';
import { hashImage, generateCacheKey } from '@/lib/ai/cache';
import { generateWithFallback } from '@/lib/ai/model-router';
import { getSystemPromptForFramework, buildUserMessage } from '@/lib/ai/prompts';
import { calculateCost } from '@/lib/ai/cost';
import { checkDailyLimit, incrementDailyUsage } from '@/lib/db/usage';
import { saveGeneration, getCachedGeneration } from '@/lib/db/generations';
import { uploadToR2 } from '@/lib/storage/r2';
import { sanitizeGeneratedCode } from '@/lib/utils/sanitize';
import { formatCode } from '@/lib/utils/format';
import type { Framework } from '@/lib/ai/types';

/** Vercel serverless function timeout (seconds). */
export const maxDuration = 60;

const VALID_FRAMEWORKS: Framework[] = [
  'html-tailwind',
  'react',
  'vue',
  'plain-html',
];

/**
 * POST /api/generate
 *
 * Core screenshot-to-code generation endpoint. Accepts a base64 image and a
 * framework, then streams generated code back via Server-Sent Events.
 *
 * Request body: `{ image: string (base64), framework: Framework }`
 *
 * SSE events:
 *   - `{ type: 'token', data: string }` — individual code token
 *   - `{ type: 'complete', data: string, generationId: string, modelUsed: string, latencyMs: number }` — full code
 *   - `{ type: 'error', data: string }` — error message
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse & validate request body
  let body: { image?: string; framework?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { image, framework } = body;

  if (!image || !framework) {
    return Response.json(
      { error: 'Missing required fields: image, framework' },
      { status: 400 }
    );
  }

  if (!VALID_FRAMEWORKS.includes(framework as Framework)) {
    return Response.json(
      { error: `Invalid framework. Must be one of: ${VALID_FRAMEWORKS.join(', ')}` },
      { status: 400 }
    );
  }

  // 3. Check daily generation limit
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

  // 4. Process image
  const imageBuffer = Buffer.from(image, 'base64');
  const imageBase64 = await preprocessScreenshot(imageBuffer);
  const imageHash = await hashImage(imageBuffer);

  // 5. Check cache — same image + framework = instant return
  const cacheKey = generateCacheKey(imageHash, framework);
  const cached = await getCachedGeneration(cacheKey);
  if (cached) {
    await incrementDailyUsage(userId, 0, 0);
    return Response.json({
      id: cached.id,
      code: cached.output_code,
      framework: cached.input_framework,
      modelUsed: cached.model_used,
      status: 'cached',
    });
  }

  // 6. Upload screenshot to R2 for history
  const imageUrl = await uploadToR2(
    imageBuffer,
    `screenshots/${userId}/${imageHash}.png`
  );

  // 7. Build prompt messages
  const messages = [
    { role: 'system' as const, content: getSystemPromptForFramework(framework) },
    buildUserMessage(imageBase64),
  ];

  // 8. Stream generation via SSE
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

          // Capture token usage if provided on the final chunk
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? 0;
            outputTokens = chunk.usage.completion_tokens ?? 0;
          }

          // Stream each token to the client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', data: content })}\n\n`
            )
          );
        }

        const latencyMs = Date.now() - startTime;
        const costUsd = calculateCost(modelUsed, inputTokens, outputTokens);

        // Post-process: sanitize and format
        let processedCode = sanitizeGeneratedCode(fullCode);
        processedCode = await formatCode(processedCode, framework);

        // 9. Save generation to DB
        const generation = await saveGeneration({
          userId,
          imageUrl,
          imageHash,
          framework,
          outputCode: processedCode,
          cacheKey,
          modelUsed,
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs,
        });

        // 10. Track daily usage
        await incrementDailyUsage(
          userId,
          inputTokens + outputTokens,
          costUsd
        );

        // Send completion event
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
          error instanceof Error ? error.message : 'Unknown generation error';

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
