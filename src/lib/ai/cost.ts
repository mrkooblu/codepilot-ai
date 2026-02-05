/** Per-model pricing in USD per million tokens. */
const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  'kimi-k2.5': {
    inputPerM: 0.60,
    outputPerM: 2.50,
  },
  'claude-sonnet-4': {
    inputPerM: 3.00,
    outputPerM: 15.00,
  },
};

/**
 * Calculates the cost of a generation in USD.
 *
 * @param model - The model identifier (e.g. `kimi-k2.5`, `claude-sonnet-4`).
 * @param inputTokens - Number of input/prompt tokens consumed.
 * @param outputTokens - Number of output/completion tokens generated.
 * @returns Cost in USD, rounded to 6 decimal places.
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    console.warn(`Unknown model "${model}" for cost calculation, returning 0`);
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerM;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerM;

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
