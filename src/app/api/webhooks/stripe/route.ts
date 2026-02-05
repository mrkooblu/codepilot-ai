import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/stripe';
import { createServerClient } from '@/lib/db/supabase-server';

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe subscription lifecycle webhooks:
 *   - `checkout.session.completed` — user subscribed, upgrade to Pro
 *   - `customer.subscription.updated` — plan change or renewal
 *   - `customer.subscription.deleted` — cancellation, downgrade to free
 *   - `invoice.payment_failed` — mark subscription as past_due
 *
 * Webhook signature is verified using the Stripe SDK.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return Response.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Stripe webhook verification failed:', err);
    return Response.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionStatus(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return Response.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * User completed checkout — upgrade their plan to Pro and store Stripe IDs.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const clerkUserId = session.metadata?.clerk_user_id;
  if (!clerkUserId) {
    console.error('No clerk_user_id in checkout session metadata');
    return;
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  const supabase = createServerClient();

  const { error } = await supabase
    .from('users')
    .update({
      plan: 'pro',
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
      stripe_subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkUserId);

  if (error) {
    console.error('Failed to update user plan after checkout:', error);
    throw error;
  }
}

/**
 * Subscription updated — sync status (active, past_due, etc.) to Supabase.
 */
async function syncSubscriptionStatus(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = createServerClient();

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  // Determine plan from subscription status
  const status = subscription.status;
  const plan =
    status === 'active' || status === 'trialing' ? 'pro' : 'free';

  const { error } = await supabase
    .from('users')
    .update({
      plan,
      stripe_subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to sync subscription status:', error);
    throw error;
  }
}

/**
 * Subscription deleted (canceled) — downgrade to free.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = createServerClient();

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const { error } = await supabase
    .from('users')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
      stripe_subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to downgrade user after subscription deletion:', error);
    throw error;
  }
}

/**
 * Invoice payment failed — mark subscription as past_due.
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const supabase = createServerClient();

  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const { error } = await supabase
    .from('users')
    .update({
      stripe_subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to mark subscription as past_due:', error);
    throw error;
  }
}
