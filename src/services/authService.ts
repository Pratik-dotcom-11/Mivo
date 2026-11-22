import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

export const authService = {
  /**
   * Initiates official Supabase Google OAuth sign-in flow
   * @param redirectTo Optional custom redirect URI (defaults to window.location.origin)
   */
  async signInWithGoogle(redirectTo?: string): Promise<{ error: AuthError | Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
        ),
      };
    }

    try {
      // Directs to dashboard route on successful auth
      const targetRedirect = redirectTo || `${window.location.origin}/#app`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error('Failed to initiate Google authentication');
      console.error('[Mivo Auth] Google OAuth initiation failed:', formattedError);
      return { error: formattedError };
    }
  },

  /**
   * Signs out the currently authenticated user
   */
  async signOut(): Promise<{ error: AuthError | Error | null }> {
    if (!isSupabaseConfigured) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err: unknown) {
      const formattedError = err instanceof Error ? err : new Error('Failed to sign out');
      console.error('[Mivo Auth] Sign out error:', formattedError);
      return { error: formattedError };
    }
  },

  /**
   * Retrieves active session from local storage or server
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | Error | null }> {
    if (!isSupabaseConfigured) return { session: null, error: null };
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (err: unknown) {
      return {
        session: null,
        error: err instanceof Error ? err : new Error('Failed to retrieve active session'),
      };
    }
  },

  /**
   * Derives standardized user profile from Supabase user and Google OAuth metadata
   */
  getUserProfile(user: User | null): UserProfile | null {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      (user.email ? user.email.split('@')[0] : 'Mivo User');

    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      metadata.avatar ||
      null;

    const provider = user.app_metadata?.provider || 'google';

    return {
      id: user.id,
      email: user.email || '',
      fullName,
      avatarUrl,
      provider,
    };
  },

  /**
   * Parses potential OAuth error descriptions passed back in redirect URL query/hash
   */
  parseOAuthErrorFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    // 1. Check query parameters (?error=...&error_description=...)
    const searchParams = new URLSearchParams(window.location.search);
    const searchErr = searchParams.get('error_description') || searchParams.get('error');
    if (searchErr) return decodeURIComponent(searchErr.replace(/\+/g, ' '));

    // 2. Check hash fragment (#error=...&error_description=...)
    if (window.location.hash) {
      const hashContent = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashContent);
      const hashErr = hashParams.get('error_description') || hashParams.get('error');
      if (hashErr) return decodeURIComponent(hashErr.replace(/\+/g, ' '));
    }

    return null;
  },

  /**
   * Cleans OAuth token parameters or error fragments from browser address bar
   */
  cleanOAuthUrl(destinationHash = '#app') {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      // Remove OAuth query params
      url.searchParams.delete('code');
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('error_code');
      // Set clean hash
      window.history.replaceState(null, '', `${url.pathname}${destinationHash}`);
    } catch {
      // Fallback
      window.location.hash = destinationHash;
    }
  },
};
