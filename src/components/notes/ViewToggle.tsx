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
        'inline-flex items-center p-1 rounded-xl bg-white/80 backdrop-blur-md border border-white/80 shadow-soft-xs',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 transition-all',
          viewMode === 'grid' && 'bg-white text-charcoal-900 shadow-soft-xs'
        )}
        title="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 transition-all',
          viewMode === 'list' && 'bg-white text-charcoal-900 shadow-soft-xs'
        )}
        title="List view"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
