import { createClient } from "@supabase/supabase-js";

const config = import.meta.env;
export const supabaseUrl = config.VITE_SUPABASE_URL?.trim() ?? "";
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

export const supabaseSetupMessage = !supabaseUrl && !supabaseAnonKey
  ? "Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el registro, la base de datos y el panel del operador."
  : !supabaseUrl || !supabaseAnonKey
    ? "Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Revisa las variables privadas de configuración."
    : "";

export const supabasePublicApiKey = supabaseAnonKey;
