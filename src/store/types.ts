import type { StoreApi } from 'zustand';
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
import type { SourceBalanceInfo } from '../utils/finance';

export interface SourceAccountsSlice {
  addSource: (source: Omit<SourceAccount, 'id' | 'createdAt'>) => SourceAccount;
  updateSource: (id: string, updatedFields: Partial<Omit<SourceAccount, 'id' | 'createdAt'>>) => void;
  deleteSource: (id: string) => void;
  reorderSources: (sourceIdsInOrder: string[]) => void;
  getSourceById: (id?: string) => SourceAccount | undefined;
  getSourceBalance: (sourceId: string) => SourceBalanceInfo | undefined;
  ensureDefaultSource: () => SourceAccount;
}

export interface RecurrencesSlice {
  addRecurrence: (rule: Omit<RecurrenceRule, 'id'> & { id?: string }) => void;
  deleteRecurrence: (id: string) => void;
  toggleRecurrence: (id: string) => void;
  triggerRecurrencesCheck: (asOfDate?: Date) => number;
  simulateTimeAdvance: (days: number) => { generatedCount: number; simulatedDate: string };
  resetSimulatedTime: () => void;
}

export interface InvestmentsSlice {
  addAsset: (asset: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updatedFields: Partial<Omit<InvestmentAsset, 'id'>>) => void;
  withdrawAsset: (id: string, amount: number, destinationSourceId: string, date?: string) => void;
  updateAssetPrice: (id: string, newPrice: number) => void;
  refreshAllAssetPrices: () => Promise<void>;
  syncStaleAssetQuotes: (maxAgeHours?: number) => Promise<void>;
  reconcileInvestments: () => void;
}

export interface TransactionsSlice {
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
}

export interface FinanceState extends SourceAccountsSlice, RecurrencesSlice, InvestmentsSlice, TransactionsSlice {
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
  simulatedTimeOffsetDays: number;

  // App & Core Actions
  setActiveSourceId: (id: string | null) => void;
  setUserId: (userId: string | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  loadCloudData: (userId: string) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  setAssets: (assets: InvestmentAsset[]) => void;
  setSources: (sources: SourceAccount[]) => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setActiveTab: (tab: 'home' | 'stats' | 'invest' | 'add') => void;
  addBrand: (brand: Omit<Brand, 'id'> & { id?: string }) => Brand;
  resetToInitialData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  purgeUserData: () => void;

  // View & Derivation Methods
  getFinancialSummary: () => FinancialSummary;
  getFilteredTransactions: () => Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  getBrandById: (id?: string) => Brand | undefined;
}

export type StoreSet = StoreApi<FinanceState>['setState'];
export type StoreGet = StoreApi<FinanceState>['getState'];
