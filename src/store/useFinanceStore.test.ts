import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import { sortTransactionsDesc, getTodayDateString, getYesterdayDateString } from '../utils/dates';
import { parseInvestmentConcept, inferAssetTypeFromCategory, reconcileAssetsFromTransactions } from '../utils/finance';

describe('useFinanceStore - Custom Dates & Chronological Ordering', () => {
  beforeEach(() => {
    // Reset store to empty transactions before each test
    useFinanceStore.setState({
      transactions: [],
      assets: [],
      recurrences: [],
      timeRange: 'all',
    });
  });

  describe('sortTransactionsDesc utility', () => {
    it('should sort transactions chronologically descending (most recent date first)', () => {
      const txs = [
        { id: '1', date: '2026-05-10T12:00:00.000Z', createdAt: 100 },
        { id: '2', date: '2026-09-20T12:00:00.000Z', createdAt: 200 },
        { id: '3', date: '2026-01-15T12:00:00.000Z', createdAt: 300 },
        { id: '4', date: '2026-09-28T12:00:00.000Z', createdAt: 400 },
      ];

      const sorted = sortTransactionsDesc(txs);
      expect(sorted.map((t) => t.id)).toEqual(['4', '2', '1', '3']);
    });

    it('should use createdAt as secondary tie-breaker when dates are equal', () => {
      const txs = [
        { id: '1', date: '2026-08-01T12:00:00.000Z', createdAt: 1000 },
        { id: '2', date: '2026-08-01T12:00:00.000Z', createdAt: 2000 },
      ];

      const sorted = sortTransactionsDesc(txs);
      expect(sorted.map((t) => t.id)).toEqual(['2', '1']);
    });
  });

  describe('Store transaction insertion with custom dates', () => {
    it('should preserve custom past date when adding a transaction', () => {
      const customPastDate = '2026-06-15T12:00:00.000Z';
      
      useFinanceStore.getState().addTransaction({
        amount: 54.50,
        pillar: 'expense',
        categoryId: 'cat-groceries',
        concept: 'Compra Carrefour Junio',
        date: customPastDate,
      });

      const transactions = useFinanceStore.getState().transactions;
      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBe(customPastDate);
      expect(transactions[0].amount).toBe(54.50);
      expect(transactions[0].concept).toBe('Compra Carrefour Junio');
    });

    it('should maintain chronological descending order when transactions are inserted in non-chronological order', () => {
      const store = useFinanceStore.getState();

      // Add a recent transaction (September)
      store.addTransaction({
        amount: 100,
        pillar: 'income',
        categoryId: 'cat-salary',
        concept: 'Nómina Septiembre',
        date: '2026-09-25T12:00:00.000Z',
      });

      // Add a past transaction (July)
      store.addTransaction({
        amount: 45,
        pillar: 'expense',
        categoryId: 'cat-dining',
        concept: 'Cena Julio',
        date: '2026-07-14T12:00:00.000Z',
      });

      // Add a middle transaction (August)
      store.addTransaction({
        amount: 80,
        pillar: 'expense',
        categoryId: 'cat-groceries',
        concept: 'Compra Agosto',
        date: '2026-08-20T12:00:00.000Z',
      });

      // Add a future transaction (October)
      store.addTransaction({
        amount: 120,
        pillar: 'income',
        categoryId: 'cat-freelance',
        concept: 'Proyecto Octubre',
        date: '2026-10-05T12:00:00.000Z',
      });

      const transactions = useFinanceStore.getState().transactions;
      expect(transactions).toHaveLength(4);

      // Verify descending order: Oct > Sep > Aug > Jul
      expect(transactions[0].concept).toBe('Proyecto Octubre');
      expect(transactions[1].concept).toBe('Nómina Septiembre');
      expect(transactions[2].concept).toBe('Compra Agosto');
      expect(transactions[3].concept).toBe('Cena Julio');
    });

    it('should preserve updated date and re-sort list when updating transaction date', () => {
      const store = useFinanceStore.getState();

      store.addTransaction({
        amount: 200,
        pillar: 'income',
        categoryId: 'cat-salary',
        concept: 'Movimiento A',
        date: '2026-09-10T12:00:00.000Z',
      });

      store.addTransaction({
        amount: 50,
        pillar: 'expense',
        categoryId: 'cat-dining',
        concept: 'Movimiento B',
        date: '2026-09-20T12:00:00.000Z',
      });

      let txList = useFinanceStore.getState().transactions;
      const targetId = txList.find((t) => t.concept === 'Movimiento B')!.id;

      // Update Movimiento B's date to a past date (older than Movimiento A)
      store.updateTransaction(targetId, {
        date: '2026-08-01T12:00:00.000Z',
      });

      txList = useFinanceStore.getState().transactions;
      expect(txList[0].concept).toBe('Movimiento A');
      expect(txList[1].concept).toBe('Movimiento B');
      expect(txList[1].date).toBe('2026-08-01T12:00:00.000Z');
    });
  });

  describe('Filtered transactions and time ranges with past dates', () => {
    it('should correctly filter transactions by time range when past dates are registered', () => {
      const store = useFinanceStore.getState();
      const now = new Date();
      
      const thisMonthDate = new Date(now.getFullYear(), now.getMonth(), 15, 12, 0, 0).toISOString();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15, 12, 0, 0).toISOString();
      const olderDate = new Date(now.getFullYear(), now.getMonth() - 4, 15, 12, 0, 0).toISOString();

      store.addTransaction({
        amount: 100,
        pillar: 'expense',
        categoryId: 'cat-groceries',
        concept: 'Gasto Este Mes',
        date: thisMonthDate,
      });

      store.addTransaction({
        amount: 50,
        pillar: 'expense',
        categoryId: 'cat-groceries',
        concept: 'Gasto Mes Pasado',
        date: lastMonthDate,
      });

      store.addTransaction({
        amount: 30,
        pillar: 'expense',
        categoryId: 'cat-groceries',
        concept: 'Gasto Antiguo',
        date: olderDate,
      });

      // 1. Filter: this_month
      store.setTimeRange('this_month');
      let filtered = store.getFilteredTransactions();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].concept).toBe('Gasto Este Mes');

      // 2. Filter: last_month
      store.setTimeRange('last_month');
      filtered = store.getFilteredTransactions();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].concept).toBe('Gasto Mes Pasado');

      // 3. Filter: all
      store.setTimeRange('all');
      filtered = store.getFilteredTransactions();
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Date string helpers', () => {
    it('should format today and yesterday dates as YYYY-MM-DD', () => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(today).not.toBe(yesterday);
    });
  });

  describe('Investment Store - Silent Quote Sync & P&L recalculation', () => {
    it('should refetch stale assets (>6h) without altering averageBuyPrice', async () => {
      const store = useFinanceStore.getState();

      // Create an asset that was updated 10 hours ago (stale)
      const tenHoursAgo = new Date(Date.now() - 10 * 3600 * 1000).toISOString();
      const initialBuyPrice = 80.0;
      const initialShares = 10;

      store.addAsset({
        name: 'Vanguard US 500 Index Fund EUR',
        identifier: 'IE0032126645',
        isin: 'IE0032126645',
        quoteTicker: '0P00000SUJ.F',
        assetType: 'index_fund',
        shares: initialShares,
        averageBuyPrice: initialBuyPrice,
        currentPrice: 80.0,
        currency: 'EUR',
      });

      // Force asset timestamp to 10 hours ago
      useFinanceStore.setState((s) => ({
        assets: s.assets.map((a) => ({
          ...a,
          lastPriceUpdate: tenHoursAgo,
          last_price_update: tenHoursAgo,
        })),
      }));

      // Trigger silent background sync
      await store.syncStaleAssetQuotes(6);

      const updatedAsset = useFinanceStore.getState().assets[0];
      expect(updatedAsset).toBeDefined();

      // 1. averageBuyPrice is immutable
      expect(updatedAsset.averageBuyPrice).toBe(initialBuyPrice);

      // 2. Quote was updated
      expect(updatedAsset.currentPrice).toBeGreaterThan(0);
      expect(updatedAsset.currentValue).toBe(Number((initialShares * updatedAsset.currentPrice).toFixed(2)));
      expect(updatedAsset.pnl).toBe(Number((updatedAsset.currentValue! - (initialShares * initialBuyPrice)).toFixed(2)));
      expect(updatedAsset.quoteTicker).toBeDefined();

      // 3. Last update timestamp is fresh
      expect(updatedAsset.lastPriceUpdate).not.toBe(tenHoursAgo);
      const updateAgeMs = Date.now() - new Date(updatedAsset.lastPriceUpdate!).getTime();
      expect(updateAgeMs).toBeLessThan(10000); // Updated seconds ago
    });

    it('should NOT refetch fresh assets (<6h)', async () => {
      const store = useFinanceStore.getState();

      // Create an asset updated 1 hour ago
      const oneHourAgo = new Date(Date.now() - 1 * 3600 * 1000).toISOString();
      store.addAsset({
        name: 'Fresh Stock',
        identifier: 'AAPL',
        assetType: 'stock',
        shares: 5,
        averageBuyPrice: 200.0,
        currentPrice: 220.0,
        currency: 'USD',
      });

      useFinanceStore.setState((s) => ({
        assets: s.assets.map((a) => ({
          ...a,
          lastPriceUpdate: oneHourAgo,
          last_price_update: oneHourAgo,
        })),
      }));

      // Trigger silent background sync with 6h threshold
      await store.syncStaleAssetQuotes(6);

      const asset = useFinanceStore.getState().assets[0];
      // Timestamp should remain unchanged because it was fresh
      expect(asset.lastPriceUpdate).toBe(oneHourAgo);
    });
  });

  describe('Investment Reconciliation & Extraction from Transactions', () => {
    it('should correctly parse diverse investment transaction concepts', () => {
      expect(parseInvestmentConcept('Inversión en Apple (AAPL)')).toEqual({
        name: 'Apple',
        identifier: 'AAPL',
      });
      expect(parseInvestmentConcept('Inversión en Vanguard US 500 (IE0032126645)')).toEqual({
        name: 'Vanguard US 500',
        identifier: 'IE0032126645',
      });
      expect(parseInvestmentConcept('Inversión en Bitcoin')).toEqual({
        name: 'Bitcoin',
        identifier: 'BITCOIN',
      });
      expect(parseInvestmentConcept('Tesla (TSLA)')).toEqual({
        name: 'Tesla',
        identifier: 'TSLA',
      });
      expect(parseInvestmentConcept('')).toEqual({
        name: 'Inversión',
        identifier: 'ASSET',
      });
    });

    it('should correctly infer asset types', () => {
      expect(inferAssetTypeFromCategory('cat-stock', 'AAPL')).toBe('stock');
      expect(inferAssetTypeFromCategory('cat-crypto', 'BTC')).toBe('crypto');
      expect(inferAssetTypeFromCategory('cat-etf', 'VUSA')).toBe('etf');
      expect(inferAssetTypeFromCategory(undefined, 'IE0032126645')).toBe('index_fund');
      expect(inferAssetTypeFromCategory(undefined, 'ETH')).toBe('crypto');
    });

    it('should reconcile missing assets from transactions of pillar === "invest"', () => {
      const txs = [
        {
          id: 'tx-inv-1',
          amount: 500,
          pillar: 'invest' as const,
          categoryId: 'cat-stock',
          concept: 'Inversión en Apple (AAPL)',
          date: '2026-09-10T12:00:00.000Z',
          createdAt: 100,
        },
        {
          id: 'tx-inv-2',
          amount: 1200,
          pillar: 'invest' as const,
          categoryId: 'cat-etf',
          concept: 'Inversión en Vanguard S&P 500 (VUSA)',
          date: '2026-09-15T12:00:00.000Z',
          createdAt: 200,
        },
        {
          id: 'tx-expense-1',
          amount: 45,
          pillar: 'expense' as const,
          categoryId: 'cat-groceries',
          concept: 'Supermercado',
          date: '2026-09-18T12:00:00.000Z',
          createdAt: 300,
        },
      ];

      const reconciled = reconcileAssetsFromTransactions(txs, []);
      expect(reconciled).toHaveLength(2);

      const aapl = reconciled.find((a) => a.identifier === 'AAPL');
      expect(aapl).toBeDefined();
      expect(aapl?.name).toBe('Apple');
      expect(aapl?.averageBuyPrice).toBe(500);
      expect(aapl?.shares).toBe(1);
      expect(aapl?.currentPrice).toBe(500);
      expect(aapl?.currentValue).toBe(500);
      expect(aapl?.acquisitionDate).toBe('2026-09-10');

      const vusa = reconciled.find((a) => a.identifier === 'VUSA');
      expect(vusa).toBeDefined();
      expect(vusa?.name).toBe('Vanguard S&P 500');
      expect(vusa?.averageBuyPrice).toBe(1200);

      // Does not duplicate if already present
      const secondRun = reconcileAssetsFromTransactions(txs, reconciled);
      expect(secondRun).toHaveLength(2);
    });

    it('should auto-populate store assets when reconcileInvestments is triggered', () => {
      // Start with empty assets and 2 invest transactions
      useFinanceStore.setState({
        assets: [],
        transactions: [
          {
            id: 'tx-1',
            amount: 750,
            pillar: 'invest',
            categoryId: 'cat-stock',
            concept: 'Inversión en Nvidia (NVDA)',
            date: '2026-09-20T12:00:00.000Z',
            createdAt: 1,
          },
          {
            id: 'tx-2',
            amount: 300,
            pillar: 'invest',
            categoryId: 'cat-crypto',
            concept: 'Inversión en Bitcoin (BTC)',
            date: '2026-09-22T12:00:00.000Z',
            createdAt: 2,
          },
        ],
      });

      expect(useFinanceStore.getState().assets).toHaveLength(0);

      // Run reconcileInvestments
      useFinanceStore.getState().reconcileInvestments();

      const assets = useFinanceStore.getState().assets;
      expect(assets).toHaveLength(2);
      expect(assets.map((a) => a.identifier).sort()).toEqual(['BTC', 'NVDA']);
      expect(assets.find((a) => a.identifier === 'NVDA')?.currentValue).toBe(750);
      expect(assets.find((a) => a.identifier === 'BTC')?.currentValue).toBe(300);
    });
  });
});
