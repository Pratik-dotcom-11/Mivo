import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange, className }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-warm-200/80 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06]',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'p-1.5 rounded-lg text-charcoal-500 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white transition-all',
          viewMode === 'grid' && 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
        )}
        title="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'p-1.5 rounded-lg text-charcoal-500 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white transition-all',
          viewMode === 'list' && 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
        )}
        title="List view"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
