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
        'rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-sm transition-all duration-200',
        paddings[padding],
        hoverable &&
          'hover:border-terracotta-300/60 hover:shadow-soft-lg hover:-translate-y-0.5 cursor-pointer',
        selected &&
          'border-brand-500/80 ring-2 ring-brand-500/20 bg-brand-50/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
