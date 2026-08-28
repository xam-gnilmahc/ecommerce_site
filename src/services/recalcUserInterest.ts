import { supabase } from '../supaBaseClient';

/** Return type for the recalc RPC call */
export interface RecalcResult {
  data: unknown;
  error: { message: string } | null;
}

/**
 * Calls the Postgres RPC function `recalc_user_interest` to recalculate
 * a single user's interest scores. Should be invoked from a secure context
 * (server/edge function) or ensure the calling role has permission to run
 * the function and write to `public.user_interest`.
 */
export async function recalcUserInterest(userId: string): Promise<RecalcResult> {
  if (!userId) throw new Error('userId is required');

  const { data, error } = await supabase.rpc('recalc_user_interest', { p_user_id: userId });

  return { data, error };
}

export default recalcUserInterest;
