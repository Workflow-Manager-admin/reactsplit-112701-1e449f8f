import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
// Initializes and exports the Supabase client for authentication and database operations.
// TODO: Replace placeholders with your actual Supabase URL and public anon key!
const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
