import { createClient } from '@supabase/supabase-js';
import type { Transaction, InvestmentAsset, PillarType, AssetType } from '../types/finance';

// Database Schema interfaces for Supabase
export interface DbTransaction {
  id: string;
  user_id: string;
  amount: number;
  pillar: PillarType;
  category_id: string;
  brand_id: string | null;
  concept: string;
  date: string;
  is_recurring: boolean;
  is_recurring_generated: boolean;
  recurrence_id: string | null;
  created_at: string | number;
}

export interface DbInvestment {
  id: string;
  user_id: string;
  name: string;
  identifier: string;
  ticker: string | null;
  isin: string | null;
  asset_type: AssetType;
  shares: number;
  average_buy_price: number;
  current_price: number;
  currency: 'EUR' | 'USD';
  platform: string | null;
  brand_id: string | null;
  last_updated: string;
  change_24h: number | null;
  initial_fee: number | null;
  acquisition_date: string | null;
  created_at?: string;
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

// Mapping Utilities: DB (snake_case) <-> Frontend (camelCase)
export function mapDbTransactionToTransaction(row: DbTransaction): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    pillar: row.pillar,
    categoryId: row.category_id,
    brandId: row.brand_id || undefined,
    concept: row.concept,
    date: row.date,
    isRecurring: Boolean(row.is_recurring),
    isRecurringGenerated: Boolean(row.is_recurring_generated),
    recurrenceId: row.recurrence_id || undefined,
    createdAt: typeof row.created_at === 'number' ? row.created_at : new Date(row.created_at).getTime() || Date.now(),
  };
}

export function mapTransactionToDb(tx: Transaction, userId: string): DbTransaction {
  return {
    id: tx.id,
    user_id: userId,
    amount: Number(tx.amount),
    pillar: tx.pillar,
    category_id: tx.categoryId,
    brand_id: tx.brandId || null,
    concept: tx.concept,
    date: tx.date,
    is_recurring: Boolean(tx.isRecurring),
    is_recurring_generated: Boolean(tx.isRecurringGenerated),
    recurrence_id: tx.recurrenceId || null,
    created_at: new Date(tx.createdAt || Date.now()).toISOString(),
  };
}

export function mapDbInvestmentToAsset(row: DbInvestment): InvestmentAsset {
  return {
    id: row.id,
    name: row.name,
    identifier: row.identifier,
    ticker: row.ticker || undefined,
    isin: row.isin || undefined,
    assetType: row.asset_type,
    shares: Number(row.shares),
    averageBuyPrice: Number(row.average_buy_price),
    currentPrice: Number(row.current_price),
    currency: row.currency,
    platform: row.platform || undefined,
    brandId: row.brand_id || undefined,
    lastUpdated: row.last_updated,
    change24h: row.change_24h !== null ? Number(row.change_24h) : undefined,
    initialFee: row.initial_fee !== null ? Number(row.initial_fee) : undefined,
    acquisitionDate: row.acquisition_date || undefined,
  };
}

export function mapAssetToDbInvestment(asset: InvestmentAsset, userId: string): DbInvestment {
  return {
    id: asset.id,
    user_id: userId,
    name: asset.name,
    identifier: asset.identifier,
    ticker: asset.ticker || null,
    isin: asset.isin || null,
    asset_type: asset.assetType,
    shares: Number(asset.shares),
    average_buy_price: Number(asset.averageBuyPrice),
    current_price: Number(asset.currentPrice),
    currency: asset.currency,
    platform: asset.platform || null,
    brand_id: asset.brandId || null,
    last_updated: asset.lastUpdated,
    change_24h: asset.change24h !== undefined ? Number(asset.change24h) : null,
    initial_fee: asset.initialFee !== undefined ? Number(asset.initialFee) : null,
    acquisition_date: asset.acquisitionDate || null,
  };
}
