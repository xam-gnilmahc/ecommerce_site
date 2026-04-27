import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';
import { Product } from '../../types/products';

export const fetchUserRecommendations = createAsyncThunk<Product[], string, { rejectValue: string }>(
  'userRecommendations/fetchUserRecommendations',
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue('userId required');

    try {
      // Get recommended product ids and scores for the user
      const { data: recs, error: recErr } = await supabase
        .from('user_recommendations')
        .select('product_id, score')
        .eq('user_id', userId)
        .order('score', { ascending: false });

  if (recErr) return rejectWithValue(recErr.message || 'Failed to load recommendations');

      if (!recs || recs.length === 0) return [];

      const ids = recs.map((r) => r.product_id).filter(Boolean);

      if (ids.length === 0) return [];
          
      // Fetch full product records for the recommended ids
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

      if (prodErr) return rejectWithValue(prodErr.message || 'Failed to load products for recommendations');

      // Normalize keys to string to avoid mismatches between db id types
      const scoreById = new Map(recs.map((r) => [String(r.product_id), r.score]));

      // Build a map of fetched products by id for quick lookup
      const productById = new Map((products || []).map((p) => [String(p.id), p]));

      // Preserve the exact recommendation order returned by 'recs'
      const ordered = ids
        .map((id) => {
          const key = String(id);
          const prod = productById.get(key);
          if (!prod) return null;
          return { ...prod, _recommendationScore: scoreById.get(key) };
        })
        .filter(Boolean);

      return ordered;
    } catch (err) {
      return rejectWithValue('Unexpected error while fetching recommendations');
    }
  }
);

interface RecommendationState {
  recommendations: Product[];
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
  loading: boolean;
}

const initialState: RecommendationState = {
  recommendations: [],
  status: 'idle',
  error: null,
  loading: false,
};

const recommendationSlice = createSlice({
  name: 'userRecommendations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRecommendations.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecommendations.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'success';
        state.recommendations = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserRecommendations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch recommendations';
        state.loading = false;
      });
  },
});

export default recommendationSlice.reducer;
