import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';

export interface ProductDetail {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  type?: string | null;
  created_at?: string | null;
  is_active?: boolean;
  amount?: string | null;
  banner_url?: string | null;
  details_banner?: string | null;
  product_items?: Array<{
    id: number;
    size: string;
    sku_number: string;
    color: string;
  }>;
  product_images?: Array<{
    id: number;
    image_url: string;
    is_primary: boolean;
  }>;
  product_reviews?: Array<{
    id: number;
    user_id: number;
    picture: string;
    comment: string;
    rating: number;
    created_at: string;
    users: {
      id: number;
      name: string;
      email: string;
      profile: string;
    };
  }>;
}

const fetchProductDetail = async (productId: number | string): Promise<ProductDetail> => {
  if (!productId) throw new Error('Product ID is required');

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      product_items(id, size, sku_number, color),
      product_images(id, image_url, is_primary),
      product_reviews(
        id,
        user_id,
        picture,
        comment,
        rating,
        created_at,
        users(id, name, email, profile)
      )
    `
    )
    .eq('id', productId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useProductDetail = (productId: number | string | undefined, enabled: boolean = true) => {
  return useQuery<ProductDetail, Error>({
    queryKey: ['product', productId],
    queryFn: () => fetchProductDetail(productId!),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

const fetchProductInventory = async (productId: number | string): Promise<number> => {
  if (!productId) return 0;

  const { data, error } = await supabase
    .from('inventory')
    .select('stock_quantity')
    .eq('product_id', productId)
    .single();

  if (error || !data) return 0;
  return data.stock_quantity;
};

export const useProductInventory = (productId: number | string | undefined, enabled: boolean = true) => {
  return useQuery<number, Error>({
    queryKey: ['inventory', productId],
    queryFn: () => fetchProductInventory(productId!),
    enabled: enabled && !!productId,
    staleTime: 1 * 60 * 1000,
  });
};
