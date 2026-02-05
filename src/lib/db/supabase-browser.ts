import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client (singleton).
 *
 * Uses the public anon key -- all queries are subject to Row Level Security.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
