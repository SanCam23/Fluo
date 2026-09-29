import { createClient } from '@supabase/supabase-js';
import type { Transaction, InvestmentAsset, PillarType, AssetType, SourceAccount, SourceType } from '../types/finance';

// ==============================================================================
// Database Schema Interfaces matching exact Supabase PostgreSQL tables
// ==============================================================================

export interface DbTransaction {
  id: string; // UUID NOT NULL DEFAULT gen_random_uuid()
  user_id: string; // UUID NOT NULL DEFAULT auth.uid()
  type: 'income' | 'expense'; // CHECK (type IN ('income', 'expense'))
  amount: number; // NUMERIC NOT NULL
  category: string; // TEXT NOT NULL
  brand: string | null; // TEXT
  date: string; // TIMESTAMPTZ NOT NULL DEFAULT now()
  is_recurring: boolean; // BOOLEAN DEFAULT false
  recurring_period: 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null;
  created_at: string; // TIMESTAMPTZ DEFAULT now()
  source_id: string | null; // TEXT
}

export interface DbInvestment {
  id: string; // UUID NOT NULL DEFAULT gen_random_uuid()
  user_id: string; // UUID NOT NULL DEFAULT auth.uid()
  asset_type: string; // TEXT NOT NULL
  name: string; // TEXT NOT NULL
  symbol_or_isin: string; // TEXT NOT NULL
  shares: number; // NUMERIC NOT NULL
  average_buy_price: number; // NUMERIC NOT NULL
  quote_ticker?: string | null; // TEXT
  last_price_update?: string | null; // TIMESTAMPTZ
  current_price?: number | null; // NUMERIC
  created_at: string; // TIMESTAMPTZ DEFAULT now()
}

export interface DbSourceAccount {
  id: string; // TEXT NOT NULL PRIMARY KEY
  user_id: string; // UUID NOT NULL
  name: string; // TEXT NOT NULL
  type: SourceType; // CHECK (type IN ('bank', 'cash'))
  institution: string | null; // TEXT
  brand_id: string | null; // TEXT
  initial_balance: number | null; // NUMERIC DEFAULT 0.00
  order_index: number; // INTEGER NOT NULL DEFAULT 0
  color: string | null; // TEXT
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
}

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: DbTransaction;
        Insert: Partial<DbTransaction>;
        Update: Partial<DbTransaction>;
        Relationships: [];
      };
      source_accounts: {
        Row: DbSourceAccount;
        Insert: Partial<DbSourceAccount>;
        Update: Partial<DbSourceAccount>;
        Relationships: [];
      };
      investments: {
        Row: DbInvestment;
        Insert: Partial<DbInvestment>;
        Update: Partial<DbInvestment>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

// Fallback dummy URL and anon key to prevent createClient crashes in offline/test runners
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-fluo.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient<Database>(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// UUID Helpers to ensure valid UUIDs for PostgreSQL tables with UUID primary keys
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ensureValidUuid(id?: string): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  return generateUuid();
}

// ==============================================================================
// Mapping Utilities: DB (PostgreSQL / Supabase) <-> Frontend (Fluo Types)
// ==============================================================================

/**
 * Maps a row from `public.transactions` to the frontend `Transaction` type.
 * Handles both the current schema (`type`, `category`, `brand`) and backwards-compat fields.
 */
export function mapDbTransactionToTransaction(row: any): Transaction {
  const cat = String(row.category || row.category_id || '').toLowerCase();
  const isInvestCategory =
    cat.startsWith('cat-etf') ||
    cat.startsWith('cat-stock') ||
    cat.startsWith('cat-crypto') ||
    cat.startsWith('cat-fixed') ||
    cat.startsWith('cat-deposit') ||
    cat === 'invest';

  let pillar: PillarType = 'expense';
  if (row.pillar === 'income' || row.pillar === 'expense' || row.pillar === 'invest') {
    pillar = row.pillar;
  } else if (row.type === 'income') {
    pillar = 'income';
  } else if (isInvestCategory) {
    pillar = 'invest';
  }

  // Parse brand and concept from the `brand` column (supports 'brandId::concept' or single string)
  let brandId: string | undefined = undefined;
  let concept: string = 'Transacción';

  const rawBrand = row.brand || row.concept || null;
  if (rawBrand) {
    if (rawBrand.includes('::')) {
      const parts = rawBrand.split('::');
      brandId = parts[0] || undefined;
      concept = parts.slice(1).join('::') || parts[0];
    } else {
      brandId = rawBrand;
      concept = rawBrand;
    }
  } else if (row.concept) {
    concept = row.concept;
  }

  const categoryId = row.category || row.category_id || (
    pillar === 'income' ? 'cat-salary' : (pillar === 'invest' ? 'cat-etf' : 'cat-groceries')
  );

  return {
    id: row.id,
    amount: Number(row.amount),
    pillar,
    categoryId,
    brandId,
    sourceId: row.source_id || undefined,
    concept,
    date: row.date || new Date().toISOString(),
    isRecurring: Boolean(row.is_recurring),
    isRecurringGenerated: Boolean(row.is_recurring_generated),
    recurrenceId: row.recurring_period || row.recurrence_id || undefined,
    createdAt: row.created_at
      ? (typeof row.created_at === 'number' ? row.created_at : new Date(row.created_at).getTime())
      : Date.now(),
  };
}

/**
 * Maps a frontend `Transaction` to a payload strictly conforming to `public.transactions`.
 */
export function mapTransactionToDb(tx: Transaction, userId: string): DbTransaction {
  // DB CHECK constraint restricts `type` to 'income' or 'expense'
  const dbType: 'income' | 'expense' = tx.pillar === 'income' ? 'income' : 'expense';

  // Encode brandId and concept if distinct
  let brandValue: string | null = null;
  if (tx.brandId && tx.concept && tx.brandId !== tx.concept) {
    brandValue = `${tx.brandId}::${tx.concept}`;
  } else {
    brandValue = tx.brandId || tx.concept || null;
  }

  let recurringPeriod: 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null = null;
  if (tx.isRecurring) {
    recurringPeriod = 'monthly';
  }

  return {
    id: ensureValidUuid(tx.id),
    user_id: userId,
    type: dbType,
    amount: Number(tx.amount),
    category: tx.categoryId,
    brand: brandValue,
    date: tx.date || new Date().toISOString(),
    is_recurring: Boolean(tx.isRecurring),
    recurring_period: recurringPeriod,
    created_at: new Date(tx.createdAt || Date.now()).toISOString(),
    source_id: tx.sourceId || null,
  };
}

/**
 * Maps a row from `public.investments` to the frontend `InvestmentAsset` type.
 */
export function mapDbInvestmentToAsset(row: any): InvestmentAsset {
  const symbol = row.symbol_or_isin || row.identifier || 'ASSET';
  const avgPrice = Number(row.average_buy_price) || 0;
  const currentPrice = row.current_price !== undefined && row.current_price !== null
    ? Number(row.current_price)
    : avgPrice;
  const shares = Number(row.shares) || 0;
  const curPrice = currentPrice > 0 ? currentPrice : avgPrice;
  const currentValue = Number((shares * curPrice).toFixed(2));
  const pnl = Number((currentValue - (shares * avgPrice)).toFixed(2));
  const pnlPercentage = avgPrice > 0 ? Number((((curPrice - avgPrice) / avgPrice) * 100).toFixed(2)) : 0;
  const quoteTicker = row.quote_ticker || undefined;
  const lastPriceUpdate = row.last_price_update || undefined;

  return {
    id: row.id,
    name: row.name,
    identifier: symbol,
    ticker: row.ticker || symbol,
    isin: row.isin || (symbol.length === 12 ? symbol : undefined),
    quoteTicker,
    quote_ticker: quoteTicker,
    lastPriceUpdate,
    last_price_update: lastPriceUpdate,
    currentValue,
    pnl,
    pnlPercentage,
    assetType: (row.asset_type || 'stock') as AssetType,
    shares,
    averageBuyPrice: avgPrice,
    currentPrice: curPrice,
    currency: row.currency || 'EUR',
    platform: row.platform || undefined,
    brandId: row.brand_id || undefined,
    lastUpdated: row.last_updated || 'Ahora mismo',
    change24h: row.change_24h !== null && row.change_24h !== undefined ? Number(row.change_24h) : undefined,
    initialFee: row.initial_fee !== null && row.initial_fee !== undefined ? Number(row.initial_fee) : undefined,
    acquisitionDate: row.acquisition_date || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : undefined),
  };
}

