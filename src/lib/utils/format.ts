import * as prettier from 'prettier';
import type { Framework } from '@/lib/ai/types';

/**
 * Formats generated code with Prettier for consistent, clean output.
 *
 * Picks the appropriate Prettier parser based on the target framework.
 * If formatting fails (e.g. syntactically broken code), returns the
 * original unformatted code silently.
 *
 * @param code - The raw generated code string.
 * @param framework - The target framework identifier.
 * @returns The formatted code, or the original if formatting fails.
 */
export async function formatCode(
  code: string,
  framework: Framework | string
): Promise<string> {
  const parser = getParserForFramework(framework);

  try {
    return await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      printWidth: 100,
      // For HTML files, preserve attribute formatting
      htmlWhitespaceSensitivity: 'ignore',
    });
  } catch {
    // If Prettier can't parse it, return as-is -- better than crashing
    return code;
  }
}

/**
 * Maps a framework to the correct Prettier parser name.
 */
function getParserForFramework(framework: string): string {
  switch (framework) {
    case 'html-tailwind':
    case 'plain-html':
      return 'html';
    case 'react':
      return 'typescript';
    case 'vue':
      return 'vue';
    default:
      return 'html';
  }
}
