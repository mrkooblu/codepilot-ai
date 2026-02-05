import { createServerClient } from './supabase-server';
import type { Framework } from '@/lib/ai/types';

/** Shape of a generation row returned from Supabase. */
export interface Generation {
  id: string;
  user_id: string;
  input_image_url: string;
  input_image_hash: string;
  input_framework: string;
  input_refinement_prompt: string | null;
  output_code: string | null;
  cache_key: string | null;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_cost_usd: number | null;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  parent_generation_id: string | null;
  iteration_number: number;
  quality_rating: number | null;
  collection_id: string | null;
  created_at: string;
}

/** Data required to insert a new generation. */
export interface SaveGenerationInput {
  userId: string;
  imageUrl: string;
  imageHash: string;
  framework: Framework | string;
  outputCode: string;
  cacheKey: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  parentGenerationId?: string;
  iterationNumber?: number;
  refinementPrompt?: string;
}

/**
 * Inserts a completed generation into the `generations` table.
 *
 * @returns The newly created generation row.
 */
export async function saveGeneration(
  data: SaveGenerationInput
): Promise<Generation> {
  const supabase = createServerClient();

  // Resolve the internal user UUID from the Clerk ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', data.userId)
    .single();

  if (userError || !user) {
    throw new Error(`User not found for clerk_id: ${data.userId}`);
  }

  const { data: generation, error } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      input_image_url: data.imageUrl,
      input_image_hash: data.imageHash,
      input_framework: data.framework,
      input_refinement_prompt: data.refinementPrompt ?? null,
      output_code: data.outputCode,
      cache_key: data.cacheKey,
      model_used: data.modelUsed,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      total_cost_usd: data.costUsd,
      latency_ms: data.latencyMs,
      status: 'completed',
      parent_generation_id: data.parentGenerationId ?? null,
      iteration_number: data.iterationNumber ?? 1,
    })
    .select()
    .single();

  if (error || !generation) {
    throw new Error(`Failed to save generation: ${error?.message}`);
  }

  return generation as Generation;
}

/**
 * Retrieves a single generation by ID, scoped to a specific user (Clerk ID).
 */
export async function getGeneration(
  id: string,
  userId: string
): Promise<Generation | null> {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) return null;

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data as Generation;
}

/**
 * Returns a paginated list of generations for a user, sorted newest first.
 *
 * @param userId - Clerk user ID.
 * @param limit - Maximum rows to return (default 20).
 * @param offset - Number of rows to skip (default 0).
 * @param framework - Optional framework filter.
 */
export async function listGenerations(
  userId: string,
  limit = 20,
  offset = 0,
  framework?: string
): Promise<{ data: Generation[]; count: number }> {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) return { data: [], count: 0 };

  let query = supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (framework) {
    query = query.eq('input_framework', framework);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to list generations: ${error.message}`);
  }

  return { data: (data ?? []) as Generation[], count: count ?? 0 };
}

/**
 * Sets a thumbs-up (+1) or thumbs-down (-1) rating on a generation.
 */
export async function rateGeneration(
  id: string,
  userId: string,
  rating: 1 | -1
): Promise<void> {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');

  const { error } = await supabase
    .from('generations')
    .update({ quality_rating: rating })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to rate generation: ${error.message}`);
  }
}

/**
 * Looks up a completed generation by its cache key for deduplication.
 *
 * @returns The cached generation if found, or `null`.
 */
export async function getCachedGeneration(
  cacheKey: string
): Promise<Generation | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('cache_key', cacheKey)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Generation;
}
