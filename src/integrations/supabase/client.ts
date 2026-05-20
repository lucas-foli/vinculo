import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!supabaseConfigured) {
  console.error(
    "[Vínculo] VITE_SUPABASE_URL e/ou VITE_SUPABASE_PUBLISHABLE_KEY ausentes. " +
    "Copie .env.example para .env e preencha com os valores do seu projeto Supabase."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://placeholder.supabase.co",
  SUPABASE_PUBLISHABLE_KEY ?? "placeholder-anon-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
