import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supaBaseClient';

export type TrackType = 'search' | 'view' | 'click' | 'cart' | 'purchase';

interface TrackPayload {
  userId: string;
  type: TrackType;
  productId?: string;
  category?: string;
  keyword?: string;
}

interface TrackingState {
  loading: boolean;
  error?: string;
}

const initialState: TrackingState = {
  loading: false,
  error: undefined,
};


export const trackUserActivity = createAsyncThunk(
  'tracking/trackUserActivity',
  async (payload: TrackPayload, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('user_activity').insert([
        {
          user_id: payload.userId,
          type: payload.type,
          product_id: payload.productId || null,
          category: payload.category || null,
          keyword: payload.keyword || null,
        },
      ]);

      if (error) {
        return rejectWithValue(error.message);
      }

      return true;
    } catch (err) {
      return rejectWithValue('Failed to track activity');
    }
  }
);


export const trackBulkActivity = createAsyncThunk(
  'tracking/trackBulkActivity',
  async (payloads: TrackPayload[], { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('user_activity').insert(
        payloads.map((p) => ({
          user_id: p.userId,
          type: p.type,
          product_id: p.productId || null,
          category: p.category || null,
          keyword: p.keyword || null,
        }))
      );

      if (error) {
        return rejectWithValue(error.message);
      }

      return true;
    } catch (err) {
      return rejectWithValue('Bulk tracking failed');
    }
  }
);


const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // single tracking
      .addCase(trackUserActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(trackUserActivity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(trackUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error =  'Tracking failed';
      })

      // bulk tracking
      .addCase(trackBulkActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(trackBulkActivity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(trackBulkActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Bulk tracking failed';
      });
  },
});

export default trackingSlice.reducer;