import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { listGenerations } from '@/lib/db/generations';

/**
 * GET /api/generations
 *
 * Returns a paginated list of the authenticated user's generations,
 * sorted by `created_at` descending (newest first).
 *
 * Query params:
 *   - `limit` (number, default 20, max 100)
 *   - `offset` (number, default 0)
 *   - `framework` (optional filter: html-tailwind | react | vue | plain-html)
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 1),
    100
  );
  const offset = Math.max(
    parseInt(searchParams.get('offset') ?? '0', 10) || 0,
    0
  );
  const framework = searchParams.get('framework') ?? undefined;

  try {
    const result = await listGenerations(userId, limit, offset, framework);

    return Response.json({
      data: result.data,
      total: result.count,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to list generations';
    return Response.json({ error: message }, { status: 500 });
  }
}
