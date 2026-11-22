import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates whether real Supabase credentials have been configured
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseAnonKey.includes('your-anon-key') &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.info(
    '[Mivo Supabase] Running in local demo mode. To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Reusable typed Supabase client instance.
 * Exclusively uses public anon key with strict Row Level Security.
 * Service role keys are NEVER exposed on the client.
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-mivo.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mivo-auth-token',
    },
  }
);
