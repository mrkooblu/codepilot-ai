import { createHash } from 'crypto';
import sharp from 'sharp';

/**
 * Hashes the visual content of an image (not the file bytes).
 *
 * Normalizes to 512px raw pixels so that different compressions of the
 * same visual produce identical hashes.
 */
export async function hashImage(buffer: Buffer): Promise<string> {
  const normalized = await sharp(buffer)
    .resize(512, null, { withoutEnlargement: true, fit: 'inside' })
    .raw()
    .toBuffer();

  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generates a deterministic cache key from an image hash and framework.
 *
 * Same image + same framework always maps to the same cache key.
 */
export function generateCacheKey(
  imageHash: string,
  framework: string
): string {
  return createHash('sha256')
    .update(`${imageHash}:${framework}`)
    .digest('hex');
}
