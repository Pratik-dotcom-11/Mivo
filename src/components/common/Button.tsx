import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'pastel-purple'
    | 'pastel-pink'
    | 'pastel-yellow'
    | 'pastel-green'
    | 'google';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-soft-sm shadow-brand-500/25 focus-visible:ring-brand-500',
      secondary:
        'bg-warm-200/80 hover:bg-warm-300/80 active:bg-warm-300 text-charcoal-800 dark:bg-dark-card dark:hover:bg-dark-cardHover dark:text-charcoal-100 border border-black/[0.04] dark:border-white/[0.06] shadow-soft-sm focus-visible:ring-charcoal-400',
      outline:
        'border border-charcoal-200 dark:border-dark-border bg-transparent text-charcoal-700 dark:text-charcoal-200 hover:bg-warm-100 dark:hover:bg-dark-card focus-visible:ring-brand-500',
      ghost:
        'text-charcoal-600 dark:text-dark-muted hover:bg-warm-200/60 dark:hover:bg-dark-card hover:text-charcoal-900 dark:hover:text-white focus-visible:ring-charcoal-400',
      danger:
        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-soft-sm shadow-red-500/20 focus-visible:ring-red-400',
      'pastel-purple':
        'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200/60 dark:border-brand-800/40 focus-visible:ring-brand-400',
      'pastel-pink':
        'bg-mivoPink-50 dark:bg-mivoPink-950/40 text-mivoPink-600 dark:text-mivoPink-300 hover:bg-mivoPink-100 dark:hover:bg-mivoPink-900/40 border border-mivoPink-200/60 dark:border-mivoPink-800/40 focus-visible:ring-mivoPink-400',
      'pastel-yellow':
        'bg-mivoYellow-50 dark:bg-mivoYellow-950/40 text-amber-800 dark:text-mivoYellow-300 hover:bg-mivoYellow-100 dark:hover:bg-mivoYellow-900/40 border border-mivoYellow-200/60 dark:border-mivoYellow-800/40 focus-visible:ring-mivoYellow-400',
      'pastel-green':
        'bg-mivoGreen-50 dark:bg-mivoGreen-950/40 text-mivoGreen-700 dark:text-mivoGreen-300 hover:bg-mivoGreen-100 dark:hover:bg-mivoGreen-900/40 border border-mivoGreen-200/60 dark:border-mivoGreen-800/40 focus-visible:ring-mivoGreen-400',
      google:
        'bg-white dark:bg-dark-card text-charcoal-800 dark:text-charcoal-100 border border-charcoal-200/80 dark:border-dark-border hover:bg-warm-50 dark:hover:bg-dark-cardHover shadow-soft-sm hover:shadow-soft-md focus-visible:ring-brand-500',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
      sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-5 py-2.5 rounded-2xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size="sm"
            className={
              variant === 'primary' || variant === 'danger'
                ? 'text-white'
                : 'text-brand-600 dark:text-brand-400'
            }
          />
        ) : variant === 'google' && !leftIcon ? (
          <GoogleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 5c1.56 0 2.96.54 4.07 1.6l3.05-3.05C17.27 1.8 14.82 1 12 1 7.42 1 3.51 3.6 1.65 7.42l3.69 2.86C6.22 7.15 8.87 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.86c2.15-1.99 3.72-4.92 3.72-8.68z"
    />
    <path
      fill="#FBBC05"
      d="M5.34 14.72c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17L1.65 7.42C.6 9.5 0 11.83 0 14.29s.6 4.79 1.65 6.87l3.69-2.86c-.23-.68-.36-1.41-.36-2.17z"
    />
    <path
      fill="#34A853"
      d="M12 23.58c3.24 0 5.95-1.07 7.94-2.91l-3.68-2.86c-1.07.72-2.45 1.15-4.26 1.15-3.13 0-5.78-2.15-6.66-5.28L1.65 16.54C3.51 20.4 7.42 23.58 12 23.58z"
    />
  </svg>
);
