import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Logo, Button } from '@/components/common';
import { GoogleIcon } from '@/components/common/Button';
import {
  Mic,
  Star,
  LogOut,
  Sparkles,
  Menu,
  X,
  AlertCircle,
  Hash,
  Compass,
} from 'lucide-react';
import type { Category } from '@/types';

export interface AppLayoutProps {
  children: React.ReactNode;
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onStartRecordClick: () => void;
  isFavoriteFilterActive?: boolean;
  onToggleFavoriteFilter?: () => void;
  allNotesCount?: number;
  favoritesCount?: number;
}

const UserAvatar: React.FC<{
  avatarUrl?: string | null;
  name: string;
  size?: 'sm' | 'md';
}> = ({ avatarUrl, name, size = 'sm' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const sizeClasses = size === 'sm' ? 'w-8 h-8 rounded-xl text-xs' : 'w-9 h-9 rounded-xl text-sm';
  const initial = (name || 'M').charAt(0).toUpperCase();

  if (avatarUrl && !imgFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgFailed(true)}
        className={`${sizeClasses} object-cover ring-1 ring-black/10 dark:ring-white/10 shadow-soft-xs flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-tr from-brand-600 to-mivoPink-500 text-white flex items-center justify-center font-bold shadow-soft-sm flex-shrink-0 select-none`}
    >
      {initial}
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  categories,
  activeCategoryId,
  onSelectCategory,
  onStartRecordClick,
  isFavoriteFilterActive = false,
  onToggleFavoriteFilter,
  allNotesCount = 0,
  favoritesCount = 0,
}) => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived user details from authenticated Google account / profile
  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Mivo User';

  const userEmail = profile?.email || user?.email || 'user@mivo.app';
  const userAvatar = profile?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const isGoogleUser = profile?.provider === 'google' || user?.app_metadata?.provider === 'google';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF7F2] text-charcoal-900 flex flex-col font-sans selection:bg-terracotta-500 selection:text-white">
      {/* Dreamy Floral Glow Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/dreamy-glow-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-85 filter saturate-120 contrast-105"
        />
        {/* Soft frosted glass diffusion wash keeping the app minimal, clean, and legible */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Unconfigured Supabase warning banner */}
        {!isConfigured && (
          <aside
            aria-label="Demo environment warning"
            className="bg-amber-500/15 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-900 flex items-center justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Running in Demo UI Mode.</strong> Voice recording, note creation, and categorization work live in local memory.
              </span>
            </div>
          </aside>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/70 shadow-soft-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Brand & Mobile Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-charcoal-500 hover:text-charcoal-900 hover:bg-white/80 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Logo size="md" showTagline />
            </div>

            {/* Quick Actions & Profile */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={onStartRecordClick}
                leftIcon={<Mic className="w-4 h-4" />}
                className="hidden sm:inline-flex bg-gradient-to-r from-terracotta-600 via-glowOrange-500 to-terracotta-700 hover:from-terracotta-500 hover:to-glowOrange-400 text-white shadow-glow-orange font-bold"
              >
                Record Voice Note
              </Button>

              {/* Authenticated User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-charcoal-200/80">
                <div
                  className="flex items-center gap-2"
                  title={`${displayName} (${userEmail})`}
                >
                  <UserAvatar avatarUrl={userAvatar} name={displayName} size="sm" />
                  <span className="hidden md:inline text-xs font-bold text-charcoal-800 max-w-[120px] truncate">
                    {displayName}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  title="Sign out of Mivo"
                  className="p-1.5 text-charcoal-400 hover:text-red-500 rounded-lg hover:bg-white/80 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl p-5 border-r border-white/80 transform transition-transform duration-200 ease-in-out
              lg:relative lg:translate-x-0 lg:z-auto lg:p-4 lg:bg-white/70 lg:backdrop-blur-xl lg:rounded-3xl lg:border lg:border-white/80 lg:shadow-soft-sm flex flex-col justify-between
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="space-y-6">
              {/* CTA inside mobile drawer */}
              <div className="lg:hidden">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartRecordClick();
                  }}
                  leftIcon={<Mic className="w-4 h-4" />}
                  className="w-full bg-gradient-to-r from-terracotta-600 via-glowOrange-500 to-terracotta-700 hover:from-terracotta-500 hover:to-glowOrange-400 text-white shadow-glow-orange font-bold"
                >
                  Record Voice Note
                </Button>
              </div>

              {/* Navigation Views */}
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2">
                  Views
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeCategoryId === null && !isFavoriteFilterActive
                        ? 'bg-white/95 text-charcoal-900 shadow-soft-xs border border-white/90'
                        : 'text-charcoal-600 hover:bg-white/80 hover:text-charcoal-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-glowOrange-500" />
                      <span>All Notes</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-charcoal-400">
                      {allNotesCount}
                    </span>
                  </button>

                  {onToggleFavoriteFilter && (
                    <button
                      onClick={() => {
                        onToggleFavoriteFilter();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isFavoriteFilterActive
                          ? 'bg-amber-50/90 text-amber-900 shadow-soft-xs border border-amber-200/80'
                          : 'text-charcoal-600 hover:bg-white/80 hover:text-charcoal-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span>Favorites</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-charcoal-400">
                        {favoritesCount}
                      </span>
                    </button>
                  )}
                </nav>
              </div>

              {/* Categories Section */}
              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                    Categories
                  </p>
                  <Compass className="w-3.5 h-3.5 text-charcoal-400" />
                </div>

                <nav className="space-y-1">
                  {categories.length === 0 ? (
                    <p className="px-3 text-xs text-charcoal-400 italic">
                      No categories defined
                    </p>
                  ) : (
                    categories.map((cat) => {
                      const isSelected = activeCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onSelectCategory(cat.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-white/95 text-charcoal-900 shadow-soft-xs border border-white/90'
                              : 'text-charcoal-600 hover:bg-white/80 hover:text-charcoal-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color || '#8B5CF6' }}
                            />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <Hash className="w-3 h-3 text-charcoal-300" />
                        </button>
                      );
                    })
                  )}
                </nav>
              </div>
            </div>

            {/* User Profile Footer in Sidebar */}
            <div className="pt-4 border-t border-charcoal-100/80 mt-auto">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-soft-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar avatarUrl={userAvatar} name={displayName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-charcoal-900 truncate">
                        {displayName}
                      </p>
                      {isGoogleUser && (
                        <span title="Signed in with Google" className="flex-shrink-0">
                          <GoogleIcon className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-charcoal-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="p-1.5 text-charcoal-400 hover:text-red-500 rounded-lg hover:bg-warm-100 transition-colors"
                  title="Sign out of Mivo"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile backdrop */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content Viewport */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
