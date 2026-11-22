import React from 'react';
import { Logo, ThemeToggle } from '@/components/common';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-warm-100 dark:bg-dark-bg text-charcoal-800 dark:text-charcoal-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header with Theme Switcher */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <Logo size="md" showTagline />
        <ThemeToggle variant="icon" />
      </header>

      {/* Centered Auth Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-dark-card border border-black/[0.04] dark:border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-soft-lg space-y-6">
          {children}
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-charcoal-400 dark:text-dark-muted mt-6 font-medium">
          Mivo — Minimal AI Voice Notes &copy; {new Date().getFullYear()}
        </p>
      </main>

      {/* Decorative Bottom Bar spacer */}
      <div className="h-6" />
    </div>
  );
};
