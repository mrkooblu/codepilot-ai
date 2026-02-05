import type { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { createServerClient } from '@/lib/db/supabase-server';

/** Clerk webhook event payload shapes we handle. */
interface ClerkUserData {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

/**
 * POST /api/webhooks/clerk
 *
 * Receives Clerk webhook events and syncs user data to Supabase.
 * Handles `user.created` and `user.updated` events.
 *
 * Webhook signature is verified using the Svix library.
 */
export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get raw body and headers for verification
  const body = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return Response.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }

  // Process the event
  const { type, data } = event;

  if (type === 'user.created' || type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address;
    const name = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() || null;

    if (!email) {
      console.error('Clerk user has no email address:', data.id);
      return Response.json({ received: true });
    }

    const supabase = createServerClient();

    // Upsert user — insert on first creation, update on subsequent changes
    const { error } = await supabase.from('users').upsert(
      {
        clerk_id: data.id,
        email,
        name,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'clerk_id',
      }
    );

    if (error) {
      console.error('Failed to upsert user:', error);
      return Response.json(
        { error: 'Failed to sync user' },
        { status: 500 }
      );
    }
  }

  return Response.json({ received: true });
}
