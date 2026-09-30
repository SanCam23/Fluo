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
  ThemeMode,
  SourceAccount,
} from '../types/finance';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../data/categoriesAndBrands';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_INVESTMENT_ASSETS,
  INITIAL_RECURRENCE_RULES,
  INITIAL_SOURCE_ACCOUNTS,
} from '../data/initialMockData';
import { batchUpdateMarketQuotes, pruneExpiredQuoteCache, resetSwrTimestamps } from '../services/marketDataService';
import { processDueRecurrences } from '../services/recurringEngine';
import { computeFinancialSummary, computeSourceBalance, reconcileAssetsFromTransactions, autoCorrectAssetShares } from '../utils/finance';
import type { SourceBalanceInfo } from '../utils/finance';
import { sortTransactionsDesc } from '../utils/dates';
import {
  fetchUserCloudData,
  insertCloudTransaction,
  updateCloudTransaction,
  deleteCloudTransaction,
  insertCloudAsset,
  deleteCloudAsset,
  updateCloudAssetPrice,
  insertCloudSource,
  updateCloudSource,
  reorderCloudSources,
  deleteCloudSource,
} from '../services/cloudSyncService';
import { generateUuid } from '../lib/supabaseClient';

function generateId(_prefix?: string): string {
  return generateUuid();
}

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  brands: Brand[];
  assets: InvestmentAsset[];
  recurrences: RecurrenceRule[];
  sources: SourceAccount[];
  activeSourceId: string | null;
  timeRange: TimeRangeFilter;
  themeMode: ThemeMode;
  activeTab: 'home' | 'stats' | 'invest' | 'add';
  isLiveUpdating: boolean;
  lastSyncTimestamp?: string;
  userId: string | null;
  isCloudLoading: boolean;
  hasHydratedFromCloud: boolean;
  cloudSyncError: string | null;

  // Actions
  setActiveSourceId: (id: string | null) => void;
  setUserId: (userId: string | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  loadCloudData: (userId: string) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: InvestmentAsset[]) => void;
  setSources: (sources: SourceAccount[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updatedFields: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (asset: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => void;
  deleteAsset: (id: string) => void;
  updateAssetPrice: (id: string, newPrice: number) => void;
  refreshAllAssetPrices: () => Promise<void>;
  syncStaleAssetQuotes: (maxAgeHours?: number) => Promise<void>;
  reconcileInvestments: () => void;
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
  loadDemoData: () => void;
  purgeUserData: () => void;

  // Source Actions
  addSource: (source: Omit<SourceAccount, 'id' | 'createdAt'>) => SourceAccount;
  updateSource: (id: string, updatedFields: Partial<Omit<SourceAccount, 'id' | 'createdAt'>>) => void;
  deleteSource: (id: string) => void;
  reorderSources: (sourceIdsInOrder: string[]) => void;
  getSourceById: (id?: string) => SourceAccount | undefined;
  getSourceBalance: (sourceId: string) => SourceBalanceInfo | undefined;
  ensureDefaultSource: () => SourceAccount;

  // Methods
  getFinancialSummary: () => FinancialSummary;
  getFilteredTransactions: () => Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  getBrandById: (id?: string) => Brand | undefined;
}

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

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
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

      loadDemoData: () => {
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

            // Intelligent source reconciliation:
            // 1. If cloud returned 0 sources, but client already has local sources (e.g. offline, initial setup, or pending sync),
            //    DO NOT erase local sources; keep them and trigger cloud upload.
            // 2. If cloud returned sources, merge them with any local sources not yet in cloud.
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

            // Intelligent assets reconciliation:
            // 1. If cloud returned 0 assets, but client has local assets, preserve them and trigger cloud upload.
            // 2. If cloud returned assets, merge any local unsynced assets.
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

            // 3. Self-healing reconciliation: Reconstruct missing assets from transactions with pillar === 'invest'
            const allTransactions = result.transactions || [];
            const finalReconciledAssets = reconcileAssetsFromTransactions(
              allTransactions,
              mergedAssets,
              get().brands
            );

            // Auto-persist any newly reconciled assets to Supabase in background
            if (finalReconciledAssets.length > mergedAssets.length) {
              const existingKeys = new Set(
                mergedAssets.map((a) => (a.identifier || a.id).toUpperCase())
              );
              const newlyCreated = finalReconciledAssets.filter(
                (a) => !existingKeys.has((a.identifier || a.id).toUpperCase())
              );
              newlyCreated.forEach((a) => {
                insertCloudAsset(a, userId).catch((err) =>
                  console.warn('[Store] Auto-sync reconciled asset to cloud failed:', err)
                );
              });
            }

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

            // Purge stale entries from the market quote localStorage cache (>23h or legacy without cachedAt)
            // This ensures ISINs like IE0007987690 always get a fresh live fetch on a new day.
            pruneExpiredQuoteCache();

            // Trigger background quote refresh for stale/reconciled assets
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

      addSource: (sourceData) => {
        const { sources, userId } = get();

        // Regla de negocio: solo se permite una cuenta en efectivo
        if (sourceData.type === 'cash' && sources.some((s) => s.type === 'cash')) {
          console.warn('[Store] Solo se permite una cuenta en efectivo');
          throw new Error('Solo puedes tener una cuenta en efectivo.');
        }

        const newSource: SourceAccount = {
          ...sourceData,
          id: generateId('source'),
          userId: userId || undefined,
          orderIndex: sourceData.orderIndex ?? sources.length,
          createdAt: new Date().toISOString(),
        };
        const updated = [...sources, newSource].sort((a, b) => a.orderIndex - b.orderIndex);
        set({ sources: updated });

        if (userId) {
          insertCloudSource(newSource, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for addSource:', err)
          );
        }
        return newSource;
      },

      updateSource: (id, updatedFields) => {
        const { sources, userId } = get();

        // Regla de negocio: solo se permite una cuenta en efectivo
        if (
          updatedFields.type === 'cash' &&
          sources.some((s) => s.type === 'cash' && s.id !== id)
        ) {
          console.warn('[Store] Solo se permite una cuenta en efectivo');
          throw new Error('Solo puedes tener una cuenta en efectivo.');
        }

        set((state) => ({
          sources: state.sources
            .map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
            .sort((a, b) => a.orderIndex - b.orderIndex),
        }));

        if (userId) {
          updateCloudSource(id, updatedFields, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for updateSource:', err)
          );
        }
      },

      deleteSource: (id) => {
        const { userId, activeSourceId } = get();
        set((state) => {
          const filtered = state.sources.filter((s) => s.id !== id);
          const reindexed = filtered.map((s, idx) => ({ ...s, orderIndex: idx }));
          return {
            sources: reindexed,
            activeSourceId: activeSourceId === id ? null : state.activeSourceId,
          };
        });

        if (userId) {
          deleteCloudSource(id, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for deleteSource:', err)
          );
        }
      },

      reorderSources: (sourceIdsInOrder) => {
        const { sources, userId } = get();
        const sourceMap = new Map(sources.map((s) => [s.id, s]));
        const reordered: SourceAccount[] = [];
        sourceIdsInOrder.forEach((id, index) => {
          const s = sourceMap.get(id);
          if (s) {
            reordered.push({ ...s, orderIndex: index });
            sourceMap.delete(id);
          }
        });
        Array.from(sourceMap.values()).forEach((s) => {
          reordered.push({ ...s, orderIndex: reordered.length });
        });

        set({ sources: reordered });

        if (userId) {
          reorderCloudSources(reordered, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for reorderSources:', err)
          );
        }
      },

      getSourceById: (id) => {
        if (!id) return undefined;
        return get().sources.find((s) => s.id === id);
      },

      getSourceBalance: (sourceId) => {
        const source = get().sources.find((s) => s.id === sourceId);
        if (!source) return undefined;
        return computeSourceBalance(source, get().transactions);
      },

      ensureDefaultSource: () => {
        const { sources, addSource } = get();
        if (sources.length > 0) return sources[0];
        return addSource({
          name: 'Cuenta Principal',
          type: 'bank',
          institution: 'Principal',
          initialBalance: 0,
          orderIndex: 0,
          color: '#004481',
        });
      },

      addTransaction: (txData) => {
        const newTx: Transaction = {
          ...txData,
          id: generateId('tx'),
          createdAt: Date.now(),
        };

        const { sources, userId } = get();
        let companionIncomeTx: Transaction | null = null;

        // Cajero automated companion deposit in cash account:
        // "Cajero, en este caso se registrara como gasto y automaticamente como ingreso en la cuenta en efectivo si el usuario tiene."
        if (newTx.pillar === 'expense' && newTx.categoryId === 'cat-atm') {
          const cashSource = sources.find((s) => s.type === 'cash');
          if (cashSource && cashSource.id !== newTx.sourceId) {
            companionIncomeTx = {
              id: generateId('tx'),
              amount: newTx.amount,
              pillar: 'income',
              categoryId: 'cat-atm',
              sourceId: cashSource.id,
              concept: newTx.concept
                ? `Ingreso en efectivo (${newTx.concept})`
                : 'Ingreso en efectivo (Cajero)',
              date: newTx.date,
              createdAt: Date.now() + 1,
            };
          }
        }

        const txsToAdd = companionIncomeTx ? [newTx, companionIncomeTx] : [newTx];

        set((state) => ({
          transactions: sortTransactionsDesc([...txsToAdd, ...state.transactions]),
        }));

        if (userId) {
          txsToAdd.forEach((tx) => {
            insertCloudTransaction(tx, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for addTransaction:', err)
            );
          });
        }
      },

      updateTransaction: (id, updatedFields) => {
        const { userId } = get();
        set((state) => ({
          transactions: sortTransactionsDesc(
            state.transactions.map((tx) =>
              tx.id === id ? { ...tx, ...updatedFields } : tx
            )
          ),
        }));

        if (userId) {
          updateCloudTransaction(id, updatedFields, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for updateTransaction:', err)
          );
        }
      },

      deleteTransaction: (id) => {
        const { userId } = get();
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));

        if (userId) {
          deleteCloudTransaction(id, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for deleteTransaction:', err)
          );
        }
      },

      addAsset: (assetData) => {
        const shares = Number(assetData.shares) || 0;
        const buyPrice = Number(assetData.averageBuyPrice) || 0;
        const curPrice = Number(assetData.currentPrice) || buyPrice;
        const currentValue = Number((shares * curPrice).toFixed(2));
        const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
        const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
        const nowIso = new Date().toISOString();

        const newAsset: InvestmentAsset = {
          ...assetData,
          id: generateId('asset'),
          shares,
          averageBuyPrice: buyPrice,
          currentPrice: curPrice,
          currentValue,
          pnl,
          pnlPercentage,
          lastPriceUpdate: nowIso,
          last_price_update: nowIso,
          lastUpdated: 'Recién añadido',
        };
        set((state) => ({
          assets: [newAsset, ...state.assets],
        }));

        const { userId } = get();
        if (userId) {
          insertCloudAsset(newAsset, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for addAsset:', err)
          );
        }
      },

      deleteAsset: (id) => {
        const { userId } = get();
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));

        if (userId) {
          deleteCloudAsset(id, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for deleteAsset:', err)
          );
        }
      },

      updateAssetPrice: (id, newPrice) => {
        const { userId } = get();
        const nowIso = new Date().toISOString();
        set((state) => ({
          assets: state.assets.map((asset) => {
            if (asset.id !== id) return asset;
            const shares = Number(asset.shares) || 0;
            const buyPrice = Number(asset.averageBuyPrice) || 0; // NEVER alter buy price!
            const curPrice = Number(newPrice) || buyPrice;
            const currentValue = Number((shares * curPrice).toFixed(2));
            const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
            const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
            return {
              ...asset,
              currentPrice: curPrice,
              currentValue,
              pnl,
              pnlPercentage,
              lastPriceUpdate: nowIso,
              last_price_update: nowIso,
              lastUpdated: 'Ahora mismo',
            };
          }),
        }));

        if (userId) {
          updateCloudAssetPrice(id, newPrice, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for updateAssetPrice:', err)
          );
        }
      },

      refreshAllAssetPrices: async () => {
        // Force bypass SWR freshness window so the user's manual refresh always fetches live data
        resetSwrTimestamps();
        set({ isLiveUpdating: true });
        try {
          const state = get();
          const queries = state.assets.map((a) => ({
            identifier: a.identifier,
            quoteTicker: a.quoteTicker || a.quote_ticker,
            isin: a.isin,
          }));
          const quotes = await batchUpdateMarketQuotes(queries);
          const syncTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const nowIso = new Date().toISOString();

          set((s) => ({
            lastSyncTimestamp: syncTime,
            assets: s.assets.map((asset) => {
              const quote =
                quotes[asset.identifier] ||
                quotes[asset.identifier.toUpperCase()] ||
                (asset.quoteTicker ? quotes[asset.quoteTicker] : undefined) ||
                (asset.isin ? quotes[asset.isin] : undefined);

              if (quote) {
                // Auto-correct any single-share distorted cost position (e.g. S&P 500 total invested vs quotation)
                const { asset: correctedAsset, wasCorrected } = autoCorrectAssetShares(asset, Number(quote.price));
                const shares = Number(correctedAsset.shares) || 0;
                const buyPrice = Number(correctedAsset.averageBuyPrice) || 0;
                const curPrice = Number(quote.price) || buyPrice;
                const currentValue = Number((shares * curPrice).toFixed(2));
                const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
                const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
                const resolvedTicker = quote.quoteTicker || asset.quoteTicker || asset.quote_ticker;

                if (wasCorrected && get().userId) {
                  insertCloudAsset(correctedAsset, get().userId!).catch(() => {});
                }

                return {
                  ...correctedAsset,
                  currentPrice: curPrice,
                  currentValue,
                  pnl,
                  pnlPercentage,
                  quoteTicker: resolvedTicker,
                  quote_ticker: resolvedTicker,
                  lastPriceUpdate: nowIso,
                  last_price_update: nowIso,
                  change24h: quote.change24h,
                  isOfflineCached: quote.isOfflineCached,
                  lastUpdated: quote.isOfflineCached
                    ? `En caché (${quote.lastUpdated})`
                    : `En vivo (${quote.lastUpdated})`,
                };
              }
              return asset;
            }),
          }));
        } finally {
          set({ isLiveUpdating: false });
        }
      },

      syncStaleAssetQuotes: async (maxAgeHours = 6) => {
        const state = get();
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        const now = Date.now();

        const staleAssets = state.assets.filter((a) => {
          const ts = a.lastPriceUpdate || a.last_price_update;
          if (!ts) return true;
          const parsed = new Date(ts).getTime();
          if (isNaN(parsed)) return true;
          return now - parsed > maxAgeMs;
        });

        if (staleAssets.length === 0) return;

        try {
          const queries = staleAssets.map((a) => ({
            identifier: a.identifier,
            quoteTicker: a.quoteTicker || a.quote_ticker,
            isin: a.isin,
          }));
          const quotes = await batchUpdateMarketQuotes(queries);
          const syncTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const nowIso = new Date().toISOString();

          set((s) => ({
            lastSyncTimestamp: syncTime,
            assets: s.assets.map((asset) => {
              const quote =
                quotes[asset.identifier] ||
                quotes[asset.identifier.toUpperCase()] ||
                (asset.quoteTicker ? quotes[asset.quoteTicker] : undefined) ||
                (asset.isin ? quotes[asset.isin] : undefined);

              if (quote) {
                // Auto-correct any single-share distorted cost position (e.g. S&P 500 total invested vs quotation)
                const { asset: correctedAsset, wasCorrected } = autoCorrectAssetShares(asset, Number(quote.price));
                const shares = Number(correctedAsset.shares) || 0;
                const buyPrice = Number(correctedAsset.averageBuyPrice) || 0;
                const curPrice = Number(quote.price) || buyPrice;
                const currentValue = Number((shares * curPrice).toFixed(2));
                const pnl = Number((currentValue - (shares * buyPrice)).toFixed(2));
                const pnlPercentage = buyPrice > 0 ? Number((((curPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;
                const resolvedTicker = quote.quoteTicker || asset.quoteTicker || asset.quote_ticker;

                if (wasCorrected && get().userId) {
                  insertCloudAsset(correctedAsset, get().userId!).catch(() => {});
                }

                // Only advance the lastPriceUpdate timestamp when we got a LIVE price.
                // If the quote is offline-cached (network failed), keep the old timestamp
                // so the asset remains stale and gets retried on the next session/boot.
                const gotLivePrice = !quote.isOfflineCached;
                const newLastPriceUpdate = gotLivePrice ? nowIso : (asset.lastPriceUpdate || asset.last_price_update);

                return {
                  ...correctedAsset,
                  currentPrice: curPrice,
                  currentValue,
                  pnl,
                  pnlPercentage,
                  quoteTicker: resolvedTicker,
                  quote_ticker: resolvedTicker,
                  lastPriceUpdate: newLastPriceUpdate,
                  last_price_update: newLastPriceUpdate,
                  change24h: quote.change24h,
                  isOfflineCached: quote.isOfflineCached,
                  lastUpdated: quote.isOfflineCached
                    ? `En caché (${quote.lastUpdated})`
                    : `En vivo (${quote.lastUpdated})`,
                };
              }
              return asset;
            }),
          }));
        } catch (err) {
          console.warn('[Store] Background syncStaleAssetQuotes error:', err);
        }
      },

      reconcileInvestments: () => {
        const { transactions, assets, brands, userId } = get();
        // 1. Run auto-correction on all existing assets
        let anyCorrected = false;
        const correctedAssets = assets.map((a) => {
          const { asset: fixed, wasCorrected } = autoCorrectAssetShares(a);
          if (wasCorrected) anyCorrected = true;
          return fixed;
        });

        // 2. Reconcile with transactions
        const reconciled = reconcileAssetsFromTransactions(transactions, correctedAssets, brands);

        if (reconciled.length !== assets.length || anyCorrected) {
          set({ assets: reconciled });
          if (userId) {
            reconciled.forEach((a) => {
              insertCloudAsset(a, userId).catch((err) =>
                console.warn('[Store] Cloud sync failed for reconcileInvestments asset:', err)
              );
            });
          }
          get().syncStaleAssetQuotes(0).catch(() => {});
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
            transactions: sortTransactionsDesc([...generatedTransactions, ...state.transactions]),
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
