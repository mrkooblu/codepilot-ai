import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGeneration } from '@/lib/db/generations';

/**
 * GET /api/generations/[id]
 *
 * Returns a single generation by ID, including the full generated code.
 * Scoped to the authenticated user — you can only view your own generations.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return Response.json({ error: 'Missing generation ID' }, { status: 400 });
  }

  try {
    const generation = await getGeneration(id, userId);

    if (!generation) {
      return Response.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    return Response.json(generation);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch generation';
    return Response.json({ error: message }, { status: 500 });
  }
}
