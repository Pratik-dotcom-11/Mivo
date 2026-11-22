import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

export const authService = {
  /**
   * Signs in with Gmail / Email and password
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase client is not configured.'),
      };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Invalid Gmail address or password. If you are new, click "Create Account" below.';
        }
        return { user: null, session: null, error: new Error(msg) };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error('Failed to sign in with Gmail');
      return { user: null, session: null, error: formattedError };
    }
  },

  /**
   * Registers a new user with Gmail / Email and password.
   * Supabase trigger auto_confirm_user automatically confirms the email immediately.
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase client is not configured.'),
      };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const derivedName = fullName?.trim() || cleanEmail.split('@')[0];

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: derivedName,
            name: derivedName,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: new Error(error.message) };
      }

      // If session is returned directly
      if (data.session) {
        return { user: data.user, session: data.session, error: null };
      }

      // Automatically sign in now that user is created and auto-confirmed
      const loginRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      return {
        user: loginRes.data?.user || data.user,
        session: loginRes.data?.session || null,
        error: loginRes.error ? new Error(loginRes.error.message) : null,
      };
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error('Failed to create Mivo account');
      return { user: null, session: null, error: formattedError };
    }
  },

  /**
   * Sends passwordless Magic Link to Gmail
   */
  async sendMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const targetRedirect =
        redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: targetRedirect,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error('Failed to send login link to your Gmail');
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
   * Derives standardized user profile from Supabase user metadata
   */
  getUserProfile(user: User | null): UserProfile | null {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      (user.email ? user.email.split('@')[0] : 'Mivo Creator');

    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      metadata.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=c85a32,e07a5f`;

    const provider = user.app_metadata?.provider || 'gmail';

    return {
      id: user.id,
      email: user.email || '',
      fullName,
      avatarUrl,
      provider,
    };
  },

  /**
   * Parses OAuth or email callback errors from browser location
   */
  parseOAuthErrorFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const searchParams = new URLSearchParams(window.location.search);
    const searchErr = searchParams.get('error_description') || searchParams.get('error');
    if (searchErr) return decodeURIComponent(searchErr.replace(/\+/g, ' '));

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
   * Cleans token parameters from browser address bar
   */
  cleanOAuthUrl(destinationHash = '#app') {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('error_code');
      window.history.replaceState(null, '', `${url.pathname}${destinationHash}`);
    } catch {
      window.location.hash = destinationHash;
    }
  },
};
