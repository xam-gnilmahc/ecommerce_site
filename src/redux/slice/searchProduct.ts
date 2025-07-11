import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';
import { Product } from '../../types/products';

interface SearchState {
  results: Product[];
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
  loading: boolean;

}

const initialState: SearchState = {
  results: [],
  status: 'idle',
  error: null,
  loading:true,
};

// Async thunk to search products by term
export const searchProducts = createAsyncThunk<
  Product[],
  string,
  { rejectValue: string }
>(
  'search/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      // Example: searching in 'name', 'brand', 'type', 'category' columns using ilike (case-insensitive partial match)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(
          `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
        )
        .limit(1000);

      if (error) return rejectWithValue(error.message);
      if (!data) return rejectWithValue('No products found');

      return data;
    } catch {
      return rejectWithValue('Unexpected error while searching products.');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch(state) {
      state.results = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.loading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'success';
        state.results = action.payload;
        state.loading = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to search products';
        state.loading = false;
      });
  },
});

export const { clearSearch } = searchSlice.actions;

export default searchSlice.reducer;
