import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'purple' | 'pink' | 'yellow' | 'green' | 'outline';
  colorHex?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  colorHex,
  size = 'sm',
  dot = false,
  children,
  style,
  ...props
}) => {
  const variants = {
    default:
      'bg-warm-200/90 dark:bg-dark-surface text-charcoal-700 dark:text-charcoal-200 border-black/[0.04] dark:border-white/[0.06]',
    purple:
      'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-brand-200/60 dark:border-brand-800/40',
    pink:
      'bg-mivoPink-50 dark:bg-mivoPink-950/50 text-mivoPink-600 dark:text-mivoPink-300 border-mivoPink-200/60 dark:border-mivoPink-800/40',
    yellow:
      'bg-mivoYellow-50 dark:bg-mivoYellow-950/50 text-amber-800 dark:text-mivoYellow-300 border-mivoYellow-200/60 dark:border-mivoYellow-800/40',
    green:
      'bg-mivoGreen-50 dark:bg-mivoGreen-950/50 text-mivoGreen-700 dark:text-mivoGreen-300 border-mivoGreen-200/60 dark:border-mivoGreen-800/40',
    outline:
      'border-charcoal-200 dark:border-dark-border text-charcoal-600 dark:text-dark-muted bg-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  const customStyle: React.CSSProperties = colorHex
    ? {
        backgroundColor: `${colorHex}15`,
        color: colorHex,
        borderColor: `${colorHex}30`,
        ...style,
      }
    : { ...style };

  return (
    <span
      style={customStyle}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border select-none',
        sizes[size],
        !colorHex && variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={colorHex ? { backgroundColor: colorHex } : undefined}
        />
      )}
      {children}
    </span>
  );
};
