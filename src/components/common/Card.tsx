import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  selected = false,
  padding = 'md',
  children,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={cn(
        'rounded-2xl bg-white dark:bg-dark-card border border-black/[0.04] dark:border-white/[0.06] shadow-soft-sm transition-all duration-200',
        paddings[padding],
        hoverable &&
          'hover:border-charcoal-200 dark:hover:border-dark-border hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer',
        selected &&
          'border-brand-500/60 dark:border-brand-500/60 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
