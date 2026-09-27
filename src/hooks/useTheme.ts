import { useEffect, useState, useCallback } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import type { ThemeMode } from '../types/finance';

/**
 * useTheme Hook
 *
 * Manages theme state (system | dark | light) and synchronizes:
 * 1. `document.documentElement` class ('dark' | 'light')
 * 2. `data-theme` attribute
 * 3. `color-scheme` CSS property
 * 4. `<meta name="theme-color">` for mobile browser & PWA status bars
 */
export function useTheme() {
  const themeMode = useFinanceStore((state) => state.themeMode) || 'dark';
  const setThemeModeStore = useFinanceStore((state) => state.setThemeMode);

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen for operating system appearance changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: 'dark' | 'light' =
    themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  const isDark = resolvedTheme === 'dark';

  // Synchronize document attributes, classes, and PWA theme-color
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    // Update <meta name="theme-color">
    const themeColor = isDark ? '#0B0F19' : '#F1F5F9';
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      tag.setAttribute('content', themeColor);
    });

    // Update iOS status bar meta
    const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusMeta) {
      appleStatusMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
    }
  }, [resolvedTheme, isDark]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeStore(mode);
    },
    [setThemeModeStore]
  );

  return {
    themeMode,
    resolvedTheme,
    isDark,
    setThemeMode,
  };
}
