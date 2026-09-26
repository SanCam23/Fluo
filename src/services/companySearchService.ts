/**
 * Global Company & Brand Search Service
 * Connects to public company autocomplete engines (e.g. Clearbit API)
 * indexing 25+ million companies globally in real-time.
 */

import type { Brand } from '../types/finance';

export interface GlobalBrandSuggestion {
  name: string;
  domain: string;
  logoUrl?: string;
  suggestedCategoryId: string;
}

// In-memory cache to prevent repeated network queries while typing
const searchCache = new Map<string, GlobalBrandSuggestion[]>();

/**
 * Heuristic category predictor based on company name and domain
 */
export function inferCategoryId(name: string, domain: string): string {
  const text = `${name.toLowerCase()} ${domain.toLowerCase()}`;

  // 1. Supermercados & Alimentación
  if (
    /super|market|grocer|food|aliment|dia|mercadona|carrefour|lidl|alcampo|eroski|consum|costco|walmart|spar/i.test(
      text
    )
  ) {
    return 'cat-food';
  }

  // 2. Suscripciones, Streaming & Tech
  if (
    /tv|stream|music|play|game|movie|podcast|soft|cloud|host|app|vpn|netflix|spotify|hbo|disney|apple|youtube|twitch|steam|nintendo|playstation|xbox|adobe|figma|notion|github|openai/i.test(
      text
    )
  ) {
    return 'cat-subs';
  }

  // 3. Restauración & Hostelería
  if (
    /restauran|burger|pizza|cafe|coffee|bar|taco|grill|bakery|diner|mcdonald|starbucks|kfc|glovo|justeat|ubereats|deliver/i.test(
      text
    )
  ) {
    return 'cat-leisure';
  }

  // 4. Transporte, Combustible & Viajes
  if (
    /air|flight|airline|fly|travel|hotel|rent|car|auto|gas|fuel|petrol|parking|train|rail|taxi|ride|uber|cabify|bolt|renfe|repsol|cepsa|bp|shell|booking|airbnb|vueling|iberia|ryanair/i.test(
      text
    )
  ) {
    return 'cat-transport';
  }

  // 5. Salud, Bienestar & Fitness
  if (
    /gym|fit|crossfit|health|salud|clinic|dental|pharma|farmacia|medical|sanitas|adeslas|hospital/i.test(
      text
    )
  ) {
    return 'cat-health';
  }

  // 6. Suministros, Hogar & Telecom
  if (
    /power|energy|electric|luz|gas|telecom|fiber|mobile|movistar|vodafone|orange|digi|ikea|leroy|home|casa/i.test(
      text
    )
  ) {
    return 'cat-housing';
  }

  // 7. Banca, Finanzas & Cripto
  if (
    /bank|banco|finan|invest|broker|credit|card|pay|crypto|coin|trade|revolut|bbva|santander|caixa|binance|coinbase/i.test(
      text
    )
  ) {
    return 'cat-salary';
  }

  // Default to general shopping/compras
  return 'cat-shopping';
}

/**
 * Search global companies live using Clearbit Company Autocomplete
 */
export async function searchGlobalBrands(
  query: string,
  signal?: AbortSignal
): Promise<GlobalBrandSuggestion[]> {
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return [];

  if (searchCache.has(clean)) {
    return searchCache.get(clean)!;
  }

  try {
    const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
      clean
    )}`;

    const response = await fetch(url, { signal });
    if (!response.ok) return [];

    const data: Array<{ name: string; domain: string; logo?: string | null }> =
      await response.json();

    if (!Array.isArray(data)) return [];

    const results: GlobalBrandSuggestion[] = data.slice(0, 6).map((item) => {
      const cleanDomain = item.domain
        ? item.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
        : '';

      return {
        name: item.name || clean,
        domain: cleanDomain,
        logoUrl: item.logo || undefined,
        suggestedCategoryId: inferCategoryId(item.name || '', cleanDomain),
      };
    });

    searchCache.set(clean, results);
    return results;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return [];
    }
    console.warn('Global brand search failed or timed out:', err);
    return [];
  }
}

/**
 * Converts a GlobalBrandSuggestion or user-typed text into a Brand entity
 */
export function createBrandFromSuggestion(
  suggestion: { name: string; domain?: string; logoUrl?: string; categoryId?: string },
  fallbackCategoryId = 'cat-shopping'
): Brand {
  const slug = suggestion.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const id = `brand-ext-${slug || Date.now()}`;

  return {
    id,
    name: suggestion.name,
    slug,
    domain: suggestion.domain,
    logoUrl: suggestion.logoUrl,
    categoryId: suggestion.categoryId || fallbackCategoryId,
    isPopular: false,
  };
}
