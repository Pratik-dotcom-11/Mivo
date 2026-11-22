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
      // Standard redirect back to the app root (Supabase Auth appends token/code)
      const targetRedirect =
        redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);

      // Use skipBrowserRedirect so we can safely verify if Google provider is enabled in Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (
          msg.toLowerCase().includes('unsupported provider') ||
          msg.toLowerCase().includes('not enabled')
        ) {
          return { error: new Error('GOOGLE_PROVIDER_DISABLED') };
        }
        return { error: new Error(msg) };
      }

      if (!data?.url) {
        throw new Error('Supabase did not return an OAuth authorization URL');
      }

      // Preflight check: prevent sending the user to a raw JSON error page if Google provider is disabled
      try {
        const probe = await fetch(data.url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!probe.ok) {
          const body = await probe.json().catch(() => ({}));
          if (
            body?.msg?.includes('provider is not enabled') ||
            body?.error_code === 'validation_failed' ||
            probe.status === 400
          ) {
            return { error: new Error('GOOGLE_PROVIDER_DISABLED') };
          }
        }
      } catch (probeErr) {
        // If fetch was blocked by CORS redirect, that's expected for live Google redirects
        console.info('[Mivo Auth] Preflight check passed/redirected:', probeErr);
      }

      // If enabled, smoothly navigate the browser to Google OAuth
      window.location.href = data.url;
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
   * Parses OAuth callback errors from browser location
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
