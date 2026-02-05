import { auth } from '@clerk/nextjs/server';
import { getUsageStats } from '@/lib/db/usage';

/**
 * GET /api/usage
 *
 * Returns the authenticated user's current usage statistics:
 * plan, daily generation count, daily limit, and subscription status.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getUsageStats(userId);
    return Response.json(stats);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch usage stats';
    return Response.json({ error: message }, { status: 500 });
  }
}
