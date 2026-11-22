import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, onClear, id, value, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-charcoal-700 dark:text-charcoal-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-charcoal-400 dark:text-dark-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            value={value}
            className={cn(
              'w-full rounded-xl border border-white/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-sm text-charcoal-900 placeholder-charcoal-400 transition-all duration-150 shadow-soft-xs',
              'focus:bg-white focus:border-glowOrange-500 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20',
              leftIcon && 'pl-10',
              (rightIcon || (onClear && value)) && 'pr-10',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {onClear && value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 p-1 text-charcoal-400 hover:text-charcoal-600 dark:text-dark-muted dark:hover:text-charcoal-200 rounded-lg"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center text-charcoal-400 dark:text-dark-muted">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-charcoal-400 dark:text-dark-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
