import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not defined. Please check your environment variables.");
} else {
  console.log("Supabase client initializing with provided URL and Anon Key.");
  // Adicione esta linha para depurar o valor exato da URL
  console.log("DEBUG: supabaseUrl =", supabaseUrl); 
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase client created.");