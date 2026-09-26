/**
 * Brand Logo Resolution Utilities
 * Resolves pixel-perfect, high-definition SVG vector logos with graceful fallbacks
 */

import type { Brand } from '../types/finance';

const HIGH_RES_BRAND_LOGOS: Record<string, string[]> = {
  mercadona: [
    'https://cdn.worldvectorlogo.com/logos/mercadona.svg',
    'https://unavatar.io/mercadona.es?fallback=false',
  ],
  netflix: ['https://cdn.simpleicons.org/netflix'],
  dazn: ['https://cdn.simpleicons.org/dazn/white'],
  spotify: ['https://cdn.simpleicons.org/spotify'],
  apple: ['https://cdn.simpleicons.org/apple/white'],
  amazon: ['https://unavatar.io/amazon.es?fallback=false'],
  carrefour: ['https://cdn.simpleicons.org/carrefour'],
  lidl: ['https://cdn.simpleicons.org/lidl'],
  dia: ['https://unavatar.io/dia.es?fallback=false'],
  alcampo: ['https://unavatar.io/alcampo.es?fallback=false'],
  elcorteingles: ['https://unavatar.io/elcorteingles.es?fallback=false'],
  costco: ['https://unavatar.io/costco.com?fallback=false'],
  disneyplus: ['https://unavatar.io/disneyplus.com?fallback=false'],
  youtube: ['https://cdn.simpleicons.org/youtube'],
  twitch: ['https://cdn.simpleicons.org/twitch'],
  playstation: ['https://cdn.simpleicons.org/playstation/white'],
  mcdonalds: ['https://cdn.simpleicons.org/mcdonalds'],
  burgerking: ['https://cdn.simpleicons.org/burgerking'],
  starbucks: ['https://cdn.simpleicons.org/starbucks'],
  glovo: ['https://cdn.simpleicons.org/glovo'],
  justeat: ['https://cdn.simpleicons.org/justeat'],
  ubereats: ['https://cdn.simpleicons.org/ubereats'],
  repsol: [
    'https://unavatar.io/repsol.com?fallback=false',
    'https://www.google.com/s2/favicons?domain=repsol.com&sz=128',
  ],
  cepsa: ['https://unavatar.io/cepsa.com?fallback=false'],
  uber: ['https://cdn.simpleicons.org/uber/white'],
  cabify: ['https://unavatar.io/cabify.com?fallback=false'],
  renfe: ['https://unavatar.io/renfe.com?fallback=false'],
  iberia: ['https://cdn.simpleicons.org/iberia'],
  vueling: ['https://unavatar.io/vueling.com?fallback=false'],
  zara: ['https://cdn.simpleicons.org/zara/white'],
  ikea: ['https://cdn.simpleicons.org/ikea'],
  decathlon: ['https://unavatar.io/decathlon.es?fallback=false'],
  aliexpress: ['https://cdn.simpleicons.org/aliexpress'],
  iberdrola: ['https://unavatar.io/iberdrola.es?fallback=false'],
  endesa: ['https://unavatar.io/endesa.com?fallback=false'],
  naturgy: ['https://unavatar.io/naturgy.es?fallback=false'],
  movistar: ['https://cdn.simpleicons.org/movistar'],
  vodafone: ['https://cdn.simpleicons.org/vodafone'],
  orange: ['https://cdn.simpleicons.org/orange'],
  vanguard: ['https://unavatar.io/vanguard.com?fallback=false'],
  traderepublic: ['https://unavatar.io/traderepublic.com?fallback=false'],
  myinvestor: ['https://unavatar.io/myinvestor.es?fallback=false'],
  revolut: ['https://cdn.simpleicons.org/revolut/white'],
  bbva: ['https://unavatar.io/bbva.es?fallback=false'],
  santander: ['https://unavatar.io/santander.com?fallback=false'],
  binance: ['https://cdn.simpleicons.org/binance'],
  coinbase: ['https://cdn.simpleicons.org/coinbase'],
  kraken: ['https://unavatar.io/kraken.com?fallback=false'],
};

const BRAND_DOMAIN_MAP: Record<string, string> = {
  'mercadona': 'mercadona.es',
  'netflix': 'netflix.com',
  'dazn': 'dazn.com',
  'spotify': 'spotify.com',
  'apple': 'apple.com',
  'amazon': 'amazon.es',
  'carrefour': 'carrefour.es',
  'lidl': 'lidl.es',
  'dia': 'dia.es',
  'alcampo': 'alcampo.es',
  'elcorteingles': 'elcorteingles.es',
  'costco': 'costco.com',
  'disneyplus': 'disneyplus.com',
  'youtube': 'youtube.com',
  'twitch': 'twitch.tv',
  'playstation': 'playstation.com',
  'mcdonalds': 'mcdonalds.com',
  'burgerking': 'burgerking.es',
  'starbucks': 'starbucks.com',
  'glovo': 'glovoapp.com',
  'justeat': 'just-eat.es',
  'ubereats': 'ubereats.com',
  'repsol': 'repsol.com',
  'cepsa': 'cepsa.com',
  'uber': 'uber.com',
  'cabify': 'cabify.com',
  'renfe': 'renfe.com',
  'iberia': 'iberia.com',
  'vueling': 'vueling.com',
  'zara': 'zara.com',
  'ikea': 'ikea.com',
  'decathlon': 'decathlon.es',
  'aliexpress': 'aliexpress.com',
  'iberdrola': 'iberdrola.es',
  'endesa': 'endesa.com',
  'naturgy': 'naturgy.es',
  'movistar': 'movistar.es',
  'vodafone': 'vodafone.es',
  'orange': 'orange.es',
  'vanguard': 'vanguard.com',
  'traderepublic': 'traderepublic.com',
  'myinvestor': 'myinvestor.es',
  'revolut': 'revolut.com',
  'bbva': 'bbva.es',
  'santander': 'santander.com',
  'binance': 'binance.com',
  'coinbase': 'coinbase.com',
  'kraken': 'kraken.com',
};

export function getBrandLogoSources(brand?: Brand): string[] {
  if (!brand) return [];

  const sources: string[] = [];

  if (brand.logoUrl) {
    sources.push(brand.logoUrl);
  }

  const slug = (brand.slug || '').toLowerCase().replace(/^brand-/, '');
  const id = (brand.id || '').toLowerCase().replace(/^brand-/, '');

  // 1. Direct high-definition vector logo from explicit catalog
  const highResList = HIGH_RES_BRAND_LOGOS[slug] || HIGH_RES_BRAND_LOGOS[id];
  if (highResList) {
    sources.push(...highResList);
  }

  // 2. Generic SimpleIcons SVG resolution for any slug
  if (slug && slug.length >= 2) {
    sources.push(`https://cdn.simpleicons.org/${slug}`);
  }

  // 3. Generic fallback by domain across multiple HD CDNs
  const domain = brand.domain || BRAND_DOMAIN_MAP[id] || BRAND_DOMAIN_MAP[slug];
  if (domain) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    sources.push(`https://unavatar.io/${cleanDomain}?fallback=false`);
    sources.push(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`);
    sources.push(`https://logo.clearbit.com/${cleanDomain}`);
  }

  return [...new Set(sources.filter(Boolean))];
}

