/**
 * Market Quote Cache Service
 * Handles persistence, in-memory fallback, expiration pruning,
 * in-flight request deduplication, and SWR freshness timestamps.
 */

import type { MarketQuoteResult } from '../types/finance';

export const CACHE_STORAGE_KEY = 'fluo_market_quotes_cache_v1';
/** Quotes older than 23 hours are considered expired and will be re-fetched on next boot. */
export const CACHE_MAX_AGE_MS = 23 * 60 * 60 * 1000; // 23 hours
export const SWR_FRESH_WINDOW_MS = 25_000; // 25s fresh window

// In-memory cache fallback for SSR / testing / environments without localStorage
let memoryCache: Record<string, MarketQuoteResult> = {};

// Deduplication & Stale-While-Revalidate memory registries
export const inFlightQuotePromises = new Map<string, Promise<MarketQuoteResult>>();
export const swrQuoteTimestamps = new Map<string, number>();

/**
 * Local Storage & Memory Quotes Cache Helper
 */
export function getQuotesCache(): Record<string, MarketQuoteResult> {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : memoryCache;
    } catch {
      return memoryCache;
    }
  }
  return memoryCache;
}

export function saveQuoteToCache(quote: MarketQuoteResult): void {
  const cache = getQuotesCache();
  const entry = { ...quote, cachedAt: Date.now() };
  cache[quote.identifier] = entry;
  // Also index by ticker, isin and quoteTicker if available
  if (quote.ticker) cache[quote.ticker.toUpperCase()] = entry;
  if (quote.isin) cache[quote.isin.toUpperCase()] = entry;
  if (quote.quoteTicker) cache[quote.quoteTicker.toUpperCase()] = entry;
  memoryCache = cache;

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // Ignore storage quota exceeded or disabled
    }
  }
}

/**
 * Retrieves cached quote if available AND not expired.
 * Entries older than CACHE_MAX_AGE_MS are treated as non-existent so a live fetch is attempted.
 */
export function getQuoteFromCache(identifier: string): MarketQuoteResult | null {
  const cache = getQuotesCache();
  const entry = cache[identifier.trim().toUpperCase()];
  if (!entry) return null;
  // Treat entries without a cachedAt as potentially stale (legacy) — still return them but
  // mark isOfflineCached so the caller knows to re-fetch when possible.
  const cachedAt = (entry as any).cachedAt;
  if (cachedAt && Date.now() - cachedAt > CACHE_MAX_AGE_MS) {
    return null; // Expired — force a live fetch
  }
  return entry;
}

/**
 * Removes expired entries from the localStorage quote cache.
 * Call once on app init to clean legacy entries that have no cachedAt or are older than 23h.
 */
export function pruneExpiredQuoteCache(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return;
    const cache: Record<string, any> = JSON.parse(raw);
    const now = Date.now();
    let changed = false;
    for (const key of Object.keys(cache)) {
      const entry = cache[key];
      const cachedAt = entry?.cachedAt;
      // Remove entries with no cachedAt (legacy pre-fix) or entries older than 23h
      if (!cachedAt || now - cachedAt > CACHE_MAX_AGE_MS) {
        delete cache[key];
        changed = true;
      }
    }
    if (changed) {
      memoryCache = cache;
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Ignore
  }
}

/**
 * Clears market quotes cache
 */
export function clearMarketQuotesCache(): void {
  memoryCache = {};
  inFlightQuotePromises.clear();
  swrQuoteTimestamps.clear();
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Resets only the in-memory SWR freshness timestamps, forcing the next fetchCurrentPrice
 * call for each asset to perform an actual network fetch instead of returning cached data.
 * Use this when the user manually requests a price refresh.
 */
export function resetSwrTimestamps(): void {
  swrQuoteTimestamps.clear();
  inFlightQuotePromises.clear();
}

