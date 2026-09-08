import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

export const useUserRecommendations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      if (!userId) throw new Error('userId required');

      const { data: recs, error: recErr } = await supabase
        .from('user_recommendations')
        .select('product_id, score')
        .eq('user_id', userId)
        .order('score', { ascending: false });

      if (recErr) throw recErr;
      if (!recs || recs.length === 0) return [];

      const ids = recs.map((r) => r.product_id).filter(Boolean);
      if (ids.length === 0) return [];

      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (prodErr) throw prodErr;

      const scoreById = new Map(recs.map((r) => [String(r.product_id), r.score]));
      const productById = new Map((products || []).map((p) => [String(p.id), p]));

      const ordered = ids
        .map((id) => {
          const key = String(id);
          const prod = productById.get(key);
          if (!prod) return null;
          return { ...prod, _recommendationScore: scoreById.get(key) };
        })
        .filter(Boolean);

      return ordered;
    },
    enabled: !!userId,
  });
};
