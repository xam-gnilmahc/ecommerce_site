import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

const fetchAllProducts = async (): Promise<Product[]> => {
  let allProducts: Product[] = [];
  const batchSize = 1000;
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('brand', 'Apple')
      .range(start, start + batchSize - 1);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      allProducts = allProducts.concat(data);
      start += batchSize;
      if (data.length < batchSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  return allProducts;
};

export const useProducts = (enabled: boolean = true) => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchAllProducts,
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};
