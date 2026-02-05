import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Rate Limiter (Upstash Redis)
// ---------------------------------------------------------------------------

/**
 * Sliding-window rate limiter: 10 requests per minute per user on
 * generation endpoints. Only initialized if Upstash env vars are present.
 */
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
      })
    : null;

// ---------------------------------------------------------------------------
// Route Matchers
// ---------------------------------------------------------------------------

/** Routes that require authentication. */
const isProtectedRoute = createRouteMatcher([
  '/api/generate(.*)',
  '/api/generations(.*)',
  '/api/usage(.*)',
  '/api/stripe/create-checkout(.*)',
  '/dashboard(.*)',
]);

/** Routes that should be publicly accessible (no auth redirect). */
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/api/health(.*)',
  '/api/webhooks/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

/** Routes subject to per-user rate limiting. */
const isRateLimitedRoute = createRouteMatcher(['/api/generate(.*)']);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Protect authenticated routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Apply rate limiting on generation endpoints
  if (isRateLimitedRoute(req) && ratelimit) {
    const { userId } = await auth();
    const identifier =
      userId ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'anonymous';

    const { success, limit, remaining, reset } =
      await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please slow down.',
          limit,
          remaining: 0,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Attach rate limit headers to the response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all routes except static files and Next.js internals:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
