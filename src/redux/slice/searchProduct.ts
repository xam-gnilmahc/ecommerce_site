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
  loading: true,
};

// Async thunk to search products by term
export const searchProducts = createAsyncThunk<Product[], string, { rejectValue: string }>(
  'search/searchProducts',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const raw = searchTerm.trim();
      if (!raw) return [];

      // Split into individual words, dedupe, ignore empty
      const words = [...new Set(raw.toLowerCase().split(/\s+/).filter(Boolean))];

      const FIELDS = ['name', 'brand', 'type', 'category'];

      // Build one OR filter per word: every word must match at least one field
      // e.g. "nike red" → (name|brand|type|category ilike %nike%) AND (...%red%)
      // We run one query per word then intersect by id for AND logic,
      // OR merge all for OR logic — chose AND so "nike shoes" is more precise
      const queries = words.map((word) =>
        supabase
          .from('products')
          .select('*')
          .or(FIELDS.map((f) => `${f}.ilike.%${word}%`).join(','))
          .limit(500)
      );

      const results = await Promise.all(queries);

      // Check errors
      for (const r of results) {
        if (r.error) return rejectWithValue(r.error.message);
      }

      // Intersect by id (AND logic: product must match ALL words)
      const sets = results.map((r) => new Map((r.data ?? []).map((p) => [p.id, p])));

      const [first, ...rest] = sets;
      const intersected: Product[] = [];

      first.forEach((product, id) => {
        if (rest.every((s) => s.has(id))) intersected.push(product);
      });

      if (!intersected.length) return rejectWithValue('No products found');

      // Score by relevance: count how many fields contain the full original term
      const scored = intersected
        .map((p) => {
          const haystack = FIELDS.map((f) => (p as any)[f] ?? '')
            .join(' ')
            .toLowerCase();
          let score = 0;
          // Exact full-term match = highest boost
          if (haystack.includes(raw.toLowerCase())) score += 10;
          // Each individual word match adds 1
          words.forEach((w) => {
            if (haystack.includes(w)) score += 1;
          });
          return { product: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product);

      return scored;
    } catch {
      return rejectWithValue('Unexpected error while searching products.');
    }
  }
);

// export const searchProducts = createAsyncThunk<
//   Product[],
//   string,
//   { rejectValue: string }
// >(
//   'search/searchProducts',
//   async (searchTerm, { rejectWithValue }) => {
//     try {
//       const trimmed = searchTerm.trim();

//       if (!trimmed) {
//         return rejectWithValue('Empty search');
//       }

//       // split full sentence into words
//       const words = trimmed.split(' ').filter(Boolean);

//       // build multiple OR conditions for better matching
//       const orFilters = words
//         .map(
//           (word) =>
//             `name.ilike.%${word}%,brand.ilike.%${word}%,type.ilike.%${word}%,category.ilike.%${word}%`
//         )
//         .join(',');

//       const { data, error } = await supabase
//         .from('products')
//         .select('*')
//         .or(orFilters)
//         .limit(1000);

//       if (error) return rejectWithValue(error.message);
//       if (!data) return rejectWithValue('No products found');

//       // better ranking (name match first)
//       const sorted = [...data].sort((a, b) => {
//         const aName = a.name?.toLowerCase() || '';
//         const bName = b.name?.toLowerCase() || '';
//         const q = trimmed.toLowerCase();

//         const aScore = aName.includes(q) ? 2 : 0;
//         const bScore = bName.includes(q) ? 2 : 0;

//         return bScore - aScore;
//       });

//       return sorted;
//     } catch {
//       return rejectWithValue('Unexpected error while searching products.');
//     }
//   }
// );

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
