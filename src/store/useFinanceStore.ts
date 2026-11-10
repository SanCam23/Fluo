import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Category,
  Brand,
  InvestmentAsset,
  FinancialSummary,
  SourceAccount,
} from '../types/finance';
import type { FinanceState } from './types';
import { createSourceAccountsSlice } from './slices/sourceAccountsSlice';
import { createRecurrencesSlice } from './slices/recurrencesSlice';
import { createInvestmentsSlice } from './slices/investmentsSlice';
import { createTransactionsSlice } from './slices/transactionsSlice';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../data/categoriesAndBrands';
import { pruneExpiredQuoteCache } from '../services/marketDataService';
import { computeFinancialSummary, reconcileAssetsFromTransactions } from '../utils/finance';
import { sortTransactionsDesc } from '../utils/dates';
import {
  fetchUserCloudData,
  insertCloudSource,
  insertCloudAsset,
} from '../services/cloudSyncService';

export type { FinanceState } from './types';

const memoryStorageMap = new Map<string, string>();
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return memoryStorageMap.get(name) || null;
      }
    }
    return memoryStorageMap.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(name, value);
        return;
      } catch {
        memoryStorageMap.set(name, value);
        return;
      }
    }
    memoryStorageMap.set(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(name);
        return;
      } catch {
        memoryStorageMap.delete(name);
        return;
      }
    }
    memoryStorageMap.delete(name);
  },
};

// Cached lookup maps for O(1) entity lookups
let cachedCategoriesRef: Category[] | null = null;
let categoryLookupMap = new Map<string, Category>();

function getCategoryLookup(categories: Category[]): Map<string, Category> {
  if (categories !== cachedCategoriesRef) {
    cachedCategoriesRef = categories;
    categoryLookupMap = new Map((Array.isArray(categories) ? categories : []).map((c) => [c.id, c]));
  }
  return categoryLookupMap;
}

let cachedBrandsRef: Brand[] | null = null;
let brandLookupMap = new Map<string, Brand>();

