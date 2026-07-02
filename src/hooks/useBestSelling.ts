import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

interface BestSellingItem {
  id: number;
  product_id: number;
  products: Product;
}

const fetchBestSellingProducts = async (): Promise<BestSellingItem[]> => {
  const { data, error } = await supabase
    .from('best_selling_product')
    .select(`*, products:product_id (*)`);

  if (error) throw new Error(error.message);
  return data;
};

export const useBestSelling = () => {
  return useQuery<BestSellingItem[], Error>({
    queryKey: ['bestSelling'],
    queryFn: fetchBestSellingProducts,
    staleTime: 10 * 60 * 1000,
  });
};

const fetchRecentlyVisited = async (productIds: number[]): Promise<Product[]> => {
  if (!productIds || productIds.length === 0) return [];

  const { data, error } = await supabase.from('products').select('*').in('id', productIds);

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const useRecentlyVisited = (productIds: number[] | undefined) => {
  return useQuery<Product[], Error>({
    queryKey: ['recentlyVisited', productIds],
    queryFn: () => fetchRecentlyVisited(productIds!),
    enabled: !!productIds && productIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
