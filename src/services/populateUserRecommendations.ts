import { supabase } from '../supaBaseClient';

/** Return type for the recommendation RPC call */
export interface RecommendationResult {
  data: unknown;
  error: { message: string } | null;
}

/**
 * Calls the Postgres RPC function `recommend_products_for_user` to populate
 * personalized product recommendations for a given user. Runs server-side
 * or requires appropriate GRANT/RLS permissions for client calls.
 */
export async function populateUserRecommendations(
  userId: string,
  perCategoryLimit: number = 5
): Promise<RecommendationResult> {
  if (!userId) throw new Error('userId required');

  const { data, error } = await supabase.rpc('recommend_products_for_user', {
    p_user_id: userId,
    p_per_category_limit: perCategoryLimit,
  });

  return { data, error };
}

export default populateUserRecommendations;
