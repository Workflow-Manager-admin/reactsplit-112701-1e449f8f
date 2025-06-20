import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
// Initializes and exports the Supabase client for authentication and database operations.
// NOTE: You must replace the placeholders below with your actual Supabase Project URL and the public anon key.
// If you see 'failed to fetch' during signup/auth, it means authentication calls are not reaching Supabase API.
// Common causes:
//  1. Incorrect supabaseUrl or supabaseAnonKey (still set to YOUR_SUPABASE_URL or YOUR_SUPABASE_ANON_KEY)
//  2. The Supabase project has not added your frontend's domain (e.g. http://localhost:3000) to "Auth > Settings > Redirect URLs" or CORS settings
//  3. Network issues or firewall blocking the browser requests to api.supabase.co URLs
//  4. Key is revoked or project is paused
//  5. HTTPS misconfiguration in Project URL or invalid certificate

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'; // <--- REPLACE this with your real Supabase project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // <--- REPLACE this with your real Supabase anon/public key

if (
  supabaseUrl.includes('YOUR_SUPABASE_URL') ||
  supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY'
) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] WARNING: Your supabaseUrl and/or supabaseAnonKey are still set as placeholders. Auth/DB requests will fail with "failed to fetch".\n' +
      'To fix: Go to your project in https://app.supabase.com/, copy the Project URL and public anon key from "Project Settings > API" and paste them here.\n' +
      'Also, ensure your localhost:3000 (or deployed frontend URL) is added to Allowed Redirect URLs and CORS under Project Settings > Auth > URL Configuration.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
