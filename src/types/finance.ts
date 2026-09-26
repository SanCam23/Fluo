export type PillarType = 'income' | 'expense' | 'invest';

export interface Category {
  id: string;
  name: string;
  pillar: PillarType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  domain?: string;
  logoUrl?: string;
  brandColor?: string;
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  pillar: PillarType;
  categoryId: string;
  brandId?: string;
  concept: string;
  date: string; // ISO 8601 string
  isRecurring?: boolean;
  isRecurringGenerated?: boolean; // Generada automáticamente por el motor de recurrencias
  recurrenceId?: string;
  createdAt: number;
}

export type AssetType = 
  | 'stock'
  | 'index_fund'
  | 'etf'
  | 'crypto'
  | 'fixed_income'
  | 'deposit';

export interface HistoricalPricePoint {
  date: string;
  price: number;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  identifier: string; // Ticker (e.g., 'AAPL', 'BTC') or ISIN (e.g., 'IE00BK5BQT80')
  assetType: AssetType;
  shares: number;
  averageBuyPrice: number;
  currentPrice: number;
  currency: 'EUR' | 'USD';
  platform?: string;
  lastUpdated: string;
  historicalPrices?: HistoricalPricePoint[];
}

export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  id: string;
  title: string;
  amount: number;
  pillar: PillarType;
  categoryId: string;
  brandId?: string;
  frequency: RecurrenceFrequency;
  dayOfWeek?: number; // 1 = Lunes, ..., 7 = Domingo (para semanal)
  dayOfMonth?: number; // 1 al 31 (para mensual)
  startDate: string;
  endDate?: string; // Fecha de finalización opcional
  nextDueDate: string;
  lastProcessedDate?: string; // Última fecha en que se generó un cobro automático
  isActive: boolean;
  autoCharge?: boolean;
}

export interface FinancialSummary {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvested: number;
  portfolioMarketValue: number;
  savingsRate: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
}

export type TimeRangeFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all';
