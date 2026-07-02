import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { CartItem } from '../types/cartItem';

const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart')
    .select(
      `*, products:product_id (
        id,
        name,
        banner_url,
        amount,
        description,
        rating
      )`
    )
    .eq('user_id', userId)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};

export const useCart = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<CartItem[], Error>({
    queryKey: ['cart', userId],
    queryFn: () => fetchCartItems(userId!),
    enabled: enabled && !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

const fetchCartCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return data.length;
};

export const useCartCount = (userId: string | undefined, enabled: boolean = true) => {
  return useQuery<number, Error>({
    queryKey: ['cartCount', userId],
    queryFn: () => fetchCartCount(userId!),
    enabled: enabled && !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
