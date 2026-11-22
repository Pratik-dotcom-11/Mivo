import React from 'react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export interface CategoryFilterPillsProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  allNotesCount?: number;
}

export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  allNotesCount,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {/* All Notes Pill */}
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border',
          activeCategoryId === null
            ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft-sm'
            : 'bg-white/85 backdrop-blur-md text-charcoal-700 border-white/80 hover:bg-white shadow-soft-xs'
        )}
      >
        <span>All Notes</span>
        {allNotesCount !== undefined && (
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              activeCategoryId === null
                ? 'bg-white/20 text-white'
                : 'bg-warm-200 text-charcoal-600'
            )}
          >
            {allNotesCount}
          </span>
        )}
      </button>

      {/* Category Pills */}
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border',
              isActive
                ? 'shadow-soft-sm font-bold'
                : 'bg-white/85 backdrop-blur-md text-charcoal-700 border-white/80 hover:bg-white shadow-soft-xs'
            )}
            style={
              isActive
                ? {
                    backgroundColor: `${cat.color}20`,
                    borderColor: cat.color,
                    color: cat.color,
                  }
                : undefined
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cat.color || '#8B5CF6' }}
            />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
