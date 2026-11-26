import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { CartItem } from '../types/cartItem';
import toast from 'react-hot-toast';

/** Columns (plus the joined product) every cart item query returns. */
const CART_ITEM_SELECT = `id, cart_id, product_id, amount, quantity,
  products:product_id (id, name, banner_url, amount, description, rating)`;

/**
 * The user's cart row (one per user). Returns null when the cart does not
 * exist yet, so read-only calls never create one.
 */
const findCartId = async (userId: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
};

/** Same as findCartId, but creates the cart row on first use. */
const ensureCartId = async (userId: string): Promise<number> => {
  const existingId = await findCartId(userId);
  if (existingId) return existingId;

  const { data, error } = await supabase
    .from('cart')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) {
    // Another tab may have created the cart between the select and the insert.
    if (error.code === '23505') {
      const id = await findCartId(userId);
      if (id) return id;
    }
    throw error;
  }

  return data.id;
};

/** Cart items for a user, newest cart structure: cart → cart_items → product. */
export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart')
    .select(`id, cart_items (${CART_ITEM_SELECT})`)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  const items = (data as unknown as { cart_items?: CartItem[] } | null)?.cart_items ?? [];
  return [...items].sort((a, b) => a.id - b.id);
};

export const useCartItems = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => fetchCartItems(userId as string),
    enabled: !!userId,
  });
};

export const useCartTotal = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['cart', 'total', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart')
        .select('id, cart_items (id)')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      const items = (data as { cart_items?: { id: number }[] } | null)?.cart_items;
      return items?.length ?? 0;
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, product }: { userId: string; product: any }) => {
      const cartId = await ensureCartId(userId);
      const quantity = product.qty ?? 1;

      const { data: existingItem, error: selectError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .maybeSingle();

      if (selectError) throw selectError;

      if (!existingItem) {
        const { data: inserted, error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              cart_id: cartId,
              product_id: product.id,
              amount: product.amount,
              quantity,
            },
          ])
          .select(CART_ITEM_SELECT)
          .single();
        if (insertError) throw insertError;
        toast.success('Added to cart');
        return inserted;
      }

      const { data: updated, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select(CART_ITEM_SELECT)
        .single();
      if (updateError) throw updateError;
      toast.success('Quantity updated!');
      return updated;
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
      const cartId = await findCartId(userId);
      if (!cartId) throw new Error('Item not found');

      const { data: removed, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .select('id');

      if (error) throw error;
      if (!removed?.length) throw new Error('Item not found');

      toast.success('Item removed from cart');
      return { removedId: removed[0].id };
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
      const cartId = await findCartId(userId);
      if (!cartId) return { removed: true };

      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId)
          .eq('product_id', productId);
        if (error) throw error;
        return { removed: true };
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .select(CART_ITEM_SELECT)
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
