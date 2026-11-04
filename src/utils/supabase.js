import { createClient } from "@supabase/supabase-js";

const config = import.meta.env;
const supabaseUrl = config.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = config.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export const supabaseIsConfigured = Boolean(supabase);
