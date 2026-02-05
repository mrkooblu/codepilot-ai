import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Lazily-initialized Cloudflare R2 client (S3-compatible).
 *
 * Configured via environment variables:
 *  - R2_ENDPOINT
 *  - R2_ACCESS_KEY_ID
 *  - R2_SECRET_ACCESS_KEY
 *  - R2_BUCKET_NAME
 *
 * Lazy initialization prevents build-time failures when env vars are absent.
 */
let _r2: S3Client | null = null;

function getR2(): S3Client {
  if (!_r2) {
    _r2 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2;
}

function getBucket(): string {
  return process.env.R2_BUCKET_NAME!;
}

/**
 * Uploads a file buffer to Cloudflare R2 and returns its public URL.
 *
 * @param buffer - The raw file data.
 * @param key - The storage key / path (e.g. `screenshots/user123/hash.png`).
 * @returns The public URL for the uploaded object.
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string
): Promise<string> {
  const contentType = key.endsWith('.png')
    ? 'image/png'
    : key.endsWith('.jpg') || key.endsWith('.jpeg')
      ? 'image/jpeg'
      : key.endsWith('.webp')
        ? 'image/webp'
        : 'application/octet-stream';

  await getR2().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  // R2 public URL follows the pattern: https://<custom-domain>/<key>
  // or the default: https://<account-id>.r2.cloudflarestorage.com/<bucket>/<key>
  // Use the R2_PUBLIC_URL env var if set, otherwise construct from endpoint.
  const publicBase =
    process.env.R2_PUBLIC_URL ??
    `${process.env.R2_ENDPOINT!}/${getBucket()}`;

  return `${publicBase}/${key}`;
}

/**
 * Generates a time-limited signed URL for downloading an object from R2.
 *
 * @param key - The storage key.
 * @param expiresIn - URL validity in seconds (default: 1 hour).
 * @returns A pre-signed download URL.
 */
export async function getSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  return awsGetSignedUrl(getR2(), command, { expiresIn });
}
