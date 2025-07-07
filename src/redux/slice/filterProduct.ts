import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';
import { Product } from '../../types/products';

interface Filters {
  brands: string[];
  category: string[];
  priceRange: [number, number] | null;
}

export const fetchFilteredProducts = createAsyncThunk<
  Product[],
  Filters,
  { rejectValue: string }
>(
  'products/fetchFilteredProducts',
  async (filters, { rejectWithValue }) => {
    try {
      let query = supabase.from('products').select('*').limit(1000);

      // Filter by brands
      if (filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }

      // Filter by category
      if (filters.category.length > 0) {
        query = query.in('category', filters.category);
      }

      // Filter by price range
      if (filters.priceRange && filters.priceRange.length === 2) {
        const min = Number(filters.priceRange[0]);
        const max = Number(filters.priceRange[1]);
        console.log('Filtering products with amount between:', min, max);
        query = query.gte('amount', min).lte('amount', max);
      }

      const { data, error } = await query;

      if (error) {
        return rejectWithValue(error.message);
      }

      return data ?? [];
    } catch (err) {
      return rejectWithValue('Unexpected error while fetching filtered products.');
    }
  }
);


interface FilterState {
  filteredProducts: Product[];
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

const initialState: FilterState = {
  filteredProducts: [],
  status: 'idle',
  error: null,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    clearFilters(state) {
      state.filteredProducts = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'success';
        state.filteredProducts = action.payload;
      })
      .addCase(fetchFilteredProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch filtered products';
      });
  },
});

export const { clearFilters } = filterSlice.actions;
export default filterSlice.reducer;
