import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are placeholders or missing
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project');
const isValidKey = supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key') && supabaseAnonKey !== '';

if (!isValidUrl || !isValidKey) {
  console.warn(
    '⚠️ Supabase credentials are not configured or are using placeholder values. Please check your .env file.'
  );
}

// Fallback to empty string if missing, to prevent client initialization crash
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isValidKey ? supabaseAnonKey : 'placeholder-anon-key'
);
