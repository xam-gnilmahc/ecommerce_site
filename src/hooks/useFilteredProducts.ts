import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

export interface Filters {
  brands: string[];
  category: string[];
  priceRange: [number, number] | null;
}

const fetchFilteredProducts = async (filters: Filters): Promise<Product[]> => {
  let query = supabase.from('products').select('*').limit(1000);

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

  if (error) throw new Error(error.message);

  return data ?? [];
};

export const useFilteredProducts = (filters: Filters, enabled: boolean = true) => {
  const hasFilters =
    filters.brands.length > 0 || filters.category.length > 0 || filters.priceRange !== null;

  return useQuery<Product[], Error>({
    queryKey: ['filteredProducts', filters],
    queryFn: () => fetchFilteredProducts(filters),
    enabled: enabled && hasFilters,
    staleTime: 5 * 60 * 1000,
  });
};
