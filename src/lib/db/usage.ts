import { createServerClient } from './supabase-server';

/** Result of a daily limit check. */
export interface DailyLimitResult {
  allowed: boolean;
  limit: number;
  used: number;
  plan: string;
}

/** Plan-specific daily generation caps. */
const DAILY_LIMITS: Record<string, number> = {
  free: 5,   // Landing page advertises 5/day for free tier
  pro: 1000, // Soft cap for abuse prevention
  team: 1000,
};

/**
 * Checks whether a user is allowed to create another generation today.
 *
 * Free tier: 5 generations per day.
 * Pro / Team: unlimited (soft cap at 1,000/day for abuse detection).
 *
 * @param clerkId - The Clerk user ID.
 */
export async function checkDailyLimit(
  clerkId: string
): Promise<DailyLimitResult> {
  const supabase = createServerClient();

  // Look up the user's plan
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, plan')
    .eq('clerk_id', clerkId)
    .single();

  if (userError || !user) {
    // If user doesn't exist yet, treat as free tier with 0 usage
    return { allowed: true, limit: DAILY_LIMITS.free, used: 0, plan: 'free' };
  }

  const plan = user.plan ?? 'free';
  const limit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free;

  // Get today's usage count
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { data: usage } = await supabase
    .from('usage_daily')
    .select('generations_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  const used = usage?.generations_count ?? 0;

  // Pro users are always allowed (soft cap is for monitoring only)
  if (plan === 'pro' || plan === 'team') {
    return { allowed: true, limit, used, plan };
  }

  return {
    allowed: used < limit,
    limit,
    used,
    plan,
  };
}

/**
 * Increments the daily usage counter for a user, upserting the `usage_daily`
 * row for today.
 *
 * @param clerkId - The Clerk user ID.
 * @param tokensUsed - Total tokens consumed in this generation.
 * @param costUsd - Cost in USD for this generation.
 */
export async function incrementDailyUsage(
  clerkId: string,
  tokensUsed: number,
  costUsd: number
): Promise<void> {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return;

  const today = new Date().toISOString().slice(0, 10);

  // Try to fetch existing row for today
  const { data: existing } = await supabase
    .from('usage_daily')
    .select('id, generations_count, tokens_used, cost_usd')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    // Update existing row
    await supabase
      .from('usage_daily')
      .update({
        generations_count: (existing.generations_count ?? 0) + 1,
        tokens_used: (existing.tokens_used ?? 0) + tokensUsed,
        cost_usd: (existing.cost_usd ?? 0) + costUsd,
      })
      .eq('id', existing.id);
  } else {
    // Insert new row for today
    await supabase.from('usage_daily').insert({
      user_id: user.id,
      date: today,
      generations_count: 1,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    });
  }
}

/**
 * Retrieves current usage stats for the usage API endpoint.
 *
 * @param clerkId - The Clerk user ID.
 */
export async function getUsageStats(clerkId: string): Promise<{
  plan: string;
  dailyGenerations: number;
  dailyLimit: number;
  subscriptionStatus: string | null;
}> {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, plan, stripe_subscription_status')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) {
    return {
      plan: 'free',
      dailyGenerations: 0,
      dailyLimit: DAILY_LIMITS.free,
      subscriptionStatus: null,
    };
  }

  const plan = user.plan ?? 'free';
  const today = new Date().toISOString().slice(0, 10);

  const { data: usage } = await supabase
    .from('usage_daily')
    .select('generations_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  return {
    plan,
    dailyGenerations: usage?.generations_count ?? 0,
    dailyLimit: DAILY_LIMITS[plan] ?? DAILY_LIMITS.free,
    subscriptionStatus: user.stripe_subscription_status ?? null,
  };
}
