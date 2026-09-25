import type { Category, Brand } from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  // Ingresos
  { id: 'cat-salary', name: 'Nómina y Salario', pillar: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'cat-dividends', name: 'Dividendos y Rentas', pillar: 'income', icon: 'Coins', color: '#34D399' },
  { id: 'cat-sales', name: 'Ventas y Freelance', pillar: 'income', icon: 'Sparkles', color: '#6EE7B7' },

  // Gastos
  { id: 'cat-food', name: 'Supermercado y Alimentación', pillar: 'expense', icon: 'ShoppingBag', color: '#F87171' },
  { id: 'cat-subs', name: 'Suscripciones y Streaming', pillar: 'expense', icon: 'Tv', color: '#EF4444' },
  { id: 'cat-housing', name: 'Vivienda y Facturas', pillar: 'expense', icon: 'Home', color: '#FB7185' },
  { id: 'cat-transport', name: 'Transporte y Movilidad', pillar: 'expense', icon: 'Car', color: '#F43F5E' },
  { id: 'cat-leisure', name: 'Ocio y Restaurantes', pillar: 'expense', icon: 'Utensils', color: '#E11D48' },
  { id: 'cat-health', name: 'Salud y Cuidado', pillar: 'expense', icon: 'HeartPulse', color: '#BE123C' },

  // Inversiones
  { id: 'cat-etf', name: 'Fondos y ETFs', pillar: 'invest', icon: 'TrendingUp', color: '#6366F1' },
  { id: 'cat-stocks', name: 'Acciones Bursátiles', pillar: 'invest', icon: 'LineChart', color: '#818CF8' },
  { id: 'cat-crypto', name: 'Criptoactivos', pillar: 'invest', icon: 'Bitcoin', color: '#A5B4FC' },
  { id: 'cat-fixed', name: 'Renta Fija y Bonos', pillar: 'invest', icon: 'ShieldCheck', color: '#C7D2FE' },
  { id: 'cat-deposit', name: 'Depósitos y Liquidez', pillar: 'invest', icon: 'Vault', color: '#4F46E5' },
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-mercadona',
    name: 'Mercadona',
    slug: 'mercadona',
    categoryId: 'cat-food',
    brandColor: '#009E60',
    isPopular: true,
  },
  {
    id: 'brand-carrefour',
    name: 'Carrefour',
    slug: 'carrefour',
    categoryId: 'cat-food',
    brandColor: '#0055A5',
    isPopular: true,
  },
  {
    id: 'brand-netflix',
    name: 'Netflix',
    slug: 'netflix',
    categoryId: 'cat-subs',
    brandColor: '#E50914',
    isPopular: true,
  },
  {
    id: 'brand-dazn',
    name: 'DAZN',
    slug: 'dazn',
    categoryId: 'cat-subs',
    brandColor: '#F8F8F8',
    isPopular: true,
  },
  {
    id: 'brand-spotify',
    name: 'Spotify',
    slug: 'spotify',
    categoryId: 'cat-subs',
    brandColor: '#1DB954',
    isPopular: true,
  },
  {
    id: 'brand-repsol',
    name: 'Repsol',
    slug: 'repsol',
    categoryId: 'cat-transport',
    brandColor: '#FF8200',
    isPopular: true,
  },
  {
    id: 'brand-apple',
    name: 'Apple',
    slug: 'apple',
    categoryId: 'cat-subs',
    brandColor: '#A2AAAD',
    isPopular: true,
  },
  {
    id: 'brand-amazon',
    name: 'Amazon Prime',
    slug: 'amazon',
    categoryId: 'cat-subs',
    brandColor: '#00A8E1',
    isPopular: true,
  },
  {
    id: 'brand-iberdrola',
    name: 'Iberdrola',
    slug: 'iberdrola',
    categoryId: 'cat-housing',
    brandColor: '#28A745',
    isPopular: true,
  },
  {
    id: 'brand-vanguard',
    name: 'Vanguard',
    slug: 'vanguard',
    categoryId: 'cat-etf',
    brandColor: '#B81B1B',
    isPopular: true,
  },
];
