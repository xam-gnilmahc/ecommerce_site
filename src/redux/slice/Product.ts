import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';
import { Product } from '../../types/products';

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    let allProducts: Product[] = [];
    let batchSize = 1000;
    let start = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .range(start, start + batchSize - 1);

        if (error) {
          return rejectWithValue(error.message);
        }

        if (data && data.length > 0) {
          allProducts = allProducts.concat(data);
          start += batchSize;

          if (data.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      return allProducts;
    } catch (err) {
      return rejectWithValue('Unexpected error while fetching products.');
    }
  }
);


interface ProductState {
  products: Product[];
  status: "idle" | "loading" | "success" | "failed";
  error: string | null;
  loading: boolean;

}

const initialState: ProductState = {
  products: [],
  status: "idle",
  error: null,
  loading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = "success";
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch products';
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
