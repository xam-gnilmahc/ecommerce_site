import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

export const useFilteredProducts = (filters: {
  brands: string[];
  category: string[];
  priceRange: [number, number] | null;
}) => {
  return useQuery({
    queryKey: ['products', 'filtered', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(1000);

      if (filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }
      if (filters.category.length > 0) {
        query = query.in('category', filters.category);
      }
      if (filters.priceRange && filters.priceRange.length === 2) {
        const min = Number(filters.priceRange[0]);
        const max = Number(filters.priceRange[1]);
        query = query.gte('amount', min).lte('amount', max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled:
      filters.brands.length > 0 || filters.category.length > 0 || filters.priceRange !== null,
  });
};
