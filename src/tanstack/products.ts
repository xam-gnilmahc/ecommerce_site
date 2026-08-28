import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

export const useProducts = (brand = 'Apple') => {
  return useQuery({
    queryKey: ['products', brand],
    queryFn: async () => {
      let allProducts: Product[] = [];
      let batchSize = 1000;
      let start = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('brand', brand)
          .range(start, start + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allProducts = allProducts.concat(data);
          start += batchSize;
          if (data.length < batchSize) hasMore = false;
        } else {
          hasMore = false;
        }
      }
      return allProducts;
    },
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_items(id, size, sku_number, color),
          product_images(id, image_url, is_primary),
          product_reviews(
            id, user_id, picture, comment, rating, created_at,
            users(id, name, email, profile)
          )
        `
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useBestSellingProducts = () => {
  return useQuery({
    queryKey: ['products', 'best-selling'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('best_selling_product')
        .select(`*, products:product_id (*)`);
      if (error) throw error;
      return data;
    },
  });
};

export const useRecentlyViewedProducts = (productIds: string[] | undefined) => {
  return useQuery({
    queryKey: ['products', 'recently-viewed', productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', productIds);
      if (error) throw error;
      const reversed = [...productIds].reverse();
      return reversed.map((id) => data.find((p) => p.id === id)).filter(Boolean);
    },
    enabled: !!productIds && productIds.length > 0,
  });
};

export const useProductInventory = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['inventory', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('product_id', productId)
        .single();
      if (error || !data) return 0;
      return data.stock_quantity;
    },
    enabled: !!productId,
  });
};

export const useProductsInventory = (productIds: string[]) => {
  return useQuery({
    queryKey: ['inventory', 'batch', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      const { data, error } = await supabase
        .from('inventory')
        .select('product_id, stock_quantity')
        .in('product_id', productIds);
      if (error || !data) return {};
      const map: Record<string, number> = {};
      data.forEach((d) => {
        map[d.product_id] = d.stock_quantity;
      });
      return map;
    },
    enabled: productIds.length > 0,
  });
};
