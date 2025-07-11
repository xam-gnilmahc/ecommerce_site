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
  totalCart: number;
}

const initialState: CartState = {
  items: [],
  loading: false,
  fetchLoading: false,
  status: 'idle',
  error: undefined,
  totalCart: 0,
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

export const fetchTotalCart = createAsyncThunk(
  'cart/fetchTotalCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('id') // Only need the ID or any field
        .eq('user_id', userId);

      if (error) return rejectWithValue(error.message);

      return data.length; // Count of unique items
    } catch (err) {
      return rejectWithValue('Failed to fetch total cart count');
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
        return rejectWithValue(selectError.message);
      }

      if (!existingItem) {
        const { data: inserted, error: insertError } = await supabase
          .from('cart')
          .insert([{
            product_id: product.id,
            user_id: userId,
            amount: product.amount,
            quantity: product.qty ?? 1,
          }])
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)') // return new item with product
          .single();

        if (insertError) return rejectWithValue(insertError.message);

        toast.success('Product added to cart!');
        await dispatch(fetchTotalCart(userId));
        return inserted;
      } else {
        const newQty = existingItem.quantity + (product.qty ?? 1);

        const { data: updated, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();

        if (updateError) return rejectWithValue(updateError.message);

        await dispatch(fetchTotalCart(userId));
        return updated;
      }
    } catch (err) {
      toast.error('Error adding to cart');
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const removeItemDirectlyFromCart = createAsyncThunk(
  'cart/removeItemDirectlyFromCart',
  async ({ userId, productId }, { rejectWithValue, dispatch }) => {
    try {
      const { data: existingItem, error: findError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (findError || !existingItem) {
        return rejectWithValue(findError?.message || 'Item not found');
      }

      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('id', existingItem.id);

      if (deleteError) {
        return rejectWithValue(deleteError.message);
      }

      await dispatch(fetchTotalCart(userId));
      return { removedId: existingItem.id };
    } catch (err) {
      return rejectWithValue('Failed to remove item from cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, product }, { rejectWithValue, dispatch }) => {
    try {
      const { data: existingItem, error: selectError } = await supabase
        .from('cart')
        .select('id, quantity, product_id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        toast.error(`Failed to check cart item: ${selectError.message}`);
        return rejectWithValue(selectError.message);
      }

      if (!existingItem) {
        toast.error("Item not found in cart");
        return rejectWithValue("Item not found in cart");
      }

      const newQty = existingItem.quantity - 1;

      if (newQty > 0) {
        const { data: updated, error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .select('*, products:product_id(id, name, banner_url, amount, description, rating)')
          .single();

        if (updateError) {
          toast.error(`Failed to update cart quantity: ${updateError.message}`);
          return rejectWithValue(updateError.message);
        }

        return updated;
      } else {
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('id', existingItem.id);

        if (deleteError) {
          toast.error(`Failed to remove item from cart: ${deleteError.message}`);
          return rejectWithValue(deleteError.message);
        }
        await dispatch(fetchTotalCart(userId));
        return { removedId: existingItem.id };
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
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;

        const index = state.items.findIndex(item => item.product_id === updated.product_id);
        if (index !== -1) {
          // update quantity
          state.items[index] = updated;
        } else {
          // add new item
          state.items.push(updated);
        }
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;

        if ('removedId' in action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload.removedId);
          if (index !== -1) {
            state.items.splice(index, 1); // ✅ directly remove the item
          }
        } else {
          const updated = action.payload;
          const index = state.items.findIndex(item => item.product_id === updated.product_id);
          if (index !== -1) {
            state.items[index] = updated; // ✅ update item in place
          }
        }
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(removeItemDirectlyFromCart.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.removedId);
        if (index !== -1) {
          state.items.splice(index, 1);
        }
      })
      .addCase(removeItemDirectlyFromCart.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to remove item';
      })
      // Fetch total cart
      .addCase(fetchTotalCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTotalCart.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCart = action.payload;
      })
      .addCase(fetchTotalCart.rejected, (state) => {
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
