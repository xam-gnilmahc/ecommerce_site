import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { CartItem } from '../types/cartItem';
import toast from 'react-hot-toast';

export const useCartItems = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart')
        .select(`*, products:product_id (id, name, banner_url, amount, description, rating)`)
        .eq('user_id', userId)
        .order('id', { ascending: true });
      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!userId,
  });
};

export const useCartTotal = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['cart', 'total', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('cart').select('id').eq('user_id', userId);
      if (error) throw error;
      return data.length;
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, product }: { userId: string; product: any }) => {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (!existingItem) {
        const { data: inserted, error: insertError } = await supabase
          .from('cart')
          .insert([
            {
              product_id: product.id,
              user_id: userId,
              amount: product.amount,
              quantity: product.qty ?? 1,
            },
          ])
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();
        if (insertError) throw insertError;
        toast.success('Added to cart');
        return inserted;
      } else {
        const newQty = existingItem.quantity + (product.qty ?? 1);
        const { data: updated, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();
        if (updateError) throw updateError;
        toast.success('Quantity updated!');
        return updated;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'total', userId] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, productId }: { userId: string; productId: string }) => {
      const { data: existingItem, error: findError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (findError || !existingItem) throw new Error('Item not found');

      const { error: deleteError } = await supabase.from('cart').delete().eq('id', existingItem.id);
      if (deleteError) throw deleteError;

      toast.success('Item removed from cart');
      return { removedId: existingItem.id };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'total', userId] });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      productId,
      quantity,
    }: {
      userId: string;
      productId: string;
      quantity: number;
    }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
        if (error) throw error;
        return { removed: true };
      }
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', 'total', userId] });
    },
  });
};
