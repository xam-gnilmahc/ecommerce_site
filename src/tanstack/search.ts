import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const raw = searchTerm.trim();
      if (!raw) return [];

      const { data, error } = await supabase.rpc('search_products', {
        query_text: raw,
      });

      if (error) throw error;
      return (data ?? []) as Product[];
    },
    enabled: searchTerm.trim().length > 0,
  });
};
