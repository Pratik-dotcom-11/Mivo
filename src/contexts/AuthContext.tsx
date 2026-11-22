import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';
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
  signInWithGmailPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithGmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  sendGmailMagicLink: (email: string) => Promise<{ error: Error | null }>;
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
    // 1. Detect any callback errors passed in URL
    const urlOAuthError = authService.parseOAuthErrorFromUrl();
    if (urlOAuthError) {
      setError(`Authentication notice: ${urlOAuthError}`);
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

        if (
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code')
        ) {
          authService.cleanOAuthUrl('#app');
        }
      }
      setIsLoading(false);
    });

    // 4. Real-time auth listener for token refresh and session state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      setProfile(authService.getUserProfile(currentUser));

      if (event === 'SIGNED_IN' && newSession?.user) {
        setError(null);
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
   * Signs in with Gmail and password
   */
  const signInWithGmailPassword = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      setError(null);
      const res = await authService.signInWithPassword(email, password);
      if (res.error) {
        setError(res.error.message);
        return { error: res.error };
      }
      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        setProfile(authService.getUserProfile(res.user));
      }
      return { error: null };
    },
    []
  );

  /**
   * Registers a new user with Gmail and password
   */
  const signUpWithGmail = useCallback(
    async (email: string, password: string, fullName?: string): Promise<{ error: Error | null }> => {
      setError(null);
      const res = await authService.signUp(email, password, fullName);
      if (res.error) {
        setError(res.error.message);
        return { error: res.error };
      }
      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        setProfile(authService.getUserProfile(res.user));
      }
      return { error: null };
    },
    []
  );

  /**
   * Sends a passwordless Magic Link to Gmail
   */
  const sendGmailMagicLink = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      setError(null);
      const res = await authService.sendMagicLink(email);
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
      if (window.location.hash === '#app') {
        window.location.hash = '';
      }
    }
  }, []);

  /**
   * Demo Sign-In for instant evaluation
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
        provider: 'gmail',
        providers: ['gmail'],
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
      id: demoUser.id,
      email: 'creator@mivo.app',
      fullName: 'Mivo Creator',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'demo',
    });
    setError(null);
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
      signInWithGmailPassword,
      signUpWithGmail,
      sendGmailMagicLink,
      signOut,
      demoSignIn,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      error,
      clearError,
      signInWithGmailPassword,
      signUpWithGmail,
      sendGmailMagicLink,
      signOut,
      demoSignIn,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
