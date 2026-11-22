import React from 'react';

export interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'dropdown';
  className?: string;
}

/**
 * ThemeToggle is disabled and renders null to enforce pure light mode.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  return null;
};