/**
 * Maps a frontend `InvestmentAsset` to a payload strictly conforming to `public.investments`.
 */
export function mapAssetToDbInvestment(asset: InvestmentAsset, userId: string): DbInvestment {
  return {
    id: ensureValidUuid(asset.id),
    user_id: userId,
    asset_type: asset.assetType,
    name: asset.name,
    symbol_or_isin: asset.identifier || asset.ticker || asset.isin || 'ASSET',
    shares: Number(asset.shares),
    average_buy_price: Number(asset.averageBuyPrice),
    quote_ticker: asset.quoteTicker || asset.quote_ticker || null,
    last_price_update: asset.lastPriceUpdate || asset.last_price_update || new Date().toISOString(),
    current_price: Number(asset.currentPrice) || Number(asset.averageBuyPrice),
    created_at: new Date().toISOString(),
  };
}

/**
 * Maps a row from `public.source_accounts` to the frontend `SourceAccount` type.
 */
export function mapDbSourceAccountToSource(row: DbSourceAccount): SourceAccount {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    institution: row.institution || undefined,
    brandId: row.brand_id || undefined,
    initialBalance: row.initial_balance !== null && row.initial_balance !== undefined ? Number(row.initial_balance) : 0,
    orderIndex: Number(row.order_index ?? 0),
    color: row.color || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Maps a frontend `SourceAccount` to a payload strictly conforming to `public.source_accounts`.
 */
export function mapSourceToDb(source: SourceAccount, userId: string): DbSourceAccount {
  return {
    id: source.id,
    user_id: userId,
    name: source.name,
    type: source.type,
    institution: source.institution || null,
    brand_id: source.brandId || null,
    initial_balance: Number(source.initialBalance ?? 0),
    order_index: Number(source.orderIndex ?? 0),
    color: source.color || null,
    created_at: source.createdAt || new Date().toISOString(),
  };
}

