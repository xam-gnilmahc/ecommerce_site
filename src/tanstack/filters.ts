import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

// distinct brands — optionally only brands that actually have products in the
// given category (used by the navbar hover filter popup)
export const useBrandOptions = (searchTerm?: string) => {
  const term = (searchTerm || '').replace(/[%(),]/g, ' ').trim();

  return useQuery({
    queryKey: ['products', 'brand-options', term],
    queryFn: async () => {
      let query = supabase.from('products').select('brand').limit(5000);
      if (term) {
        // direct category column only — no type/name matching
        query = query.ilike('category', `%${term}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const set = new Set(
        (data || [])
          .map((r: { brand?: string | null }) => (r.brand || '').trim())
          .filter(Boolean)
      );
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFilteredProducts = (filters: {
  searchTerm?: string;
  brands: string[];
  category?: string[];
  priceRange: [number, number] | null;
}) => {
  return useQuery({
    queryKey: ['products', 'filtered', filters],
    queryFn: async () => {
      const term = (filters.searchTerm || '').replace(/[%(),]/g, ' ').trim();

      let query = supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(1000);

      if (term) {
        // the term is a category — filter the category column directly
        query = query.ilike('category', `%${term}%`);
      }
      if (filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }
      if (filters.category && filters.category.length > 0) {
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
      (filters.searchTerm || '').trim().length > 0 ||
      filters.brands.length > 0 ||
      (filters.category && filters.category.length > 0) ||
      filters.priceRange !== null,
  });
};
