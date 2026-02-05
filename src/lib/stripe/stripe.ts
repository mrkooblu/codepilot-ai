import Stripe from 'stripe';

/**
 * Lazily-initialized Stripe client singleton.
 *
 * Uses `STRIPE_SECRET_KEY` from environment. Never import this file on the
 * client side.
 *
 * The client is created on first access (not at module evaluation) so that
 * `next build` can statically analyze routes without requiring env vars to
 * be present at build time.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use `getStripe()` instead. Kept for backwards-compat. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});

/**
 * Creates a Stripe Checkout Session for subscribing to the Pro plan.
 *
 * @param userId - Clerk user ID, stored as metadata for webhook reconciliation.
 * @param priceId - The Stripe Price ID for the subscription (e.g. `price_xxx`).
 * @param successUrl - Redirect URL after successful payment.
 * @param cancelUrl - Redirect URL if the user cancels checkout.
 * @returns The Stripe Checkout Session object.
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      clerk_user_id: userId,
    },
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },
  });
}

/**
 * Creates a Stripe Customer Portal session so users can manage their
 * subscription (cancel, update payment method, view invoices).
 *
 * @param customerId - The Stripe Customer ID.
 * @param returnUrl - URL to redirect back to after the portal session.
 * @returns The Stripe Billing Portal Session object.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Retrieves a subscription by its ID.
 *
 * @param subscriptionId - The Stripe Subscription ID.
 * @returns The Stripe Subscription object.
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}
