import { supabase } from '../supaBaseClient';

/**
 * Call the Postgres function to recalculate a single user's interest.
 * Note: This should be invoked from a secure context (server/edge function) or
 * ensure the calling role has permission to run the function and write to
 * `public.user_interest` (RLS considerations).
 *
 * @param {string} userId - the user's UUID string
 * @returns {Promise<{ error: object|null, data: any }>} result
 */
export async function recalcUserInterest(userId) {
  if (!userId) throw new Error('userId is required');

  // Supabase RPC calls a Postgres function named `recalc_user_interest`
  const { data, error } = await supabase.rpc('recalc_user_interest', { p_user_id: userId });

  return { data, error };
}

export default recalcUserInterest;
