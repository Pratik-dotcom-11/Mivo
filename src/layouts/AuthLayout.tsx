import React from 'react';
import { Logo } from '@/components/common';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF7F2] text-charcoal-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Dreamy Floral Glow Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/dreamy-glow-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-85 filter saturate-120 contrast-105"
        />
        <div className="absolute inset-0 bg-white/15 backdrop-blur-[2px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full">
        {/* Top Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
          <Logo size="md" showTagline />
        </header>

        {/* Centered Auth Card */}
        <main className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-soft-2xl space-y-6">
            {children}
          </div>

          {/* Minimal Footer */}
          <p className="text-center text-xs text-charcoal-500 mt-6 font-semibold">
            Mivo — Minimal AI Voice Notes &copy; {new Date().getFullYear()}
          </p>
        </main>

        {/* Decorative Bottom Bar spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
};
