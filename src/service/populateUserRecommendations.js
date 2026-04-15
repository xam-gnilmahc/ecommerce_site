import { supabase } from '../supaBaseClient';

/**
 * Call Postgres function to populate recommendations for a user.
 * Use server-side or ensure appropriate GRANT/RLS for client calls.
 */
export async function populateUserRecommendations(userId, perCategoryLimit = 5) {
  if (!userId) throw new Error('userId required');

  const { data, error } = await supabase.rpc('recommend_products_for_user', {
    p_user_id: userId,
    p_per_category_limit: perCategoryLimit,
  });

  return { data, error };
}

export default populateUserRecommendations;
