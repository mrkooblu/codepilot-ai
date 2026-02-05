/**
 * Sanitizes AI-generated code by stripping potentially dangerous patterns.
 *
 * Targets:
 * - `document.cookie` access
 * - `window.parent`, `window.top`, `window.opener` (iframe escape attempts)
 * - `localStorage` / `sessionStorage` access
 * - `eval()` calls
 * - `new Function()` constructor
 *
 * These are stripped because generated code runs in a sandboxed iframe;
 * removing them provides defense-in-depth against prompt injection
 * producing malicious output.
 *
 * @param code - The raw generated code string.
 * @returns Sanitized code with dangerous patterns replaced by comments.
 */
export function sanitizeGeneratedCode(code: string): string {
  return code
    .replace(/document\.cookie/g, '/* blocked */')
    .replace(/window\.(parent|top|opener)/g, '/* blocked */')
    .replace(/localStorage|sessionStorage/g, '/* blocked */')
    .replace(/eval\s*\(/g, '/* blocked */(')
    .replace(/new\s+Function\s*\(/g, '/* blocked */(');
}
