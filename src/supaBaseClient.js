import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config/env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // ✅ required for refresh persistence
    storage: localStorage, // ✅ localStorage by default
    autoRefreshToken: true, // ✅ keeps token refreshed
  },
});
