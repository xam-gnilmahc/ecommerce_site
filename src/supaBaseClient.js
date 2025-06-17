import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ required for refresh persistence
    storage: localStorage, // ✅ localStorage by default
    autoRefreshToken: true, // ✅ keeps token refreshed
  },
});