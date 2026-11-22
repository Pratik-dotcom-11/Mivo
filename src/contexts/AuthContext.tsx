import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authService } from '@/services/authService';
import type { UserProfile } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoSignIn: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // 1. Detect any OAuth errors passed in the redirect callback URL
    const urlOAuthError = authService.parseOAuthErrorFromUrl();
    if (urlOAuthError) {
      setError(`Google Authentication error: ${urlOAuthError}`);
    }

    // 2. If Supabase is not configured, complete loading
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 3. Retrieve initial session from Supabase (restores session after page refresh)
    authService.getSession().then(({ session: currentSession, error: sessionErr }) => {
      if (sessionErr) {
        console.warn('[Mivo Auth] Error retrieving initial session:', sessionErr);
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setProfile(authService.getUserProfile(currentSession.user));

        // If returned from OAuth callback with tokens or code, clean the URL
        if (
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code')
        ) {
          authService.cleanOAuthUrl('#app');
        }
      }
      setIsLoading(false);
    });

    // 4. Real-time auth listener for OAuth redirects and token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      setProfile(authService.getUserProfile(currentUser));

      if (event === 'SIGNED_IN' && newSession?.user) {
        setError(null);
        // Automatically route to protected app view on successful Google sign-in
        if (
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code')
        ) {
          authService.cleanOAuthUrl('#app');
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Initiates Google OAuth Sign In
   */
  const signInWithGoogle = useCallback(
    async (redirectTo?: string): Promise<{ error: Error | null }> => {
      setError(null);
      const res = await authService.signInWithGoogle(redirectTo);
      if (res.error) {
        setError(res.error.message);
        return { error: res.error };
      }
      return { error: null };
    },
    []
  );

  /**
   * Signs out the user and clears state
   */
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      // Return to landing page after sign out
      if (window.location.hash === '#app') {
        window.location.hash = '';
      }
    }
  }, []);

  /**
   * Demo Sign-In for seamless evaluation before production credentials are tied
   */
  const demoSignIn = useCallback(() => {
    const demoUser = {
      id: 'demo-user-mivo-001',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'creator@mivo.app',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      app_metadata: {
        provider: 'google',
        providers: ['google'],
      },
      user_metadata: {
        full_name: 'Mivo Creator',
        name: 'Mivo Creator',
        avatar_url:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: 'creator@mivo.app',
      },
    } as unknown as User;

    setUser(demoUser);
    setProfile({
      id: 'demo-user-mivo-001',
      email: 'creator@mivo.app',
      fullName: 'Mivo Creator',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
    });
    setError(null);
    window.location.hash = '#app';
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isConfigured: isSupabaseConfigured,
      error,
      clearError,
      signInWithGoogle,
      signOut,
      demoSignIn,
    }),
    [user, session, profile, isLoading, error, clearError, signInWithGoogle, signOut, demoSignIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
