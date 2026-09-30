import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import { sortTransactionsDesc, getTodayDateString, getYesterdayDateString } from '../utils/dates';
import { parseInvestmentConcept, inferAssetTypeFromCategory, reconcileAssetsFromTransactions, autoCorrectAssetShares } from '../utils/finance';

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
      // For VUSA (S&P 500), unit price is 82.97 € and shares are derived (1200 / 82.97)
      expect(vusa?.averageBuyPrice).toBe(82.97);
      expect(vusa?.shares).toBeCloseTo(1200 / 82.97, 4);
      expect(vusa?.currentValue).toBe(1200);

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

    it('should auto-correct existing asset when user invested 209.81 € in S&P 500 at 82.97 quotation', () => {
      // User case: 209.81 € deployed in S&P 500 (unit quote 82.97 €)
      const erroneousAsset = {
        id: 'asset-sp500',
        name: 'Vanguard US 500 Stock Index Fund',
        identifier: 'IE0032126645',
        assetType: 'index_fund' as const,
        shares: 1, // erroneously stored as 1 unit
        averageBuyPrice: 209.81, // total cash recorded as unit price
        currentPrice: 82.97, // live market quotation
        currency: 'EUR' as const,
        lastUpdated: 'Recién añadido',
      };

      const { asset: corrected, wasCorrected } = autoCorrectAssetShares(erroneousAsset, 82.97);

      expect(wasCorrected).toBe(true);
      // Corrected shares = 209.81 / 82.97 = 2.528745
      expect(corrected.shares).toBeCloseTo(2.528745, 4);
      expect(corrected.averageBuyPrice).toBe(82.97);
      expect(corrected.currentPrice).toBe(82.97);
      // Valuation preserved at 209.81 € (does not drop to 82.97 €)
      expect(corrected.currentValue).toBe(209.81);
      // P&L is neutral (0 €) instead of dropping 126 €
      expect(corrected.pnl).toBe(0);
    });

    it('should automatically update existing distorted assets in store without requiring user to recreate them', () => {
      // Put distorted asset into store
      useFinanceStore.setState({
        assets: [
          {
            id: 'asset-sp500',
            name: 'Vanguard US 500 Stock Index Fund',
            identifier: 'IE0032126645',
            assetType: 'index_fund',
            shares: 1,
            averageBuyPrice: 209.81,
            currentPrice: 82.97,
            currency: 'EUR',
            lastUpdated: 'Recién añadido',
          },
        ],
        transactions: [],
      });

      // Trigger store reconciliation
      useFinanceStore.getState().reconcileInvestments();

      const updatedAsset = useFinanceStore.getState().assets[0];
      expect(updatedAsset).toBeDefined();
      expect(updatedAsset.shares).toBeGreaterThan(2); // ~2.53 shares
      expect(updatedAsset.averageBuyPrice).toBe(82.97);
      expect(updatedAsset.currentValue).toBe(209.81);
    });

    it('should heal and restore an asset whose name was overwritten by a deleted movement', () => {
      // User has an active transaction for SP500 with ISIN IE0007987690
      const txs = [
        {
          id: 'tx-sp500',
          pillar: 'invest' as const,
          type: 'expense' as const,
          concept: 'Inversión en SP500 IE0007987690',
          amount: 209.81,
          date: '2026-09-29T10:00:00.000Z',
          createdAt: 1727600000000,
          categoryId: 'cat-invest',
        },
      ];

      // In store/state, the asset had been overwritten by European Stock before its movement was deleted
      const corruptedAssets = [
        {
          id: 'asset-corrupted-1',
          name: 'Vanguard European Stock Index Fund EUR Acc',
          identifier: 'IE0007987690',
          isin: 'IE0007987690',
          assetType: 'index_fund' as const,
          shares: 1,
          averageBuyPrice: 209.81,
          currentPrice: 41.25,
          currentValue: 41.25,
          pnl: -168.56,
          currency: 'EUR' as const,
          lastUpdated: 'Recién añadido',
        },
      ];

      useFinanceStore.setState({
        transactions: txs,
        assets: corruptedAssets,
      });

      // Run store reconciliation
      useFinanceStore.getState().reconcileInvestments();

      const assets = useFinanceStore.getState().assets;
      expect(assets).toHaveLength(1);
      const healed = assets[0];
      // Name is restored to the active transaction fund (SP500)
      expect(healed.name).toBe('SP500');
      expect(healed.identifier).toBe('IE0007987690');
      // Units are calculated accurately from the benchmark price (82.97 €)
      expect(healed.shares).toBeCloseTo(2.528745, 4);
      expect(healed.averageBuyPrice).toBe(82.97);
      expect(healed.currentValue).toBe(209.81);
      expect(healed.pnl).toBe(0);
    });

    it('should automatically remove orphaned auto-reconciled assets when their transaction is deleted', () => {
      const orphanedAsset = {
        id: 'reconciled-asset-tx-deleted',
        name: 'Vanguard European Stock',
        identifier: 'IE0007987690',
        assetType: 'index_fund' as const,
        shares: 1,
        averageBuyPrice: 41.25,
        currentPrice: 41.25,
        currency: 'EUR' as const,
        lastUpdated: 'Reconciliado de movimientos',
      };

      // Transactions are now empty (movement was deleted)
      const reconciled = reconcileAssetsFromTransactions([], [orphanedAsset]);
      expect(reconciled).toHaveLength(0);
    });

    it('should immediately re-reconcile on deleteAsset to resurrect any shadowed positions', () => {
      // Transaction for SP500
      const txs = [
        {
          id: 'tx-sp500-valid',
          pillar: 'invest' as const,
          type: 'expense' as const,
          concept: 'Inversión en SP500 IE0032126645',
          amount: 209.81,
          date: '2026-09-29T10:00:00.000Z',
          createdAt: 1727600000000,
          categoryId: 'cat-invest',
        },
      ];

      // A dummy asset that the user wants to delete
      const dummyAsset = {
        id: 'asset-to-delete',
        name: 'Fondo Huérfano',
        identifier: 'OLD_IDENTIFIER',
        assetType: 'index_fund' as const,
        shares: 1,
        averageBuyPrice: 50,
        currentPrice: 50,
        currency: 'EUR' as const,
        lastUpdated: 'Manual',
      };

      useFinanceStore.setState({
        transactions: txs,
        assets: [dummyAsset],
      });

      // User deletes dummy asset
      useFinanceStore.getState().deleteAsset('asset-to-delete');

      // deleteAsset triggers reconcileInvestments() which creates the asset for the active SP500 transaction
      const stateAssets = useFinanceStore.getState().assets;
      expect(stateAssets.some((a) => a.id === 'asset-to-delete')).toBe(false);
      expect(stateAssets.some((a) => a.name.includes('SP500') || a.identifier === 'IE0032126645')).toBe(true);
    });
  });

  describe('New Expense Categories & ATM (Cajero) Automated Cash Transfer', () => {
    it('should include the 6 required expense categories in INITIAL_CATEGORIES', () => {
      const categories = useFinanceStore.getState().categories;
      const expenseCats = categories.filter((c) => c.pillar === 'expense');

      const expectedNew = [
        { id: 'cat-education', name: 'Estudios / Formación' },
        { id: 'cat-atm', name: 'Cajero' },
        { id: 'cat-bizum-expense', name: 'Bizum' },
        { id: 'cat-travel', name: 'Viajes' },
        { id: 'cat-gifts', name: 'Regalos' },
        { id: 'cat-other-expense', name: 'Otros' },
      ];

      expectedNew.forEach((exp) => {
        const found = expenseCats.find((c) => c.id === exp.id);
        expect(found).toBeDefined();
        expect(found?.name).toBe(exp.name);
      });
    });

    it('should strictly enforce that a user can have at most one cash account', () => {
      useFinanceStore.setState({ sources: [] });
      const store = useFinanceStore.getState();

      // 1. Add first cash account -> succeeds
      const cashSource1 = store.addSource({
        name: 'Billetera Principal',
        type: 'cash',
        initialBalance: 50,
        orderIndex: 0,
      });
      expect(cashSource1.id).toBeDefined();
      expect(useFinanceStore.getState().sources).toHaveLength(1);

      // 2. Add second cash account -> throws error
      expect(() => {
        store.addSource({
          name: 'Segunda Billetera',
          type: 'cash',
          initialBalance: 20,
          orderIndex: 1,
        });
      }).toThrow(/una cuenta en efectivo/i);

      // 3. Add bank account -> succeeds
      const bankSource = store.addSource({
        name: 'Cuenta BBVA',
        type: 'bank',
        initialBalance: 1000,
        orderIndex: 1,
      });
      expect(bankSource.id).toBeDefined();

      // 4. Update bank account to cash -> throws error because cash account already exists
      expect(() => {
        store.updateSource(bankSource.id, { type: 'cash' });
      }).toThrow(/una cuenta en efectivo/i);

      // 5. Updating the existing cash account itself -> succeeds
      expect(() => {
        store.updateSource(cashSource1.id, { name: 'Efectivo Diario' });
      }).not.toThrow();
    });

    it('should record ATM (Cajero) expense and automatically create companion income into cash account', () => {
      useFinanceStore.setState({
        sources: [
          {
            id: 'src-bank-1',
            name: 'BBVA Nómina',
            type: 'bank',
            orderIndex: 0,
            createdAt: '2026-09-01T00:00:00.000Z',
          },
          {
            id: 'src-cash-1',
            name: 'Billetera Efectivo',
            type: 'cash',
            orderIndex: 1,
            createdAt: '2026-09-01T00:00:00.000Z',
          },
        ],
        transactions: [],
      });

      const store = useFinanceStore.getState();

      // Register an ATM withdrawal from the bank account
      store.addTransaction({
        amount: 60,
        pillar: 'expense',
        categoryId: 'cat-atm',
        sourceId: 'src-bank-1',
        concept: 'Retirada cajero CaixaBank',
        date: '2026-09-28T14:30:00.000Z',
      });

      const txs = useFinanceStore.getState().transactions;
      // Must contain 2 transactions: the bank expense and the cash income
      expect(txs).toHaveLength(2);

      const expenseTx = txs.find((t) => t.pillar === 'expense');
      const incomeTx = txs.find((t) => t.pillar === 'income');

      expect(expenseTx).toBeDefined();
      expect(expenseTx?.amount).toBe(60);
      expect(expenseTx?.categoryId).toBe('cat-atm');
      expect(expenseTx?.sourceId).toBe('src-bank-1');

      expect(incomeTx).toBeDefined();
      expect(incomeTx?.amount).toBe(60);
      expect(incomeTx?.sourceId).toBe('src-cash-1'); // automated income in cash account
      expect(incomeTx?.concept).toContain('Retirada cajero CaixaBank');
    });

    it('should only record the expense if the user has no cash account configured', () => {
      useFinanceStore.setState({
        sources: [
          {
            id: 'src-bank-only',
            name: 'Cuenta Única',
            type: 'bank',
            orderIndex: 0,
            createdAt: '2026-09-01T00:00:00.000Z',
          },
        ],
        transactions: [],
      });

      useFinanceStore.getState().addTransaction({
        amount: 40,
        pillar: 'expense',
        categoryId: 'cat-atm',
        sourceId: 'src-bank-only',
        concept: 'Cajero Santander',
        date: '2026-09-29T10:00:00.000Z',
      });

      const txs = useFinanceStore.getState().transactions;
      expect(txs).toHaveLength(1);
      expect(txs[0].pillar).toBe('expense');
      expect(txs[0].amount).toBe(40);
    });
  });

  describe('Investment Accumulation, Weighted Average Buy Price & Movement Deletion', () => {
    it('should accumulate shares and calculate weighted average buy price (PMC) when adding to an existing fund', () => {
      const store = useFinanceStore.getState();
      useFinanceStore.setState({
        assets: [],
        transactions: [],
      });

      // 1. Initial purchase: 10 shares @ 40 € = 400 €
      store.addAsset({
        name: 'Vanguard European Stock',
        identifier: 'IE0007987690',
        isin: 'IE0007987690',
        assetType: 'index_fund',
        shares: 10,
        averageBuyPrice: 40,
        currentPrice: 42,
        currency: 'EUR',
      });

      let assets = useFinanceStore.getState().assets;
      expect(assets).toHaveLength(1);
      expect(assets[0].shares).toBe(10);
      expect(assets[0].averageBuyPrice).toBe(40);
      expect(assets[0].currentValue).toBe(420); // 10 * 42

      // 2. Second purchase into same fund: 10 shares @ 60 € = 600 €
      store.addAsset({
        name: 'Vanguard European Stock',
        identifier: 'IE0007987690',
        isin: 'IE0007987690',
        assetType: 'index_fund',
        shares: 10,
        averageBuyPrice: 60,
        currentPrice: 45,
        currency: 'EUR',
      });

      assets = useFinanceStore.getState().assets;
      // MUST NOT REPLACE OR DUPLICATE: Must maintain 1 single consolidated asset
      expect(assets).toHaveLength(1);
      // Combined shares: 10 + 10 = 20
      expect(assets[0].shares).toBe(20);
      // Weighted average buy price: (10 * 40 + 10 * 60) / 20 = 1000 / 20 = 50 €
      expect(assets[0].averageBuyPrice).toBe(50);
      // Latest market value: 20 * 45 = 900 €
      expect(assets[0].currentValue).toBe(900);
      // PnL: 900 - 1000 = -100 €
      expect(assets[0].pnl).toBe(-100);
      // PnL %: (-100 / 1000) * 100 = -10%
      expect(assets[0].pnlPercentage).toBe(-10);
      expect(assets[0].lastUpdated).toBe('Posición acumulada');
    });

    it('should deduct shares and invested amount from the asset when an invest transaction is deleted', () => {
      const store = useFinanceStore.getState();
      useFinanceStore.setState({
        assets: [
          {
            id: 'asset-fund-1',
            name: 'Vanguard European Stock',
            identifier: 'IE0007987690',
            isin: 'IE0007987690',
            assetType: 'index_fund',
            shares: 20,
            averageBuyPrice: 50,
            currentPrice: 50,
            currentValue: 1000,
            pnl: 0,
            pnlPercentage: 0,
            currency: 'EUR',
            lastUpdated: 'Recién añadido',
          },
        ],
        transactions: [
          {
            id: 'tx-invest-1',
            amount: 500,
            pillar: 'invest',
            categoryId: 'cat-etf',
            concept: 'Inversión en Vanguard European Stock (IE0007987690)',
            date: '2026-09-01T12:00:00.000Z',
            createdAt: 1,
          },
          {
            id: 'tx-invest-2',
            amount: 500,
            pillar: 'invest',
            categoryId: 'cat-etf',
            concept: 'Inversión en Vanguard European Stock (IE0007987690)',
            date: '2026-09-15T12:00:00.000Z',
            createdAt: 2,
          },
        ],
      });

      // Delete tx-invest-2 (500 € = 10 shares @ 50 €)
      store.deleteTransaction('tx-invest-2');

      const txs = useFinanceStore.getState().transactions;
      expect(txs).toHaveLength(1);
      expect(txs[0].id).toBe('tx-invest-1');

      const assets = useFinanceStore.getState().assets;
      expect(assets).toHaveLength(1);
      // Shares should be deducted from 20 to 10
      expect(assets[0].shares).toBe(10);
      expect(assets[0].currentValue).toBe(500); // 10 * 50
    });

    it('should completely remove the fund when its only investment transaction is deleted', () => {
      const store = useFinanceStore.getState();
      useFinanceStore.setState({
        assets: [
          {
            id: 'asset-sp500',
            name: 'S&P 500',
            identifier: 'IE0032126645',
            isin: 'IE0032126645',
            assetType: 'index_fund',
            shares: 5,
            averageBuyPrice: 80,
            currentPrice: 80,
            currentValue: 400,
            pnl: 0,
            pnlPercentage: 0,
            currency: 'EUR',
            lastUpdated: 'Recién añadido',
          },
        ],
        transactions: [
          {
            id: 'tx-sp500-only',
            amount: 400,
            pillar: 'invest',
            categoryId: 'cat-etf',
            concept: 'Inversión en S&P 500 (IE0032126645)',
            date: '2026-09-20T12:00:00.000Z',
            createdAt: 10,
          },
        ],
      });

      // Delete the only transaction for S&P 500
      store.deleteTransaction('tx-sp500-only');

      const txs = useFinanceStore.getState().transactions;
      expect(txs).toHaveLength(0);

      const assets = useFinanceStore.getState().assets;
      // Asset must be completely removed from portfolio
      expect(assets).toHaveLength(0);
    });

    it('should correctly parse concept with embedded ISIN without parentheses', () => {
      const parsed = parseInvestmentConcept('Inversión en SP500 IE0007987690');
      expect(parsed.identifier).toBe('IE0007987690');
      expect(parsed.name).toBe('SP500');
    });
  });
});
