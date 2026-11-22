import React from 'react';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  dotAi?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  variant = 'auto',
  className,
  dotAi = true,
}) => {
  const isLightVariant = variant === 'light'; // Light text for dark/hero backdrops

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      {/* Signature soundwave icon inspired directly by the reference image */}
      <div className={cn('relative flex items-center justify-center flex-shrink-0', iconSizes[size])}>
        {/* Tiny 4-point sparkle on top-left of the wave */}
        <svg
          className="absolute -top-0.5 -left-1 w-2.5 h-2.5 text-glowOrange-400 fill-current opacity-90 animate-pulse"
          viewBox="0 0 24 24"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>

        {/* 4 soundwave vertical bars */}
        <div className="flex items-center gap-[2.5px] h-full py-1">
          <span
            className={cn(
              'w-[3px] rounded-full transition-all duration-300 h-3 group-hover:h-4',
              isLightVariant ? 'bg-white' : 'bg-charcoal-900 dark:bg-white'
            )}
          />
          <span
            className={cn(
              'w-[3px] rounded-full transition-all duration-300 h-6 group-hover:h-5',
              isLightVariant ? 'bg-white' : 'bg-charcoal-900 dark:bg-white'
            )}
          />
          <span
            className={cn(
              'w-[3px] rounded-full transition-all duration-300 h-4 group-hover:h-6',
              isLightVariant ? 'bg-white' : 'bg-charcoal-900 dark:bg-white'
            )}
          />
          <span
            className={cn(
              'w-[3px] rounded-full transition-all duration-300 h-2.5 group-hover:h-3.5',
              isLightVariant ? 'bg-white' : 'bg-charcoal-900 dark:bg-white'
            )}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            'leading-none',
            textSizes[size],
            isLightVariant
              ? 'text-white'
              : variant === 'dark'
              ? 'text-charcoal-900'
              : 'text-charcoal-900 dark:text-white'
          )}
        >
          {APP_NAME.toLowerCase()}
          {dotAi && <span className="opacity-80 font-semibold text-[0.8em]">.ai</span>}
        </span>
        {showTagline && (
          <span
            className={cn(
              'text-[10px] font-medium tracking-normal mt-0.5',
              isLightVariant ? 'text-white/70' : 'text-charcoal-500 dark:text-dark-muted'
            )}
          >
            {APP_TAGLINE}
          </span>
        )}
      </div>
    </div>
  );
};
