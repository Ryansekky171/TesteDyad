import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) { // <-- Aqui ele verifica se ambas existem
  console.error("Supabase URL or Anon Key is not defined. Please check your environment variables.");
} else {
  console.log("Supabase client initializing with provided URL and Anon Key.");
  console.log("DEBUG: supabaseUrl =", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); // <-- E aqui ele usa as duas
console.log("Supabase client created.");