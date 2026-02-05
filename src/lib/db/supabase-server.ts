import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client configured with the service role key for
 * privileged server-side operations (bypasses RLS).
 *
 * This should ONLY be used in API routes and server actions -- never
 * expose the service role key to the browser.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
