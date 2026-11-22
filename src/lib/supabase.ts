import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Production Supabase credentials for Mivo project.
 * Public publishable/anon key is explicitly designed by Supabase for safe browser usage.
 * Strict Row Level Security (RLS) policies safeguard all database records.
 */
const DEFAULT_SUPABASE_URL = 'https://npixrygnfkqahlxntwai.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waXhyeWduZmtxYWhseG50d2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMzc3MTQsImV4cCI6MjExMDgxMzcxNH0.Xh-dvh-mfKZj7jYa2fSPi5_UrHGyfby4FvQr9mSwfEU';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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

/**
 * Reusable typed Supabase client instance.
 * Exclusively uses public anon key with strict Row Level Security.
 * Service role keys are NEVER exposed on the client.
 */
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mivo-auth-token',
    },
  }
);