function getBrandLookup(brands: Brand[]): Map<string, Brand> {
  if (brands !== cachedBrandsRef) {
    cachedBrandsRef = brands;
    brandLookupMap = new Map((Array.isArray(brands) ? brands : []).map((b) => [b.id, b]));
  }
  return brandLookupMap;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      // Base State
      transactions: [],
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      assets: [],
      recurrences: [],
      sources: [],
      activeSourceId: null,
      timeRange: 'all',
      themeMode: 'dark',
      activeTab: 'home',
      isLiveUpdating: false,
      simulatedTimeOffsetDays: 0,
      userId: null,
      isCloudLoading: false,
      hasHydratedFromCloud: false,
      cloudSyncError: null,

      // Composed Domain Slices
      ...createSourceAccountsSlice(set, get),
      ...createRecurrencesSlice(set, get),
      ...createInvestmentsSlice(set, get),
      ...createTransactionsSlice(set, get),

      // App & Core Actions
      setActiveSourceId: (activeSourceId) => set({ activeSourceId }),
      setThemeMode: (themeMode) => set({ themeMode }),

      setUserId: (userId) => {
        const prevId = get().userId;
        // ONLY wipe state when genuinely switching from one authenticated user to ANOTHER authenticated user
        if (prevId && userId && prevId !== userId) {
          // Different user logged in on the same browser: wipe previous user's data
          set({
            userId,
            transactions: [],
            assets: [],
            recurrences: [],
            sources: [],
            activeSourceId: null,
            isCloudLoading: true,
            hasHydratedFromCloud: false,
          });
        } else if (userId && !prevId) {
          // Fresh login after logout: mark cloud loading immediately to prevent onboarding modal flash
          set({ userId, isCloudLoading: true, hasHydratedFromCloud: false });
        } else {
          set({ userId });
        }
      },

      setTransactions: (transactions) => set({ transactions: sortTransactionsDesc(transactions) }),

      setAssets: (assets) => set({ assets }),

      setSources: (sources) => {
        const sorted = [...sources].sort((a, b) => a.orderIndex - b.orderIndex);
        set({ sources: sorted });
      },

      loadDemoData: async () => {
        const {
          INITIAL_TRANSACTIONS,
          INITIAL_INVESTMENT_ASSETS,
          INITIAL_RECURRENCE_RULES,
          INITIAL_SOURCE_ACCOUNTS,
        } = await import('../data/initialMockData');
        set({
          transactions: sortTransactionsDesc(INITIAL_TRANSACTIONS),
          assets: INITIAL_INVESTMENT_ASSETS,
          recurrences: INITIAL_RECURRENCE_RULES,
          sources: [...INITIAL_SOURCE_ACCOUNTS].sort((a, b) => a.orderIndex - b.orderIndex),
        });
      },

      loadCloudData: async (userId) => {
        if (!userId) return;
        set({ isCloudLoading: true, cloudSyncError: null });
        try {
          const result = await fetchUserCloudData(userId);
          if (result.success) {
            const currentSources = get().sources;
            const cloudSources = result.sources || [];

            let finalSources: SourceAccount[] = cloudSources;
            if (cloudSources.length === 0 && currentSources.length > 0) {
              finalSources = currentSources;
              currentSources.forEach((s) => {
                insertCloudSource(s, userId).catch((err) =>
                  console.warn('[Store] Auto-sync local source to cloud failed:', err)
                );
              });
            } else if (cloudSources.length > 0) {
              const cloudIds = new Set(cloudSources.map((s) => s.id));
              const unsynced = currentSources.filter((s) => !cloudIds.has(s.id));
              finalSources = [...cloudSources, ...unsynced];
              if (unsynced.length > 0) {
                unsynced.forEach((s) => {
                  insertCloudSource(s, userId).catch((err) =>
                    console.warn('[Store] Auto-sync unsynced source to cloud failed:', err)
                  );
                });
              }
            }

            const currentActiveSourceId = get().activeSourceId;
            const sortedFinalSources = [...finalSources].sort((a, b) => a.orderIndex - b.orderIndex);
            const validActiveSourceId =
              currentActiveSourceId === null
                ? null
                : sortedFinalSources.some((s) => s.id === currentActiveSourceId)
                ? currentActiveSourceId
                : null;

            const currentAssets = get().assets || [];
            const cloudAssets = result.assets || [];
            let mergedAssets: InvestmentAsset[] = cloudAssets;

            if (cloudAssets.length === 0 && currentAssets.length > 0) {
              mergedAssets = currentAssets;
              currentAssets.forEach((a) => {
                insertCloudAsset(a, userId).catch((err) =>
                  console.warn('[Store] Auto-sync local asset to cloud failed:', err)
                );
              });
            } else if (cloudAssets.length > 0) {
              const cloudKeys = new Set(
                cloudAssets.map((a) => (a.identifier || a.id).toUpperCase())
              );
              const unsyncedAssets = currentAssets.filter(
                (a) => !cloudKeys.has((a.identifier || a.id).toUpperCase())
              );
              mergedAssets = [...cloudAssets, ...unsyncedAssets];
              if (unsyncedAssets.length > 0) {
                unsyncedAssets.forEach((a) => {
                  insertCloudAsset(a, userId).catch((err) =>
                    console.warn('[Store] Auto-sync unsynced asset to cloud failed:', err)
                  );
                });
              }
            }

            const allTransactions = result.transactions || [];
            const finalReconciledAssets = reconcileAssetsFromTransactions(
              allTransactions,
              mergedAssets,
              get().brands
            );

            const existingMap = new Map(
              mergedAssets.map((a) => [(a.identifier || a.id).toUpperCase(), a])
            );
            const changedOrNew = finalReconciledAssets.filter((ra) => {
              const prev = existingMap.get((ra.identifier || ra.id).toUpperCase());
              return (
                !prev ||
                prev.name !== ra.name ||
                prev.shares !== ra.shares ||
                prev.averageBuyPrice !== ra.averageBuyPrice
              );
            });
            changedOrNew.forEach((a) => {
              insertCloudAsset(a, userId).catch((err) =>
                console.warn('[Store] Auto-sync reconciled asset to cloud failed:', err)
              );
            });

            set({
              transactions: sortTransactionsDesc(result.transactions),
              assets: finalReconciledAssets,
              sources: sortedFinalSources,
              activeSourceId: validActiveSourceId,
              recurrences: [],
              isCloudLoading: false,
              hasHydratedFromCloud: true,
              cloudSyncError: null,
            });

            pruneExpiredQuoteCache();
            get().syncStaleAssetQuotes(6).catch(() => {});
          } else {
            set({
              isCloudLoading: false,
              hasHydratedFromCloud: true,
              cloudSyncError: result.error || 'Error al sincronizar con la nube',
            });
          }
        } catch (err: any) {
          set({
            isCloudLoading: false,
            hasHydratedFromCloud: true,
            cloudSyncError: err?.message || 'Error inesperado al cargar datos de la nube',
          });
        }
      },

      setTimeRange: (range) => set({ timeRange: range }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      addBrand: (brandData) => {
        const brands = get().brands;
        const cleanName = brandData.name.trim().toLowerCase();
        const cleanDomain = brandData.domain ? brandData.domain.trim().toLowerCase() : '';

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

      resetToInitialData: async () => {
        try {
          localStorage.removeItem('fluo_finance_storage_v1');
          localStorage.removeItem('fluo_finance_storage_v2');
          localStorage.removeItem('fluo_finance_storage_v3');
        } catch (e) {
          console.warn('Error clearing localStorage:', e);
        }
        const {
          INITIAL_TRANSACTIONS,
          INITIAL_INVESTMENT_ASSETS,
          INITIAL_RECURRENCE_RULES,
          INITIAL_SOURCE_ACCOUNTS,
        } = await import('../data/initialMockData');
        set({
          transactions: sortTransactionsDesc(INITIAL_TRANSACTIONS),
          categories: INITIAL_CATEGORIES,
          brands: INITIAL_BRANDS,
          assets: INITIAL_INVESTMENT_ASSETS,
          recurrences: INITIAL_RECURRENCE_RULES,
          sources: [...INITIAL_SOURCE_ACCOUNTS].sort((a, b) => a.orderIndex - b.orderIndex),
          activeSourceId: null,
          timeRange: 'all',
          activeTab: 'home',
        });
      },

      purgeUserData: () => {
        try {
          localStorage.removeItem('fluo_finance_storage_v1');
          localStorage.removeItem('fluo_finance_storage_v2');
          localStorage.removeItem('fluo_finance_storage_v3');
          localStorage.removeItem('fluo_market_quotes_cache_v1');
          localStorage.removeItem('fluo_demo_mode_active');
          localStorage.removeItem('fluo_security_lock_state');
        } catch (e) {
          console.warn('[Security] Error purging localStorage on logout:', e);
        }
        set({
          transactions: [],
          assets: [],
          recurrences: [],
          sources: [],
          activeSourceId: null,
          userId: null,
          isCloudLoading: false,
          hasHydratedFromCloud: false,
          cloudSyncError: null,
          lastSyncTimestamp: undefined,
          timeRange: 'all',
          activeTab: 'home',
        });
      },

      getFinancialSummary: () => {
        const { transactions, assets, sources } = get();
        return computeFinancialSummary(transactions, assets, sources);
      },

      getFilteredTransactions: () => {
        const { transactions, timeRange } = get();
        const txList = Array.isArray(transactions) ? transactions : [];
        if (timeRange === 'all') return txList;

        const now = new Date();
        let minTime = -Infinity;
        let maxTime = Infinity;

        switch (timeRange) {
          case 'this_month':
            minTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            break;
          case 'last_month':
            minTime = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
            maxTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            break;
          case 'last_3_months':
            minTime = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
            break;
          case 'last_6_months':
            minTime = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
            break;
          case 'this_year':
            minTime = new Date(now.getFullYear(), 0, 1).getTime();
            break;
          default:
            return txList;
        }

        return txList.filter((tx) => {
          if (!tx || !tx.date) return false;
          const txTime = new Date(tx.date).getTime();
          return txTime >= minTime && txTime < maxTime;
        });
      },

      getCategoryById: (id) => {
        if (!id) return undefined;
        return getCategoryLookup(get().categories).get(id);
      },

      getBrandById: (id) => {
        if (!id) return undefined;
        return getBrandLookup(get().brands).get(id);
      },
    }),
    {
      name: 'fluo_finance_storage_v3',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        userId: state.userId,
        transactions: state.transactions,
        categories: state.categories,
        brands: state.brands,
        assets: state.assets,
        recurrences: state.recurrences,
        sources: state.sources,
        timeRange: state.timeRange,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.triggerRecurrencesCheck();
      },
      merge: (persistedState, currentState) => {
        const p = (persistedState as Partial<FinanceState>) || {};
        return {
          ...currentState,
          ...p,
          userId: p.userId !== undefined ? p.userId : currentState.userId,
          themeMode: p.themeMode || currentState.themeMode || 'dark',
          transactions:
            Array.isArray(p.transactions)
              ? sortTransactionsDesc(p.transactions)
              : currentState.transactions,
          categories: (() => {
            const initialMap = new Map(INITIAL_CATEGORIES.map((c) => [c.id, c]));
            const merged: Category[] = INITIAL_CATEGORIES.map((initCat) => {
              const stored = Array.isArray(p.categories)
                ? p.categories.find((c) => c.id === initCat.id)
                : null;
              return {
                ...initCat,
                ...(stored || {}),
              };
            });
            if (Array.isArray(p.categories)) {
              for (const storedCat of p.categories) {
                if (!initialMap.has(storedCat.id)) {
                  merged.push(storedCat);
                }
              }
            }
            return merged;
          })(),
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
            Array.isArray(p.assets)
              ? p.assets
              : currentState.assets,
          recurrences:
            Array.isArray(p.recurrences)
              ? p.recurrences
              : currentState.recurrences,
          sources:
            Array.isArray(p.sources)
              ? [...p.sources].sort((a, b) => a.orderIndex - b.orderIndex)
              : currentState.sources,
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
  const sources = useFinanceStore((state) => state.sources);

  return useMemo(() => {
    return computeFinancialSummary(transactions, assets, sources);
  }, [transactions, assets, sources]);
}
