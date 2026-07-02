import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

const fetchUserRecommendations = async (userId: string): Promise<Product[]> => {
  if (!userId) throw new Error('userId required');

  const { data: recs, error: recErr } = await supabase
    .from('user_recommendations')
    .select('product_id, score')
    .eq('user_id', userId)
    .order('score', { ascending: false });

  if (recErr) throw new Error(recErr.message || 'Failed to load recommendations');

  if (!recs || recs.length === 0) return [];

  const ids = recs.map((r) => r.product_id).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);

  if (prodErr) throw new Error(prodErr.message || 'Failed to load products for recommendations');

  const scoreById = new Map(recs.map((r) => [String(r.product_id), r.score]));
  const productById = new Map((products || []).map((p) => [String(p.id), p]));

  return ids
    .map((id) => {
      const key = String(id);
      const prod = productById.get(key);
      if (!prod) return null;
      return { ...prod, _recommendationScore: scoreById.get(key) };
    })
    .filter(Boolean) as Product[];
};

export const useRecommendations = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<Product[], Error>({
    queryKey: ['recommendations', userId],
    queryFn: () => fetchUserRecommendations(userId!),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
