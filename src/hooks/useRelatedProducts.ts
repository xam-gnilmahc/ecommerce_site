import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

const fetchRelatedProducts = async ({
  brand,
  category,
}: {
  brand: string;
  category: string;
}): Promise<Product[]> => {
  if (!brand && !category) return [];

  const query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('brand', brand)
    .eq('category', category)
    .limit(12);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const useRelatedProducts = (
  brand: string | undefined,
  category: string | undefined,
  enabled: boolean = true
) => {
  return useQuery<Product[], Error>({
    queryKey: ['relatedProducts', brand, category],
    queryFn: () => fetchRelatedProducts({ brand: brand!, category: category! }),
    enabled: enabled && (!!brand || !!category),
    staleTime: 5 * 60 * 1000,
  });
};
