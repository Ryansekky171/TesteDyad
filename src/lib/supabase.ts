import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A função createClient do Supabase já fará a validação e lançará um erro
// se as URLs ou chaves forem inválidas ou não existirem.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);