import OpenAI from 'openai';

/**
 * Lazily-initialized Kimi K2.5 client using the OpenAI-compatible Moonshot API.
 *
 * Requires the `MOONSHOT_API_KEY` environment variable to be set.
 * Lazy initialization prevents build-time failures when env vars are absent.
 */
let _kimiClient: OpenAI | null = null;

export function getKimiClient(): OpenAI {
  if (!_kimiClient) {
    _kimiClient = new OpenAI({
      apiKey: process.env.MOONSHOT_API_KEY!,
      baseURL: 'https://api.moonshot.ai/v1',
    });
  }
  return _kimiClient;
}

/** @deprecated Use `getKimiClient()` instead. */
export const kimiClient = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getKimiClient(), prop, receiver);
  },
});
