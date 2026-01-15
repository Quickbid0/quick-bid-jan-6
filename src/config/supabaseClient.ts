import { createClient } from '@supabase/supabase-js';

// Read the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create the supabase client instance
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
