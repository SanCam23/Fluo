import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Transaction,
  Category,
  Brand,
  InvestmentAsset,
  RecurrenceRule,
  FinancialSummary,
  TimeRangeFilter,
} from '../types/finance';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../data/categoriesAndBrands';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_INVESTMENT_ASSETS,
  INITIAL_RECURRENCE_RULES,
} from '../data/initialMockData';
import { batchUpdateQuotes } from '../services/priceFeedService';
import { processDueRecurrences } from '../services/recurringEngine';
import { computeFinancialSummary } from '../utils/finance';

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  brands: Brand[];
  assets: InvestmentAsset[];
  recurrences: RecurrenceRule[];
  timeRange: TimeRangeFilter;
  activeTab: 'home' | 'stats' | 'invest' | 'add';
  isLiveUpdating: boolean;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (asset: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => void;
  updateAssetPrice: (id: string, newPrice: number) => void;
  refreshAllAssetPrices: () => Promise<void>;
  addRecurrence: (rule: Omit<RecurrenceRule, 'id'>) => void;
  toggleRecurrence: (id: string) => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setActiveTab: (tab: 'home' | 'stats' | 'invest' | 'add') => void;
  addBrand: (brand: Omit<Brand, 'id'> & { id?: string }) => Brand;
  triggerRecurrencesCheck: (asOfDate?: Date) => number;
  simulateTimeAdvance: (days: number) => { generatedCount: number; simulatedDate: string };
  resetSimulatedTime: () => void;
  simulatedTimeOffsetDays: number;
  resetToInitialData: () => void;

  // Methods
  getFinancialSummary: () => FinancialSummary;
  getFilteredTransactions: () => Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  getBrandById: (id?: string) => Brand | undefined;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      assets: INITIAL_INVESTMENT_ASSETS,
      recurrences: INITIAL_RECURRENCE_RULES,
      timeRange: 'all',
      activeTab: 'home',
      isLiveUpdating: false,
      simulatedTimeOffsetDays: 0,

      addTransaction: (txData) => {
        const newTx: Transaction = {
          ...txData,
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      addAsset: (assetData) => {
        const newAsset: InvestmentAsset = {
          ...assetData,
          id: `asset-${Date.now()}`,
          lastUpdated: 'Recién añadido',
        };
        set((state) => ({
          assets: [...state.assets, newAsset],
        }));
      },

      updateAssetPrice: (id, newPrice) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id
              ? {
                  ...asset,
                  currentPrice: newPrice,
                  lastUpdated: 'Ahora mismo',
                }
              : asset
          ),
        }));
      },

      refreshAllAssetPrices: async () => {
        set({ isLiveUpdating: true });
        try {
          const state = get();
          const identifiers = state.assets.map((a) => a.identifier);
          const quotes = await batchUpdateQuotes(identifiers);

          set((s) => ({
            assets: s.assets.map((asset) => {
              const quote = quotes[asset.identifier];
              if (quote) {
                return {
                  ...asset,
                  currentPrice: quote.price,
                  lastUpdated: `En vivo (${quote.lastUpdated})`,
                };
              }
              return asset;
            }),
          }));
        } finally {
          set({ isLiveUpdating: false });
        }
      },

      addRecurrence: (ruleData) => {
        const newRule: RecurrenceRule = {
          ...ruleData,
          id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          isActive: true,
          autoCharge: ruleData.autoCharge !== false,
        };
        set((state) => ({
          recurrences: [...state.recurrences, newRule],
        }));
      },

      triggerRecurrencesCheck: (asOfDate) => {
        const { recurrences, transactions, simulatedTimeOffsetDays } = get();
        const targetDate = asOfDate || new Date(Date.now() + simulatedTimeOffsetDays * 86400000);
        const { generatedTransactions, updatedRules } = processDueRecurrences(
          recurrences,
          transactions,
          targetDate
        );

        if (generatedTransactions.length > 0) {
          set((state) => ({
            transactions: [...generatedTransactions, ...state.transactions],
            recurrences: updatedRules,
          }));
        } else {
          set({ recurrences: updatedRules });
        }

        return generatedTransactions.length;
      },

      simulateTimeAdvance: (days) => {
        const currentOffset = get().simulatedTimeOffsetDays;
        const newOffset = currentOffset + days;
        const targetDate = new Date(Date.now() + newOffset * 86400000);
        set({ simulatedTimeOffsetDays: newOffset });
        const count = get().triggerRecurrencesCheck(targetDate);
        return {
          generatedCount: count,
          simulatedDate: targetDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        };
      },

      resetSimulatedTime: () => {
        set({ simulatedTimeOffsetDays: 0 });
      },

      toggleRecurrence: (id) => {
        set((state) => ({
          recurrences: state.recurrences.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        }));
      },

      setTimeRange: (range) => set({ timeRange: range }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      addBrand: (brandData) => {
        const brands = get().brands;
        const cleanName = brandData.name.trim().toLowerCase();
        const cleanDomain = brandData.domain ? brandData.domain.trim().toLowerCase() : '';

        // Check if brand already exists by domain, slug or name
        const existing = brands.find(
          (b) =>
            (cleanDomain && b.domain && b.domain.toLowerCase() === cleanDomain) ||
            (brandData.slug && b.slug && b.slug.toLowerCase() === brandData.slug.toLowerCase()) ||
            b.name.toLowerCase() === cleanName
        );
        if (existing) return existing;

        const newBrand: Brand = {
          ...brandData,
          id: brandData.id || `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          slug: brandData.slug || cleanName.replace(/[^a-z0-9]+/g, '-'),
          categoryId: brandData.categoryId || 'cat-shopping',
        };

        set((state) => ({
          brands: [...state.brands, newBrand],
        }));
        return newBrand;
      },

      resetToInitialData: () => {
        try {
          localStorage.removeItem('fluo_finance_storage_v1');
          localStorage.removeItem('fluo_finance_storage_v2');
          localStorage.removeItem('fluo_finance_storage_v3');
        } catch (e) {
          console.warn('Error clearing localStorage:', e);
        }
        set({
          transactions: INITIAL_TRANSACTIONS,
          categories: INITIAL_CATEGORIES,
          brands: INITIAL_BRANDS,
          assets: INITIAL_INVESTMENT_ASSETS,
          recurrences: INITIAL_RECURRENCE_RULES,
          timeRange: 'all',
          activeTab: 'home',
        });
      },

      getFinancialSummary: () => {
        const { transactions, assets } = get();
        return computeFinancialSummary(transactions, assets);
      },

      getFilteredTransactions: () => {
        const { transactions, timeRange } = get();
        const txList = Array.isArray(transactions) ? transactions : [];
        if (timeRange === 'all') return txList;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        return txList.filter((tx) => {
          if (!tx || !tx.date) return false;
          const txTime = new Date(tx.date).getTime();
          switch (timeRange) {
            case 'this_month':
              return txTime >= startOfMonth;
            case 'last_month':
              return txTime >= startOfLastMonth && txTime < startOfMonth;
            case 'last_3_months':
              return txTime >= threeMonthsAgo;
            case 'last_6_months':
              return txTime >= sixMonthsAgo;
            case 'this_year':
              return txTime >= startOfYear;
            default:
              return true;
          }
        });
      },

      getCategoryById: (id) => {
        const categories = get().categories;
        return Array.isArray(categories) ? categories.find((c) => c.id === id) : undefined;
      },

      getBrandById: (id) => {
        if (!id) return undefined;
        const brands = get().brands;
        return Array.isArray(brands) ? brands.find((b) => b.id === id) : undefined;
      },
    }),
    {
      name: 'fluo_finance_storage_v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        brands: state.brands,
        assets: state.assets,
        recurrences: state.recurrences,
        timeRange: state.timeRange,
      }),
      onRehydrateStorage: () => (state) => {
        state?.triggerRecurrencesCheck();
      },
      merge: (persistedState, currentState) => {
        const p = (persistedState as Partial<FinanceState>) || {};
        return {
          ...currentState,
          ...p,
          transactions:
            Array.isArray(p.transactions) && p.transactions.length > 0
              ? p.transactions
              : currentState.transactions,
          categories:
            Array.isArray(p.categories) && p.categories.length > 0
              ? p.categories
              : currentState.categories,
          brands: (() => {
            const initialMap = new Map(INITIAL_BRANDS.map((b) => [b.id, b]));
            const merged: Brand[] = INITIAL_BRANDS.map((initBrand) => {
              const stored = Array.isArray(p.brands)
                ? p.brands.find((b) => b.id === initBrand.id)
                : null;
              return {
                ...initBrand,
                ...(stored || {}),
                domain: initBrand.domain,
              };
            });
            // Preserve user-added or dynamically fetched brands
            if (Array.isArray(p.brands)) {
              for (const storedBrand of p.brands) {
                if (!initialMap.has(storedBrand.id)) {
                  merged.push(storedBrand);
                }
              }
            }
            return merged;
          })(),
          assets:
            Array.isArray(p.assets) && p.assets.length > 0
              ? p.assets
              : currentState.assets,
          recurrences:
            Array.isArray(p.recurrences) && p.recurrences.length > 0
              ? p.recurrences
              : currentState.recurrences,
        };
      },
    }
  )
);

/**
 * Custom React Hook to compute financial summary without infinite re-render loops.
 * Selects only the stable array references and memoizes the result.
 */
export function useFinancialSummary(): FinancialSummary {
  const transactions = useFinanceStore((state) => state.transactions);
  const assets = useFinanceStore((state) => state.assets);

  return useMemo(() => {
    return computeFinancialSummary(transactions, assets);
  }, [transactions, assets]);
}
