import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { CartItem } from '../../types/cartItem';

interface CartState {
  items: CartItem[];
  loading: boolean;        // used for add/remove actions
  fetchLoading: boolean;   // used only during initial fetch
  status: 'idle' | 'loading' | 'success' | 'failed';
  error?: string;
}

const initialState: CartState = {
  items: [],
  loading: false,
  fetchLoading: true,
  status: 'idle',
  error: undefined,
};

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId, { rejectWithValue }) => {
    try {
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

      if (error) {
        return rejectWithValue(error.message);
      }

      return data;
    } catch (err) {
      return rejectWithValue('Unknown error occurred while fetching cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, product }, { rejectWithValue, dispatch }) => {
    try {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        toast.error(`Failed to check cart: ${selectError.message}`);
        return rejectWithValue(selectError.message);
      }

      if (!existingItem) {
        const { error: insertError } = await supabase.from('cart').insert([{
          product_id: product.id,
          user_id: userId,
          amount: product.amount,
          quantity: product.qty ?? 1,
        }]);
        if (insertError) {
          toast.error(`Failed to add to cart: ${insertError.message}`);
          return rejectWithValue(insertError.message);
        }
      } else {
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + (product.qty ?? 1) })
          .eq('id', existingItem.id);
        if (updateError) {
          toast.error(`Failed to update cart quantity: ${updateError.message}`);
          return rejectWithValue(updateError.message);
        }
      }

      toast.success('Product added to cart!');
      await dispatch(fetchCartItems(userId));
    } catch (err) {
      toast.error('Unknown error occurred while adding to cart');
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, product }, { rejectWithValue, dispatch }) => {
    try {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        toast.error(`Failed to check cart item: ${selectError.message}`);
        return rejectWithValue(selectError.message);
      }

      if (existingItem) {
        const newQty = existingItem.quantity - 1;

        if (newQty > 0) {
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: newQty })
            .eq('id', existingItem.id);
          if (updateError) {
            toast.error(`Failed to update cart quantity: ${updateError.message}`);
            return rejectWithValue(updateError.message);
          }
        } else {
          const { error: deleteError } = await supabase
            .from('cart')
            .delete()
            .eq('id', existingItem.id);
          if (deleteError) {
            toast.error(`Failed to remove item from cart: ${deleteError.message}`);
            return rejectWithValue(deleteError.message);
          }
        }

        await dispatch(fetchCartItems(userId));
      } else {
        toast.error("Item not found in cart");
        return rejectWithValue("Item not found in cart");
      }
    } catch (err) {
      toast.error("Unknown error occurred while removing from cart");
      return rejectWithValue("Unknown error occurred");
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.loading = false;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.loading = false;
      })

      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.fetchLoading = true;
        state.error = undefined;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to fetch cart items';
      });
  },
});

export default cartSlice.reducer;
