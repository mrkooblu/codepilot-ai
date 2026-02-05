/** Supported output frameworks for code generation. */
export type Framework = 'html-tailwind' | 'react' | 'vue' | 'plain-html';

/** Result returned from a screenshot-to-code generation. */
export interface GenerationResult {
  code: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

/** Options passed to the model generation call. */
export interface GenerationOptions {
  maxTokens: number;
  temperature: number;
}
