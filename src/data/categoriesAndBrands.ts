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
  { id: 'cat-shopping', name: 'Compras y Moda', pillar: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'cat-health', name: 'Salud y Cuidado', pillar: 'expense', icon: 'HeartPulse', color: '#BE123C' },

  // Inversiones
  { id: 'cat-etf', name: 'Fondos y ETFs', pillar: 'invest', icon: 'TrendingUp', color: '#6366F1' },
  { id: 'cat-stocks', name: 'Acciones Bursátiles', pillar: 'invest', icon: 'LineChart', color: '#818CF8' },
  { id: 'cat-crypto', name: 'Criptoactivos', pillar: 'invest', icon: 'Bitcoin', color: '#A5B4FC' },
  { id: 'cat-fixed', name: 'Renta Fija y Bonos', pillar: 'invest', icon: 'ShieldCheck', color: '#C7D2FE' },
  { id: 'cat-deposit', name: 'Depósitos y Liquidez', pillar: 'invest', icon: 'Vault', color: '#4F46E5' },
];

export const INITIAL_BRANDS: Brand[] = [
  // 1. Supermercados & Alimentación
  { id: 'brand-mercadona', name: 'Mercadona', slug: 'mercadona', categoryId: 'cat-food', domain: 'mercadona.es', brandColor: '#009E60', isPopular: true },
  { id: 'brand-carrefour', name: 'Carrefour', slug: 'carrefour', categoryId: 'cat-food', domain: 'carrefour.es', brandColor: '#0055A5', isPopular: true },
  { id: 'brand-lidl', name: 'Lidl', slug: 'lidl', categoryId: 'cat-food', domain: 'lidl.es', brandColor: '#0050AA', isPopular: true },
  { id: 'brand-dia', name: 'Dia', slug: 'dia', categoryId: 'cat-food', domain: 'dia.es', brandColor: '#D52B1E', isPopular: true },
  { id: 'brand-alcampo', name: 'Alcampo', slug: 'alcampo', categoryId: 'cat-food', domain: 'alcampo.es', brandColor: '#E2001A', isPopular: true },
  { id: 'brand-elcorteingles', name: 'El Corte Inglés', slug: 'elcorteingles', categoryId: 'cat-food', domain: 'elcorteingles.es', brandColor: '#006837', isPopular: true },
  { id: 'brand-costco', name: 'Costco', slug: 'costco', categoryId: 'cat-food', domain: 'costco.com', brandColor: '#E31837', isPopular: false },

  // 2. Suscripciones, Streaming & Tech
  { id: 'brand-netflix', name: 'Netflix', slug: 'netflix', categoryId: 'cat-subs', domain: 'netflix.com', brandColor: '#E50914', isPopular: true },
  { id: 'brand-spotify', name: 'Spotify', slug: 'spotify', categoryId: 'cat-subs', domain: 'spotify.com', brandColor: '#1DB954', isPopular: true },
  { id: 'brand-dazn', name: 'DAZN', slug: 'dazn', categoryId: 'cat-subs', domain: 'dazn.com', brandColor: '#F8F8F8', isPopular: true },
  { id: 'brand-disneyplus', name: 'Disney+', slug: 'disneyplus', categoryId: 'cat-subs', domain: 'disneyplus.com', brandColor: '#113CCF', isPopular: true },
  { id: 'brand-youtube', name: 'YouTube Premium', slug: 'youtube', categoryId: 'cat-subs', domain: 'youtube.com', brandColor: '#FF0000', isPopular: true },
  { id: 'brand-apple', name: 'Apple', slug: 'apple', categoryId: 'cat-subs', domain: 'apple.com', brandColor: '#A2AAAD', isPopular: true },
  { id: 'brand-amazon', name: 'Amazon Prime', slug: 'amazon', categoryId: 'cat-subs', domain: 'amazon.es', brandColor: '#00A8E1', isPopular: true },
  { id: 'brand-playstation', name: 'PlayStation Network', slug: 'playstation', categoryId: 'cat-subs', domain: 'playstation.com', brandColor: '#003791', isPopular: true },
  { id: 'brand-twitch', name: 'Twitch', slug: 'twitch', categoryId: 'cat-subs', domain: 'twitch.tv', brandColor: '#9146FF', isPopular: false },

  // 3. Restauración & Comida a Domicilio
  { id: 'brand-mcdonalds', name: "McDonald's", slug: 'mcdonalds', categoryId: 'cat-leisure', domain: 'mcdonalds.com', brandColor: '#FFBC0D', isPopular: true },
  { id: 'brand-burgerking', name: 'Burger King', slug: 'burgerking', categoryId: 'cat-leisure', domain: 'burgerking.es', brandColor: '#D62300', isPopular: true },
  { id: 'brand-starbucks', name: 'Starbucks', slug: 'starbucks', categoryId: 'cat-leisure', domain: 'starbucks.com', brandColor: '#006241', isPopular: true },
  { id: 'brand-glovo', name: 'Glovo', slug: 'glovo', categoryId: 'cat-leisure', domain: 'glovoapp.com', brandColor: '#FFC244', isPopular: true },
  { id: 'brand-justeat', name: 'Just Eat', slug: 'justeat', categoryId: 'cat-leisure', domain: 'just-eat.es', brandColor: '#FF8000', isPopular: true },
  { id: 'brand-ubereats', name: 'Uber Eats', slug: 'ubereats', categoryId: 'cat-leisure', domain: 'ubereats.com', brandColor: '#06C167', isPopular: true },

  // 4. Transporte & Movilidad
  { id: 'brand-repsol', name: 'Repsol', slug: 'repsol', categoryId: 'cat-transport', domain: 'repsol.com', brandColor: '#FF8200', isPopular: true },
  { id: 'brand-cepsa', name: 'Cepsa', slug: 'cepsa', categoryId: 'cat-transport', domain: 'cepsa.com', brandColor: '#D60B24', isPopular: true },
  { id: 'brand-uber', name: 'Uber', slug: 'uber', categoryId: 'cat-transport', domain: 'uber.com', brandColor: '#000000', isPopular: true },
  { id: 'brand-cabify', name: 'Cabify', slug: 'cabify', categoryId: 'cat-transport', domain: 'cabify.com', brandColor: '#7152F3', isPopular: true },
  { id: 'brand-renfe', name: 'Renfe', slug: 'renfe', categoryId: 'cat-transport', domain: 'renfe.com', brandColor: '#662D91', isPopular: true },
  { id: 'brand-iberia', name: 'Iberia', slug: 'iberia', categoryId: 'cat-transport', domain: 'iberia.com', brandColor: '#D71921', isPopular: false },
  { id: 'brand-vueling', name: 'Vueling', slug: 'vueling', categoryId: 'cat-transport', domain: 'vueling.com', brandColor: '#FFCC00', isPopular: false },

  // 5. Moda, Hogar & Compras
  { id: 'brand-zara', name: 'Zara', slug: 'zara', categoryId: 'cat-shopping', domain: 'zara.com', brandColor: '#000000', isPopular: true },
  { id: 'brand-ikea', name: 'IKEA', slug: 'ikea', categoryId: 'cat-housing', domain: 'ikea.com', brandColor: '#0051BA', isPopular: true },
  { id: 'brand-decathlon', name: 'Decathlon', slug: 'decathlon', categoryId: 'cat-shopping', domain: 'decathlon.es', brandColor: '#0082C3', isPopular: true },
  { id: 'brand-aliexpress', name: 'AliExpress', slug: 'aliexpress', categoryId: 'cat-shopping', domain: 'aliexpress.com', brandColor: '#FF4747', isPopular: false },

  // 6. Suministros, Vivienda & Telecom
  { id: 'brand-iberdrola', name: 'Iberdrola', slug: 'iberdrola', categoryId: 'cat-housing', domain: 'iberdrola.es', brandColor: '#28A745', isPopular: true },
  { id: 'brand-endesa', name: 'Endesa', slug: 'endesa', categoryId: 'cat-housing', domain: 'endesa.com', brandColor: '#004F9F', isPopular: true },
  { id: 'brand-naturgy', name: 'Naturgy', slug: 'naturgy', categoryId: 'cat-housing', domain: 'naturgy.es', brandColor: '#E84E0F', isPopular: true },
  { id: 'brand-movistar', name: 'Movistar', slug: 'movistar', categoryId: 'cat-housing', domain: 'movistar.es', brandColor: '#00A9E0', isPopular: true },
  { id: 'brand-vodafone', name: 'Vodafone', slug: 'vodafone', categoryId: 'cat-housing', domain: 'vodafone.es', brandColor: '#E60000', isPopular: true },
  { id: 'brand-orange', name: 'Orange', slug: 'orange', categoryId: 'cat-housing', domain: 'orange.es', brandColor: '#FF7900', isPopular: true },

  // 7. Finanzas, Inversión & Cripto
  { id: 'brand-vanguard', name: 'Vanguard', slug: 'vanguard', categoryId: 'cat-etf', domain: 'vanguard.com', brandColor: '#B81B1B', isPopular: true },
  { id: 'brand-traderepublic', name: 'Trade Republic', slug: 'traderepublic', categoryId: 'cat-stocks', domain: 'traderepublic.com', brandColor: '#1E293B', isPopular: true },
  { id: 'brand-myinvestor', name: 'MyInvestor', slug: 'myinvestor', categoryId: 'cat-etf', domain: 'myinvestor.es', brandColor: '#2B3674', isPopular: true },
  { id: 'brand-revolut', name: 'Revolut', slug: 'revolut', categoryId: 'cat-salary', domain: 'revolut.com', brandColor: '#0075EB', isPopular: true },
  { id: 'brand-bbva', name: 'BBVA', slug: 'bbva', categoryId: 'cat-salary', domain: 'bbva.es', brandColor: '#004481', isPopular: true },
  { id: 'brand-santander', name: 'Banco Santander', slug: 'santander', categoryId: 'cat-salary', domain: 'santander.com', brandColor: '#EC0000', isPopular: true },
  { id: 'brand-binance', name: 'Binance', slug: 'binance', categoryId: 'cat-crypto', domain: 'binance.com', brandColor: '#F0B90B', isPopular: true },
  { id: 'brand-coinbase', name: 'Coinbase', slug: 'coinbase', categoryId: 'cat-crypto', domain: 'coinbase.com', brandColor: '#0052FF', isPopular: true },
  { id: 'brand-kraken', name: 'Kraken', slug: 'kraken', categoryId: 'cat-crypto', domain: 'kraken.com', brandColor: '#5741D9', isPopular: true },
];
