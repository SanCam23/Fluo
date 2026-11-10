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
  batchUpdateMarketQuotes,
  pruneExpiredQuoteCache,
  resetSwrTimestamps,
  isIsin,
  CURATED_MARKET_ASSETS,
} from '../services/marketDataService';
import { processDueRecurrences } from '../services/recurringEngine';
import {
  computeFinancialSummary,
  computeSourceBalance,
  reconcileAssetsFromTransactions,
  autoCorrectAssetShares,
  findMatchingAssetIndex,
  parseInvestmentConcept,
} from '../utils/finance';
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
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string; createdAt?: number; destinationSourceId?: string }) => void;
  transferBetweenSources: (params: {
    amount: number;
    fromSourceId: string;
    toSourceId: string;
    date?: string;
    concept?: string;
    isRecurring?: boolean;
    recurrenceId?: string;
  }) => { expenseTx: Transaction; incomeTx: Transaction };
  updateTransaction: (id: string, updatedFields: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (asset: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updatedFields: Partial<Omit<InvestmentAsset, 'id'>>) => void;
  withdrawAsset: (id: string, amount: number, destinationSourceId: string, date?: string) => void;
  updateAssetPrice: (id: string, newPrice: number) => void;
  refreshAllAssetPrices: () => Promise<void>;
  syncStaleAssetQuotes: (maxAgeHours?: number) => Promise<void>;
  reconcileInvestments: () => void;
  addRecurrence: (rule: Omit<RecurrenceRule, 'id'> & { id?: string }) => void;
  deleteRecurrence: (id: string) => void;
  toggleRecurrence: (id: string) => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setActiveTab: (tab: 'home' | 'stats' | 'invest' | 'add') => void;
  addBrand: (brand: Omit<Brand, 'id'> & { id?: string }) => Brand;
  triggerRecurrencesCheck: (asOfDate?: Date) => number;
  simulateTimeAdvance: (days: number) => { generatedCount: number; simulatedDate: string };
  resetSimulatedTime: () => void;
  simulatedTimeOffsetDays: number;
  resetToInitialData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
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

let cachedSourcesRef: SourceAccount[] | null = null;
let sourceLookupMap = new Map<string, SourceAccount>();

function getSourceLookup(sources: SourceAccount[]): Map<string, SourceAccount> {
  if (sources !== cachedSourcesRef) {
    cachedSourcesRef = sources;
    sourceLookupMap = new Map((Array.isArray(sources) ? sources : []).map((s) => [s.id, s]));
  }
  return sourceLookupMap;
}

const DEMO_RECURRENCE_IDS = new Set(['rec-001', 'rec-002', 'rec-003', 'rec-004', 'rec-005']);

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

            // Auto-persist any newly reconciled or healed assets to Supabase in background
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
        return getSourceLookup(get().sources).get(id);
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
          id: txData.id || generateId('tx'),
          createdAt: txData.createdAt || Date.now(),
        };

        const { sources, userId } = get();
        let companionIncomeTx: Transaction | null = null;

        // Cajero automated companion deposit in cash account:
        // "Cajero, en este caso se registrara como gasto y automaticamente como ingreso en la cuenta en efectivo si el usuario tiene."
        // 1. Traspaso entre cuentas / billetera (Companion deposit in destination source)
        if (
          newTx.pillar === 'expense' &&
          txData.destinationSourceId &&
          txData.destinationSourceId !== newTx.sourceId
        ) {
          const destSource = sources.find((s) => s.id === txData.destinationSourceId);
          const originSource = sources.find((s) => s.id === newTx.sourceId);
          const transferId = newTx.transferId || `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const companionId = generateId('tx');

          newTx.transferId = transferId;
          newTx.companionTxId = companionId;
          if (!newTx.concept || !newTx.concept.trim()) {
            newTx.concept = `Traspaso a ${destSource?.name || 'otra cuenta'}`;
          }

          const customDesc = newTx.concept?.trim();
          let incomeConcept = `Traspaso desde ${originSource?.name || 'otra cuenta'}`;
          if (customDesc && !customDesc.startsWith('Traspaso a ')) {
            incomeConcept = `Traspaso desde ${originSource?.name || 'otra cuenta'} (${customDesc})`;
          }

          companionIncomeTx = {
            id: companionId,
            amount: newTx.amount,
            pillar: 'income',
            categoryId: 'cat-transfer-income',
            sourceId: txData.destinationSourceId,
            concept: incomeConcept,
            date: newTx.date,
            isRecurring: newTx.isRecurring,
            recurrenceId: newTx.recurrenceId,
            createdAt: Date.now() + 1,
            transferId,
            companionTxId: newTx.id,
          };
        } else if (newTx.pillar === 'expense' && newTx.categoryId === 'cat-atm') {
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

      transferBetweenSources: ({
        amount,
        fromSourceId,
        toSourceId,
        date,
        concept,
        isRecurring,
        recurrenceId,
      }) => {
        const { sources, userId } = get();
        const fromSource = sources.find((s) => s.id === fromSourceId);
        const toSource = sources.find((s) => s.id === toSourceId);

        const txDate = date || new Date().toISOString();
        const transferId = `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const expenseId = generateId('tx');
        const incomeId = generateId('tx');

        const customDesc = concept?.trim();
        const expenseConcept = customDesc
          ? `Traspaso a ${toSource?.name || 'otra cuenta'} (${customDesc})`
          : `Traspaso a ${toSource?.name || 'otra cuenta'}`;

        const incomeConcept = customDesc
          ? `Traspaso desde ${fromSource?.name || 'otra cuenta'} (${customDesc})`
          : `Traspaso desde ${fromSource?.name || 'otra cuenta'}`;

        const expenseTx: Transaction = {
          id: expenseId,
          amount,
          pillar: 'expense',
          categoryId: 'cat-transfer',
          sourceId: fromSourceId,
          concept: expenseConcept,
          date: txDate,
          isRecurring,
          recurrenceId,
          createdAt: Date.now(),
          transferId,
          companionTxId: incomeId,
        };

        const incomeTx: Transaction = {
          id: incomeId,
          amount,
          pillar: 'income',
          categoryId: 'cat-transfer-income',
          sourceId: toSourceId,
          concept: incomeConcept,
          date: txDate,
          isRecurring,
          recurrenceId,
          createdAt: Date.now() + 1,
          transferId,
          companionTxId: expenseId,
        };

        set((state) => ({
          transactions: sortTransactionsDesc([expenseTx, incomeTx, ...state.transactions]),
        }));

        if (userId) {
          insertCloudTransaction(expenseTx, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for transfer expense:', err)
          );
          insertCloudTransaction(incomeTx, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for transfer income:', err)
          );
        }

        return { expenseTx, incomeTx };
      },

      updateTransaction: (id, updatedFields) => {
        const { userId, transactions, assets } = get();
        const oldTx = transactions.find((tx) => tx.id === id);

        // Companion transfer synchronization: keep paired transfer transaction in sync (amount & date)
        let companionUpdates: Partial<Transaction> | null = null;
        let companionId: string | null = null;
        if (oldTx && (oldTx.transferId || oldTx.companionTxId)) {
          const companion = transactions.find(
            (t) =>
              t.id !== id &&
              ((oldTx.transferId && t.transferId === oldTx.transferId) ||
                (oldTx.companionTxId && t.id === oldTx.companionTxId))
          );
          if (companion) {
            companionId = companion.id;
            companionUpdates = {};
            if (updatedFields.amount !== undefined) companionUpdates.amount = updatedFields.amount;
            if (updatedFields.date !== undefined) companionUpdates.date = updatedFields.date;
          }
        }

        let nextAssets = assets;
        if (oldTx && oldTx.pillar === 'invest') {
          const oldAmount = Number(oldTx.amount) || 0;
          const newAmount = updatedFields.amount !== undefined ? Number(updatedFields.amount) || 0 : oldAmount;
          const diffAmount = newAmount - oldAmount;

          const { identifier: oldIdent, name: oldName } = parseInvestmentConcept(oldTx.concept);
          let assetIndex = findMatchingAssetIndex(assets, {
            identifier: oldIdent,
            name: oldName,
          });

          if (assetIndex === -1 && updatedFields.concept) {
            const { identifier: newIdent, name: newName } = parseInvestmentConcept(updatedFields.concept);
            assetIndex = findMatchingAssetIndex(assets, {
              identifier: newIdent,
              name: newName,
            });
          }

          if (assetIndex !== -1) {
            const targetAsset = assets[assetIndex];
            const avgPrice = Number(targetAsset.averageBuyPrice) || Number(targetAsset.currentPrice) || 1;

            // Derive shares for old tranche and new tranche
            const oldTxShares =
              typeof oldTx.shares === 'number' && oldTx.shares > 0
                ? oldTx.shares
                : typeof oldTx.unitPrice === 'number' && oldTx.unitPrice > 0
                ? oldAmount / oldTx.unitPrice
                : avgPrice > 0
                ? oldAmount / avgPrice
                : 0;

            const newTxShares =
              typeof updatedFields.shares === 'number' && updatedFields.shares > 0
                ? updatedFields.shares
                : typeof updatedFields.unitPrice === 'number' && updatedFields.unitPrice > 0
                ? newAmount / updatedFields.unitPrice
                : oldTxShares;

            const diffShares = newTxShares - oldTxShares;

            if (
              diffAmount !== 0 ||
              diffShares !== 0 ||
              (updatedFields.concept && updatedFields.concept !== oldTx.concept) ||
              updatedFields.brandId !== undefined
            ) {
              const currentTotalCost = targetAsset.shares * (targetAsset.averageBuyPrice || 1);
              const newTotalCost = Math.max(0, currentTotalCost + diffAmount);
              const remainingShares = Number(Math.max(0, targetAsset.shares + diffShares).toFixed(6));

              if (remainingShares <= 0.0001 || newTotalCost <= 0.05) {
                nextAssets = assets.filter((_, idx) => idx !== assetIndex);
                if (userId) {
                  deleteCloudAsset(targetAsset.id, userId).catch(() => {});
                }
              } else {
                const newAvgPrice =
                  remainingShares > 0 ? Number((newTotalCost / remainingShares).toFixed(4)) : avgPrice;
                const curPrice = targetAsset.currentPrice || newAvgPrice;
                const currentValue = Number((remainingShares * curPrice).toFixed(2));
                const pnl = Number((currentValue - newTotalCost).toFixed(2));
                const pnlPercentage = newTotalCost > 0 ? Number(((pnl / newTotalCost) * 100).toFixed(2)) : 0;

                let updatedName = targetAsset.name;
                let updatedIdent = targetAsset.identifier;
                let updatedIsin = targetAsset.isin;
                let updatedTicker = targetAsset.ticker;
                if (updatedFields.concept && updatedFields.concept !== oldTx.concept) {
                  const { name: cName, identifier: cIdent } = parseInvestmentConcept(updatedFields.concept);
                  if (cName) updatedName = cName;
                  if (cIdent) {
                    updatedIdent = cIdent;
                    if (isIsin(cIdent)) updatedIsin = cIdent;
                    else updatedTicker = cIdent;
                  }
                }

                const brokerBrand = updatedFields.brandId ? get().getBrandById(updatedFields.brandId) : undefined;

                const updatedAsset: InvestmentAsset = {
                  ...targetAsset,
                  name: updatedName,
                  identifier: updatedIdent,
                  isin: updatedIsin,
                  ticker: updatedTicker,
                  brandId:
                    updatedFields.brandId !== undefined
                      ? updatedFields.brandId || undefined
                      : targetAsset.brandId,
                  platform: brokerBrand ? brokerBrand.name : targetAsset.platform,
                  shares: remainingShares,
                  averageBuyPrice: newAvgPrice,
                  averagePrice: newAvgPrice,
                  currentValue,
                  pnl,
                  pnlPercentage,
                  lastUpdated: 'Movimiento modificado',
                };

                nextAssets = [...assets];
                nextAssets[assetIndex] = updatedAsset;
                if (userId) {
                  insertCloudAsset(updatedAsset, userId).catch(() => {});
                }
              }
            }
          }
        }

        set({
          transactions: sortTransactionsDesc(
            transactions.map((tx) =>
              (companionId && tx.id === companionId && companionUpdates
                ? { ...tx, ...companionUpdates }
                : tx.id === id
                ? { ...tx, ...updatedFields }
                : tx)
            )
          ),
          assets: nextAssets,
        });

        if (userId) {
          updateCloudTransaction(id, updatedFields, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for updateTransaction:', err)
          );
          if (companionId && companionUpdates) {
            updateCloudTransaction(companionId, companionUpdates, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for update companionTransaction:', err)
            );
          }
        }
      },

      deleteTransaction: (id) => {
        const { userId, transactions, assets } = get();
        const txToDelete = transactions.find((tx) => tx.id === id);

        // 1. If it's an investment movement, deduct or remove from portfolio
        let nextAssets = assets;
        if (txToDelete && txToDelete.pillar === 'invest') {
          const { identifier: txIdent, name: txName } = parseInvestmentConcept(txToDelete.concept);
          const assetIndex = findMatchingAssetIndex(assets, {
            identifier: txIdent,
            name: txName,
          });

          if (assetIndex !== -1) {
            const targetAsset = assets[assetIndex];
            const txAmount = Number(txToDelete.amount) || 0;
            const avgPrice = Number(targetAsset.averageBuyPrice) || Number(targetAsset.currentPrice) || 1;
            const currentTotalCost = targetAsset.shares * avgPrice;

            // Shares corresponding to this transaction
            const sharesToRemove = avgPrice > 0 ? txAmount / avgPrice : 0;
            const remainingShares = Number(Math.max(0, targetAsset.shares - sharesToRemove).toFixed(6));
            const remainingCost = Math.max(0, currentTotalCost - txAmount);

            // If no shares remain (or was the only movement), delete asset from portfolio
            if (remainingShares <= 0.0001 || remainingCost <= 0.05) {
              nextAssets = assets.filter((_, idx) => idx !== assetIndex);
              if (userId) {
                deleteCloudAsset(targetAsset.id, userId).catch((err) =>
                  console.warn('[Store] Cloud sync failed for deleteCloudAsset:', err)
                );
              }
            } else {
              // Deduct shares and cost from the asset
              const newAvgPrice =
                remainingShares > 0 ? Number((remainingCost / remainingShares).toFixed(4)) : avgPrice;
              const curPrice = targetAsset.currentPrice || newAvgPrice;
              const currentValue = Number((remainingShares * curPrice).toFixed(2));
              const pnl = Number((currentValue - remainingCost).toFixed(2));
              const pnlPercentage = remainingCost > 0 ? Number(((pnl / remainingCost) * 100).toFixed(2)) : 0;

              const updatedAsset: InvestmentAsset = {
                ...targetAsset,
                shares: remainingShares,
                averageBuyPrice: newAvgPrice,
                averagePrice: newAvgPrice,
                currentValue,
                pnl,
                pnlPercentage,
                lastUpdated: 'Aportación eliminada',
              };

              nextAssets = [...assets];
              nextAssets[assetIndex] = updatedAsset;

              if (userId) {
                insertCloudAsset(updatedAsset, userId).catch((err) =>
                  console.warn('[Store] Cloud sync failed for updateCloudAsset on deleteTransaction:', err)
                );
              }
            }
          }
        }

        // 2. If it's a recurring movement, check and handle associated recurrence rule
        let nextRecurrences = get().recurrences;
        if (txToDelete && (txToDelete.isRecurring || txToDelete.recurrenceId)) {
          const matchedRule = txToDelete.recurrenceId
            ? nextRecurrences.find((r) => r.id === txToDelete.recurrenceId)
            : nextRecurrences.find(
                (r) =>
                  r.pillar === txToDelete.pillar &&
                  r.amount === txToDelete.amount &&
                  (r.title.toLowerCase() === txToDelete.concept.toLowerCase() ||
                    txToDelete.concept.toLowerCase().includes(r.title.toLowerCase()))
              );

          if (matchedRule) {
            // Al eliminar cualquiera de las transacciones de una serie recurrente (primera, segunda o posteriores),
            // se cancela/elimina la regla de recurrencia para que no se generen movimientos futuros.
            nextRecurrences = nextRecurrences.filter((r) => r.id !== matchedRule.id);

          }
        }

                // 3. Companion transfer deletion: if deleting one side of a transfer, delete both sides
        let companionIdToDelete: string | null = null;
        if (txToDelete && (txToDelete.transferId || txToDelete.companionTxId)) {
          const companion = transactions.find(
            (t) =>
              t.id !== id &&
              ((txToDelete.transferId && t.transferId === txToDelete.transferId) ||
                (txToDelete.companionTxId && t.id === txToDelete.companionTxId))
          );
          if (companion) {
            companionIdToDelete = companion.id;
          }
        }

        set({
          transactions: transactions.filter((tx) => tx.id !== id && tx.id !== companionIdToDelete),
          assets: nextAssets,
          recurrences: nextRecurrences,
        });

        if (userId) {
          deleteCloudTransaction(id, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for deleteTransaction:', err)
          );
          if (companionIdToDelete) {
            deleteCloudTransaction(companionIdToDelete, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for delete companionTransaction:', err)
            );
          }
        }
      },

      addAsset: (assetData) => {
        const { assets, userId } = get();
        const existingIdx = findMatchingAssetIndex(assets, assetData);

        if (existingIdx !== -1) {
          // Accumulate into existing asset (sum shares & recalculate weighted average buy price)
          const existing = assets[existingIdx];
          const oldShares = Number(existing.shares) || 0;
          const oldAvgPrice = Number(existing.averageBuyPrice) || 0;
          const oldTotalCost = oldShares * oldAvgPrice;

          const newShares = Number(assetData.shares) || 0;
          const newBuyPrice = Number(assetData.averageBuyPrice) || 0;
          const newTotalCost = newShares * newBuyPrice;

          const combinedShares = Number((oldShares + newShares).toFixed(6));
          const combinedTotalCost = oldTotalCost + newTotalCost;
          const combinedAvgPrice =
            combinedShares > 0 ? Number((combinedTotalCost / combinedShares).toFixed(4)) : newBuyPrice;
          const latestPrice = Number(assetData.currentPrice) || Number(existing.currentPrice) || combinedAvgPrice;
          const currentValue = Number((combinedShares * latestPrice).toFixed(2));
          const pnl = Number((currentValue - combinedTotalCost).toFixed(2));
          const pnlPercentage =
            combinedTotalCost > 0 ? Number(((pnl / combinedTotalCost) * 100).toFixed(2)) : 0;
          const combinedFee = (Number(existing.initialFee) || 0) + (Number(assetData.initialFee) || 0);
          const nowIso = new Date().toISOString();

          const updatedAsset: InvestmentAsset = {
            ...existing,
            shares: combinedShares,
            averageBuyPrice: combinedAvgPrice,
            averagePrice: combinedAvgPrice,
            currentPrice: latestPrice,
            currentValue,
            pnl,
            pnlPercentage,
            initialFee: combinedFee > 0 ? combinedFee : undefined,
            quoteTicker: assetData.quoteTicker || existing.quoteTicker,
            quote_ticker: assetData.quote_ticker || existing.quote_ticker,
            lastPriceUpdate: nowIso,
            last_price_update: nowIso,
            lastUpdated: 'Posición acumulada',
            isOfflineCached:
              assetData.isOfflineCached !== undefined ? assetData.isOfflineCached : existing.isOfflineCached,
          };

          const nextAssets = [...assets];
          nextAssets[existingIdx] = updatedAsset;
          set({ assets: nextAssets });

          if (userId) {
            insertCloudAsset(updatedAsset, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for accumulate asset:', err)
            );
          }
          return;
        }

        // New asset registration
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

        // Reconcile immediately so any shadowed active transaction is restored
        get().reconcileInvestments();
      },

      updateAsset: (id, updatedFields) => {
        const { assets, userId } = get();
        const existing = assets.find((a) => a.id === id);
        if (!existing) return;

        const nextShares =
          updatedFields.shares !== undefined ? Number(updatedFields.shares) : existing.shares;
        const nextBuyPrice =
          updatedFields.averageBuyPrice !== undefined
            ? Number(updatedFields.averageBuyPrice)
            : existing.averageBuyPrice;
        const nextCurrentPrice =
          updatedFields.currentPrice !== undefined
            ? Number(updatedFields.currentPrice)
            : (existing.currentPrice || nextBuyPrice);
        const nextFee =
          updatedFields.initialFee !== undefined
            ? Number(updatedFields.initialFee)
            : (existing.initialFee || 0);
        const nextTotalCost = nextShares * nextBuyPrice + nextFee;
        const nextCurrentValue = Number((nextShares * nextCurrentPrice).toFixed(2));
        const nextPnl = Number((nextCurrentValue - nextTotalCost).toFixed(2));
        const nextPnlPercentage =
          nextTotalCost > 0 ? Number(((nextPnl / nextTotalCost) * 100).toFixed(2)) : 0;
        const nowIso = new Date().toISOString();

        const updatedAsset: InvestmentAsset = {
          ...existing,
          ...updatedFields,
          shares: nextShares,
          averageBuyPrice: nextBuyPrice,
          averagePrice: nextBuyPrice,
          currentPrice: nextCurrentPrice,
          currentValue: nextCurrentValue,
          pnl: nextPnl,
          pnlPercentage: nextPnlPercentage,
          lastPriceUpdate: nowIso,
          last_price_update: nowIso,
          lastUpdated: 'Modificado manualmente',
        };

        set({
          assets: assets.map((a) => (a.id === id ? updatedAsset : a)),
        });

        if (userId) {
          insertCloudAsset(updatedAsset, userId).catch((err) =>
            console.warn('[Store] Cloud sync failed for updateAsset:', err)
          );
        }
      },

      withdrawAsset: (id, amount, destinationSourceId, date) => {
        const { assets, userId, addTransaction } = get();
        const existing = assets.find((a) => a.id === id);
        if (!existing) return;

        const curPrice = Number(existing.currentPrice) || Number(existing.averageBuyPrice) || 1;
        const safeAmount = Math.max(0, Number(amount) || 0);
        if (safeAmount <= 0) return;

        const sharesWithdrawn = curPrice > 0 ? safeAmount / curPrice : 0;
        const totalPositionValue = Number((existing.shares * curPrice).toFixed(2));
        const isFullWithdrawal = safeAmount >= totalPositionValue - 0.05;

        if (isFullWithdrawal) {
          // Posición liquidada por completo
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
          }));
          if (userId) {
            deleteCloudAsset(id, userId).catch((err) =>
              console.warn('[Store] Cloud sync failed for withdraw deleteAsset:', err)
            );
          }
        } else {
          // Retirada parcial: se reducen las participaciones correspondientes
          const remainingShares = Number(Math.max(0, existing.shares - sharesWithdrawn).toFixed(6));

          if (remainingShares <= 0.0001) {
            set((state) => ({
              assets: state.assets.filter((a) => a.id !== id),
            }));
            if (userId) {
              deleteCloudAsset(id, userId).catch((err) =>
                console.warn('[Store] Cloud sync failed for withdraw deleteAsset:', err)
              );
            }
          } else {
            const nextCurrentValue = Number((remainingShares * curPrice).toFixed(2));
            const costBasis = remainingShares * existing.averageBuyPrice;
            const nextPnl = Number((nextCurrentValue - costBasis).toFixed(2));
            const nextPnlPercentage =
              costBasis > 0 ? Number(((nextPnl / costBasis) * 100).toFixed(2)) : 0;

            const updatedAsset: InvestmentAsset = {
              ...existing,
              shares: remainingShares,
              currentValue: nextCurrentValue,
              pnl: nextPnl,
              pnlPercentage: nextPnlPercentage,
              lastUpdated: 'Retirada parcial',
            };

            set((state) => ({
              assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
            }));

            if (userId) {
              insertCloudAsset(updatedAsset, userId).catch((err) =>
                console.warn('[Store] Cloud sync failed for withdraw updateAsset:', err)
              );
            }
          }
        }

        // Registrar movimiento de ingreso en la cuenta destino seleccionada
        const txDate = date
          ? (date.includes('T') ? date : `${date}T12:00:00.000Z`)
          : new Date().toISOString();

        addTransaction({
          amount: safeAmount,
          shares: Number(sharesWithdrawn.toFixed(6)),
          unitPrice: curPrice,
          pillar: 'income',
          categoryId: 'cat-dividends',
          sourceId: destinationSourceId || undefined,
          concept: `Retirada de ${existing.name} (${existing.identifier})`,
          date: txDate,
        });
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
          const queries = state.assets
            .filter((a) => a.assetType !== 'deposit')
            .map((a) => {
            const cleanIdent = a.identifier?.trim().toUpperCase() || '';
            const curatedMatch = CURATED_MARKET_ASSETS.find(
              (c) =>
                c.identifier.toUpperCase() === cleanIdent ||
                c.isin?.toUpperCase() === cleanIdent ||
                (c.keywords && c.keywords.some((k) => a.name?.toLowerCase().includes(k)))
            );
            const isin = a.isin || (isIsin(cleanIdent) ? cleanIdent : undefined) || curatedMatch?.isin;
            return {
              identifier: a.identifier,
              quoteTicker: a.quoteTicker || a.quote_ticker || curatedMatch?.quoteTicker,
              isin,
            };
          });
          const quotes = await batchUpdateMarketQuotes(queries, true);
          const syncTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const nowIso = new Date().toISOString();

          set((s) => ({
            lastSyncTimestamp: syncTime,
            assets: s.assets.map((asset) => {
              const cleanId = asset.identifier?.trim().toUpperCase() || '';
              const cleanIsin = asset.isin?.trim().toUpperCase() || '';
              const cleanTicker = (asset.quoteTicker || asset.quote_ticker)?.trim().toUpperCase() || '';

              const quote =
                quotes[asset.identifier] ||
                quotes[cleanId] ||
                (cleanTicker ? quotes[cleanTicker] || quotes[asset.quoteTicker!] : undefined) ||
                (cleanIsin ? quotes[cleanIsin] || quotes[asset.isin!] : undefined) ||
                (cleanId === 'IE0032126645' || asset.name?.toLowerCase().includes('us 500') || asset.name?.toLowerCase().includes('sp500')
                  ? quotes['IE0032126645'] || quotes['0P00000SUJ.F']
                  : undefined);

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
          if (a.assetType === 'deposit') return false;
          const ts = a.lastPriceUpdate || a.last_price_update;
          if (!ts) return true;
          const parsed = new Date(ts).getTime();
          if (isNaN(parsed)) return true;
          return now - parsed > maxAgeMs;
        });

        if (staleAssets.length === 0) return;

        try {
          const queries = staleAssets.map((a) => {
            const cleanIdent = a.identifier?.trim().toUpperCase() || '';
            const curatedMatch = CURATED_MARKET_ASSETS.find(
              (c) =>
                c.identifier.toUpperCase() === cleanIdent ||
                c.isin?.toUpperCase() === cleanIdent ||
                (c.keywords && c.keywords.some((k) => a.name?.toLowerCase().includes(k)))
            );
            const isin = a.isin || (isIsin(cleanIdent) ? cleanIdent : undefined) || curatedMatch?.isin;
            return {
              identifier: a.identifier,
              quoteTicker: a.quoteTicker || a.quote_ticker || curatedMatch?.quoteTicker,
              isin,
            };
          });
          const quotes = await batchUpdateMarketQuotes(queries, true);
          const syncTime = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const nowIso = new Date().toISOString();

          set((s) => ({
            lastSyncTimestamp: syncTime,
            assets: s.assets.map((asset) => {
              const cleanId = asset.identifier?.trim().toUpperCase() || '';
              const cleanIsin = asset.isin?.trim().toUpperCase() || '';
              const cleanTicker = (asset.quoteTicker || asset.quote_ticker)?.trim().toUpperCase() || '';

              const quote =
                quotes[asset.identifier] ||
                quotes[cleanId] ||
                (cleanTicker ? quotes[cleanTicker] || quotes[asset.quoteTicker!] : undefined) ||
                (cleanIsin ? quotes[cleanIsin] || quotes[asset.isin!] : undefined) ||
                (cleanId === 'IE0032126645' || asset.name?.toLowerCase().includes('us 500') || asset.name?.toLowerCase().includes('sp500')
                  ? quotes['IE0032126645'] || quotes['0P00000SUJ.F']
                  : undefined);

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

        const hasChanges =
          reconciled.length !== assets.length ||
          anyCorrected ||
          reconciled.some((ra, idx) => {
            const a = assets[idx];
            return (
              !a ||
              ra.id !== a.id ||
              ra.name !== a.name ||
              ra.shares !== a.shares ||
              ra.averageBuyPrice !== a.averageBuyPrice ||
              ra.identifier !== a.identifier
            );
          });

        if (hasChanges) {
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
          id: ruleData.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          isActive: true,
          autoCharge: ruleData.autoCharge !== false,
        };
        set((state) => ({
          recurrences: [...state.recurrences, newRule],
        }));
      },

      deleteRecurrence: (id) => {
        set((state) => ({
          recurrences: state.recurrences.filter((r) => r.id !== id),
        }));
      },

      toggleRecurrence: (id) => {
        set((state) => ({
          recurrences: state.recurrences.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        }));
      },

      triggerRecurrencesCheck: (asOfDate) => {
        const { recurrences, transactions, simulatedTimeOffsetDays } = get();

        // Self-healing: Purge any orphaned recurrence rules that have 0 transactions in the ledger
        // (Cleans up recurrences where the initial transaction was deleted prior to this update)
        const healedRecurrences = recurrences.filter((rule) => {
          if (DEMO_RECURRENCE_IDS.has(rule.id)) {
            return true;
          }
          const hasMatchingTx = transactions.some(
            (t) =>
              t.recurrenceId === rule.id ||
              (t.pillar === rule.pillar &&
                t.amount === rule.amount &&
                t.concept.toLowerCase() === rule.title.toLowerCase())
          );
          return hasMatchingTx;
        });

        const targetDate = asOfDate || new Date(Date.now() + simulatedTimeOffsetDays * 86400000);
        const { generatedTransactions, updatedRules } = processDueRecurrences(
          healedRecurrences,
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
