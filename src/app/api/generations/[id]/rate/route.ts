import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateGeneration } from '@/lib/db/generations';

/**
 * POST /api/generations/[id]/rate
 *
 * Adds a thumbs-up (+1) or thumbs-down (-1) quality rating to a generation.
 * Used for quality tracking and kill criteria instrumentation.
 *
 * Request body: `{ rating: 1 | -1 }`
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: { rating?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { rating } = body;

  if (rating !== 1 && rating !== -1) {
    return Response.json(
      { error: 'Rating must be 1 (thumbs up) or -1 (thumbs down)' },
      { status: 400 }
    );
  }

  try {
    await rateGeneration(id, userId, rating as 1 | -1);
    return Response.json({ success: true, rating });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to rate generation';
    return Response.json({ error: message }, { status: 500 });
  }
}
