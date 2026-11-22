import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { NotesPage } from '@/pages/NotesPage';
import { Spinner } from '@/components/common/Spinner';

type AppView = 'landing' | 'auth' | 'app';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Landing page MUST always load first unless the user explicitly requested #app or #auth in the URL
  const [view, setView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'auth') return 'auth';
      if (hash === 'app') return 'app';
    }
    return 'landing';
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'auth') {
        setView('auth');
      } else if (hash === 'app') {
        setView('app');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Protected route enforcement: if user navigates to '#app' without an authenticated session, redirect to '#auth'
  useEffect(() => {
    if (!isLoading && view === 'app' && !user) {
      setView('auth');
      window.location.hash = '#auth';
    }
  }, [isLoading, view, user]);

  const navigateTo = (newView: AppView) => {
    setView(newView);
    window.location.hash = newView === 'landing' ? '' : `#${newView}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-100 dark:bg-dark-bg space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 flex items-center justify-center text-white shadow-glow-orange animate-pulse">
          <Spinner size="md" className="text-white" />
        </div>
        <p className="text-xs font-bold text-charcoal-500 dark:text-dark-muted tracking-widest uppercase">
          Loading Mivo...
        </p>
      </div>
    );
  }

  // Explicit View 1: Authenticated Application Dashboard (Protected Route)
  if (view === 'app') {
    // If not authenticated, protect the dashboard and present AuthPage
    if (!user) {
      return (
        <AuthPage
          onBackToLanding={() => navigateTo('landing')}
          onAuthenticated={() => navigateTo('app')}
        />
      );
    }
    return <NotesPage onNavigateToLanding={() => navigateTo('landing')} />;
  }

  // Explicit View 2: Authentication Page
  if (view === 'auth') {
    // If user is already authenticated, take them directly to the dashboard
    if (user) {
      return <NotesPage onNavigateToLanding={() => navigateTo('landing')} />;
    }
    return (
      <AuthPage
        onBackToLanding={() => navigateTo('landing')}
        onAuthenticated={() => navigateTo('app')}
      />
    );
  }

  // Default View (Always loads first): Public Landing Page
  return (
    <LandingPage
      onNavigateToAuth={() => navigateTo('auth')}
      onNavigateToApp={() => navigateTo(user ? 'app' : 'auth')}
    />
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
