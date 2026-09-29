import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import { sortTransactionsDesc, getTodayDateString, getYesterdayDateString } from '../utils/dates';

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
});
