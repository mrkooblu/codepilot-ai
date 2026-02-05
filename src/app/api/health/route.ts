/**
 * GET /api/health
 *
 * Simple uptime check endpoint. Returns 200 with a timestamp.
 * Used by Better Stack (or similar) for availability monitoring.
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
