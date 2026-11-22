import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'pill', className }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        className={cn(
          'p-2 rounded-xl text-charcoal-600 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white',
          'bg-warm-200/60 dark:bg-dark-card hover:bg-warm-300/60 dark:hover:bg-dark-cardHover',
          'border border-black/[0.04] dark:border-white/[0.06] transition-colors',
          className
        )}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-mivoYellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-brand-600" />
        )}
      </button>
    );
  }

  // Pill variant with 3 states: Light, Dark, System
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-warm-200/80 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06]',
        className
      )}
    >
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
          theme === 'light'
            ? 'bg-white text-charcoal-900 shadow-soft-sm'
            : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-800 dark:hover:text-white'
        )}
        title="Light theme"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
          theme === 'dark'
            ? 'bg-dark-card text-white shadow-soft-sm'
            : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-800 dark:hover:text-white'
        )}
        title="Dark theme"
      >
        <Moon className="w-3.5 h-3.5 text-brand-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
          theme === 'system'
            ? 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
            : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-800 dark:hover:text-white'
        )}
        title="System default"
      >
        <Monitor className="w-3.5 h-3.5 text-charcoal-400 dark:text-dark-muted" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
};
