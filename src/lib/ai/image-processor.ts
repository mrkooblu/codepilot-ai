import sharp from 'sharp';

/**
 * Preprocesses a screenshot buffer for optimal AI vision model consumption.
 *
 * - Resizes to 2048px max dimension (without enlargement).
 * - Compresses as PNG quality 85.
 * - If the result exceeds 4 MB, re-compresses as JPEG at 1536px.
 *
 * @returns A base64 data URI string (e.g. `data:image/png;base64,...`).
 */
export async function preprocessScreenshot(buffer: Buffer): Promise<string> {
  const processed = await sharp(buffer)
    .resize(2048, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .png({ quality: 85, compressionLevel: 6 })
    .toBuffer();

  // Kimi K2.5 accepts up to 20 MB but smaller = cheaper input tokens
  if (processed.length > 4 * 1024 * 1024) {
    const recompressed = await sharp(buffer)
      .resize(1536, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    return `data:image/jpeg;base64,${recompressed.toString('base64')}`;
  }

  return `data:image/png;base64,${processed.toString('base64')}`;
}
