import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCheckoutSession } from '@/lib/stripe/stripe';

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for the Pro subscription plan.
 * Redirects the user to Stripe's hosted checkout page.
 *
 * Request body: `{ priceId: string }`
 *
 * Returns: `{ url: string }` — the Stripe Checkout URL.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { priceId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { priceId } = body;

  if (!priceId) {
    return Response.json(
      { error: 'Missing required field: priceId' },
      { status: 400 }
    );
  }

  try {
    const origin = req.nextUrl.origin;
    const session = await createCheckoutSession(
      userId,
      priceId,
      `${origin}/dashboard?checkout=success`,
      `${origin}/pricing?checkout=cancel`
    );

    if (!session.url) {
      return Response.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create checkout session';
    return Response.json({ error: message }, { status: 500 });
  }
}
