import { useState, useEffect } from 'react';

/**
 * Custom hook that subscribes to a CSS media query string (e.g. '(min-width: 1024px)').
 * Avoids rendering hidden charts in DOM, eliminating Recharts width(0)/height(0) warnings.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handler);
      return () => mediaQueryList.removeEventListener('change', handler);
    } else if ((mediaQueryList as any).addListener) {
      (mediaQueryList as any).addListener(handler);
      return () => (mediaQueryList as any).removeListener(handler);
    }
  }, [query]);

  return matches;
}

