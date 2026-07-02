import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import toast from 'react-hot-toast';
import { CartItem } from '../types/cartItem';
import { Product } from '../types/products';

interface AddToCartParams {
  userId: string;
  product: Product & { qty?: number };
}

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation<CartItem, Error, AddToCartParams>({
    mutationFn: async ({ userId, product }) => {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw new Error(selectError.message);
      }

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

        if (insertError) throw new Error(insertError.message);
        return inserted;
      } else {
        const newQty = existingItem.quantity + (product.qty ?? 1);
        const { data: updated, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();

        if (updateError) throw new Error(updateError.message);
        return updated;
      }
    },
    onSuccess: (_, { userId }) => {
      toast.success('Added to cart');
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cartCount', userId] });
    },
    onError: () => {
      toast.error('Error adding to cart');
    },
  });
};

interface RemoveFromCartParams {
  userId: string;
  product: Product;
}

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation<CartItem | { removedId: number }, Error, RemoveFromCartParams>({
    mutationFn: async ({ userId, product }) => {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity, product_id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw new Error(selectError.message);
      }

      if (!existingItem) {
        throw new Error('Item not found in cart');
      }

      const newQty = existingItem.quantity - 1;

      if (newQty > 0) {
        const { data: updated, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();

        if (updateError) throw new Error(updateError.message);
        return updated;
      } else {
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('id', existingItem.id);

        if (deleteError) throw new Error(deleteError.message);
        return { removedId: existingItem.id };
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cartCount', userId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
};

interface RemoveItemDirectlyParams {
  userId: string;
  productId: number;
}

export const useRemoveItemDirectlyFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation<{ removedId: number }, Error, RemoveItemDirectlyParams>({
    mutationFn: async ({ userId, productId }) => {
      const { data: existingItem, error: findError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (findError || !existingItem) {
        throw new Error(findError?.message || 'Item not found');
      }

      const { error: deleteError } = await supabase.from('cart').delete().eq('id', existingItem.id);

      if (deleteError) throw new Error(deleteError.message);
      return { removedId: existingItem.id };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['cartCount', userId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove item from cart');
    },
  });
};
