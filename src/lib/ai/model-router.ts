import OpenAI from 'openai';
import type { GenerationOptions } from './types';
import { getKimiClient } from './kimi';

/**
 * Lazily-initialized Claude Sonnet 4 client via the Anthropic OpenAI-compatible endpoint.
 *
 * Requires the `ANTHROPIC_API_KEY` environment variable to be set.
 * Lazy initialization prevents build-time failures when env vars are absent.
 */
let _anthropicClient: OpenAI | null = null;

function getAnthropicClient(): OpenAI {
  if (!_anthropicClient) {
    _anthropicClient = new OpenAI({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      baseURL: 'https://api.anthropic.com/v1',
    });
  }
  return _anthropicClient;
}

/**
 * Attempts generation with Kimi K2.5 first, falling back to Claude Sonnet 4
 * if Kimi is unavailable or errors out.
 *
 * @returns The SSE stream and the model identifier that was used.
 */
export async function generateWithFallback(
  messages: OpenAI.ChatCompletionMessageParam[],
  options: GenerationOptions
): Promise<{ stream: OpenAI.Chat.Completions.ChatCompletion & { [Symbol.asyncIterator](): AsyncIterableIterator<OpenAI.Chat.Completions.ChatCompletionChunk> }; modelUsed: string }> {
  // Try Kimi K2.5 first (cheapest, fastest)
  try {
    const stream = await getKimiClient().chat.completions.create({
      model: 'kimi-k2.5',
      messages,
      stream: true,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    });

    return { stream: stream as any, modelUsed: 'kimi-k2.5' };
  } catch (error) {
    console.error('Kimi K2.5 failed, falling back to Claude Sonnet 4:', error);
  }

  // Fallback to Claude Sonnet 4
  const stream = await getAnthropicClient().chat.completions.create({
    model: 'claude-sonnet-4-20250514',
    messages,
    stream: true,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
  });

  return { stream: stream as any, modelUsed: 'claude-sonnet-4' };
}
