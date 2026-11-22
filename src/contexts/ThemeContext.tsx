import React, { createContext, useContext, useEffect, useMemo } from 'react';

export type Theme = 'light';
export type ResolvedTheme = 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'mivo-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Strictly lock to light mode
    const root = document.documentElement;
    root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setTheme = () => {
    // Light mode only
  };

  const toggleTheme = () => {
    // Light mode only
  };

  const value = useMemo(
    () => ({
      theme: 'light' as const,
      resolvedTheme: 'light' as const,
      setTheme,
      toggleTheme,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
