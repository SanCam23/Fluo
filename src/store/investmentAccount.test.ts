import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from './useFinanceStore';
import {
  isInvestmentSource,
  computeInvestmentAccountSummary,
  getAssetsForSource,
  computeBrokerAssetAllocation,
  computeBrokerMonthlyFlows,
  computeBrokerHoldingsRanking,
} from '../utils/finance';
import type { SourceAccount, Transaction, InvestmentAsset } from '../types/finance';

describe('Cuentas de Inversión y Brokers (Estilo MyInvestor, Trade Republic)', () => {
  beforeEach(() => {
    useFinanceStore.setState({
      transactions: [],
      sources: [],
      assets: [],
      recurrences: [],
      userId: null,
      activeSourceId: null,
    });
  });

  const brokerSource: SourceAccount = {
    id: 'source-myinvestor',
    name: 'MyInvestor Cartera',
    type: 'investment',
    institution: 'MyInvestor',
    brandId: 'brand-myinvestor',
    initialBalance: 500, // 500 € en liquidez inicial
    orderIndex: 0,
    color: '#6366f1',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const normalBankSource: SourceAccount = {
    id: 'source-bbva',
    name: 'Cuenta Nómina',
    type: 'bank',
    institution: 'BBVA',
    initialBalance: 2000,
    orderIndex: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const assetVanguard: InvestmentAsset = {
    id: 'asset-vwce',
    name: 'Vanguard FTSE All-World UCITS ETF',
    identifier: 'IE00BK5BQT80',
    isin: 'IE00BK5BQT80',
    assetType: 'etf',
    shares: 10,
    averageBuyPrice: 100, // Coste: 10 * 100 = 1.000 €
    currentPrice: 120, // Valor: 10 * 120 = 1.200 € (P&L: +200 €, +20%)
    currency: 'EUR',
    platform: 'MyInvestor',
    sourceId: 'source-myinvestor',
    lastUpdated: 'En vivo',
  };

  describe('Detección y tipado de cuentas broker', () => {
    it('reconoce correctamente una cuenta con type === "investment"', () => {
      expect(isInvestmentSource(brokerSource)).toBe(true);
    });

    it('no marca una cuenta bancaria ordinaria como cuenta broker', () => {
      expect(isInvestmentSource(normalBankSource)).toBe(false);
    });

    it('reconoce entidades de inversión por nombre o institución (Trade Republic, DEGIRO, Scalable)', () => {
      const tradeRep: SourceAccount = {
        id: 'source-tr',
        name: 'Trade Republic',
        type: 'bank', // creado como bank antes de la tipificación
        institution: 'Trade Republic',
        orderIndex: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      expect(isInvestmentSource(tradeRep)).toBe(true);

      const degiro: SourceAccount = {
        id: 'source-degiro',
        name: 'DEGIRO Acciones',
        type: 'bank',
        institution: 'DEGIRO',
        orderIndex: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      expect(isInvestmentSource(degiro)).toBe(true);
    });
  });

  describe('Cálculo de métricas financieras de la cuenta broker', () => {
    it('calcula con precisión el efectivo líquido, lo invertido, el valor actual y el rendimiento', () => {
      const txs: Transaction[] = [
        // 1. Traspaso recibido desde BBVA: +1.500 € de liquidez
        {
          id: 'tx-transfer-in',
          amount: 1500,
          pillar: 'income',
          categoryId: 'cat-transfer-income',
          sourceId: 'source-myinvestor',
          concept: 'Traspaso recibido desde Cuenta Nómina BBVA',
          date: '2026-02-01T10:00:00.000Z',
          createdAt: 1,
        },
        // 2. Compra de 10 títulos de Vanguard: desembolso de 1.000 €
        {
          id: 'tx-buy-vwce',
          amount: 1000,
          shares: 10,
          unitPrice: 100,
          pillar: 'invest',
          categoryId: 'cat-etf',
          sourceId: 'source-myinvestor',
          concept: 'Inversión en Vanguard FTSE All-World (IE00BK5BQT80)',
          date: '2026-02-05T12:00:00.000Z',
          createdAt: 2,
        },
      ];

      const summary = computeInvestmentAccountSummary(brokerSource, txs, [assetVanguard]);

      // Efectivo líquido no invertido: Initial (500) + Income (1500) - Invest (1000) = 1.000 €
      expect(summary.cashBalance).toBe(1000);

      // Capital invertido: 1.000 €
      expect(summary.investedCapital).toBe(1000);

      // Valor de mercado de la cartera: 10 títulos * 120 € = 1.200 €
      expect(summary.portfolioMarketValue).toBe(1200);

      // Cuánto está dando (P&L): 1.200 € - 1.000 € = +200 €
      expect(summary.unrealizedPnL).toBe(200);
      expect(summary.unrealizedPnLPercentage).toBe(20);
      expect(summary.isProfit).toBe(true);

      // Patrimonio total en cuenta: Efectivo (1.000 €) + Cartera (1.200 €) = 2.200 €
      expect(summary.totalAccountValue).toBe(2200);

      // Cantidad de activos en cartera
      expect(summary.assetsCount).toBe(1);
    });

    it('asocia correctamente las entradas y aportaciones individuales al índice en esta cuenta', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-buy-1',
          amount: 600,
          shares: 6,
          unitPrice: 100,
          pillar: 'invest',
          categoryId: 'cat-etf',
          sourceId: 'source-myinvestor',
          concept: 'Inversión en Vanguard FTSE All-World (IE00BK5BQT80)',
          date: '2026-01-10T12:00:00.000Z',
          createdAt: 1,
        },
        {
          id: 'tx-buy-2',
          amount: 400,
          shares: 4,
          unitPrice: 100,
          pillar: 'invest',
          categoryId: 'cat-etf',
          sourceId: 'source-myinvestor',
          concept: 'Segunda aportación Vanguard FTSE All-World (IE00BK5BQT80)',
          date: '2026-02-10T12:00:00.000Z',
          createdAt: 2,
        },
      ];

      const holdings = getAssetsForSource(brokerSource, txs, [assetVanguard]);
      expect(holdings).toHaveLength(1);

      const holding = holdings[0];
      expect(holding.asset.id).toBe('asset-vwce');
      expect(holding.shares).toBe(10);
      expect(holding.investedCost).toBe(1000);
      expect(holding.currentValue).toBe(1200);
      expect(holding.pnl).toBe(200);

      // Ambas entradas de aportación deben verse reflejadas en el historial de la posición
      expect(holding.contributions).toHaveLength(2);
      expect(holding.contributions[0].id).toBe('tx-buy-2'); // orden cronológico descendente
      expect(holding.contributions[1].id).toBe('tx-buy-1');
    });

    it('ignora inversiones realizadas con fondos de otras cuentas o fondos externos', () => {
      const assetOther: InvestmentAsset = {
        id: 'asset-apple',
        name: 'Apple Inc.',
        identifier: 'AAPL',
        assetType: 'stock',
        shares: 5,
        averageBuyPrice: 200,
        currentPrice: 220,
        currency: 'USD',
        platform: 'Revolut',
        sourceId: 'source-bbva', // Vinculado a BBVA, no a MyInvestor
        lastUpdated: 'En vivo',
      };

      const holdings = getAssetsForSource(brokerSource, [], [assetOther]);
      expect(holdings).toHaveLength(0);
    });
  });
  describe('Apartado de Estadísticas Adaptado para Cuentas Broker & Inversión', () => {
    const assetStock: InvestmentAsset = {
      id: 'asset-aapl',
      name: 'Apple Inc.',
      identifier: 'AAPL',
      assetType: 'stock',
      shares: 5,
      averageBuyPrice: 150, // Coste: 750 €
      currentPrice: 180, // Valor: 900 €
      currency: 'USD',
      platform: 'MyInvestor',
      sourceId: 'source-myinvestor',
      lastUpdated: 'En vivo',
    };

    const multiAssetSummary = computeInvestmentAccountSummary(
      brokerSource,
      [
        {
          id: 'tx-1',
          amount: 2000,
          pillar: 'income',
          categoryId: 'cat-transfer-income',
          sourceId: 'source-myinvestor',
          concept: 'Traspaso recibido',
          date: '2026-03-01T10:00:00.000Z',
          createdAt: 1,
        },
        {
          id: 'tx-2',
          amount: 1000,
          pillar: 'invest',
          categoryId: 'cat-etf',
          sourceId: 'source-myinvestor',
          concept: 'Compra Vanguard ETF',
          date: '2026-03-02T10:00:00.000Z',
          createdAt: 2,
        },
        {
          id: 'tx-3',
          amount: 750,
          pillar: 'invest',
          categoryId: 'cat-stock',
          sourceId: 'source-myinvestor',
          concept: 'Compra Apple',
          date: '2026-03-03T10:00:00.000Z',
          createdAt: 3,
        },
      ],
      [assetVanguard, assetStock]
    );

    it('calcula la distribución por clase de activo (Asset Allocation) y liquidez', () => {
      const allocation = computeBrokerAssetAllocation(multiAssetSummary);

      // Debe incluir ETFs, Acciones y Efectivo / Liquidez
      expect(allocation.length).toBeGreaterThanOrEqual(3);

      const etfItem = allocation.find((a) => a.id === 'etf');
      expect(etfItem).toBeDefined();
      expect(etfItem?.name).toBe('ETFs');
      expect(etfItem?.value).toBe(1200);

      const stockItem = allocation.find((a) => a.id === 'stock');
      expect(stockItem).toBeDefined();
      expect(stockItem?.name).toBe('Acciones');
      expect(stockItem?.value).toBe(900);

      const cashItem = allocation.find((a) => a.id === 'cash');
      expect(cashItem).toBeDefined();
      expect(cashItem?.name).toBe('Efectivo / Liquidez');
      // Initial(500) + Income(2000) - Invest(1750) = 750 €
      expect(cashItem?.value).toBe(750);

      // La suma de porcentajes debe ser cercana al 100%
      const totalPct = allocation.reduce((acc, curr) => acc + curr.percentage, 0);
      expect(totalPct).toBeGreaterThanOrEqual(99.5);
      expect(totalPct).toBeLessThanOrEqual(100.5);
    });

    it('calcula el ranking de posiciones ordenadas por valor y calcula el peso en cartera', () => {
      const ranking = computeBrokerHoldingsRanking(multiAssetSummary);

      expect(ranking).toHaveLength(2);
      // Vanguard (1.200 €) debe ser el puesto 1, Apple (900 €) el puesto 2
      expect(ranking[0].rank).toBe(1);
      expect(ranking[0].asset.identifier).toBe('IE00BK5BQT80');
      expect(ranking[0].currentValue).toBe(1200);
      expect(ranking[0].weightPercentage).toBeGreaterThan(40);

      expect(ranking[1].rank).toBe(2);
      expect(ranking[1].asset.identifier).toBe('AAPL');
      expect(ranking[1].currentValue).toBe(900);
      expect(ranking[1].weightPercentage).toBeGreaterThan(30);
    });

    it('calcula el flujo mensual de depósitos, compras e importes retirados', () => {
      const txs: Transaction[] = [
        {
          id: 'tx-inflow-1',
          amount: 1500,
          pillar: 'income',
          categoryId: 'cat-transfer-income',
          sourceId: 'source-myinvestor',
          concept: 'Depósito traspaso',
          date: '2026-03-01T10:00:00.000Z',
          createdAt: 1,
        },
        {
          id: 'tx-invest-1',
          amount: 1000,
          pillar: 'invest',
          categoryId: 'cat-etf',
          sourceId: 'source-myinvestor',
          concept: 'Inversión mensual',
          date: '2026-03-05T10:00:00.000Z',
          createdAt: 2,
        },
        {
          id: 'tx-withdraw-1',
          amount: 200,
          pillar: 'expense',
          categoryId: 'cat-dividends',
          sourceId: 'source-myinvestor',
          concept: 'Retirada a banco',
          date: '2026-03-10T10:00:00.000Z',
          createdAt: 3,
        },
      ];

      const refDate = new Date('2026-03-15T00:00:00.000Z');
      const monthlyFlows = computeBrokerMonthlyFlows('source-myinvestor', txs, 5, refDate);

      expect(monthlyFlows).toHaveLength(5);
      const currentMonth = monthlyFlows[monthlyFlows.length - 1];
      expect(currentMonth.inflow).toBe(1500);
      expect(currentMonth.invested).toBe(1000);
      expect(currentMonth.withdrawn).toBe(200);
      expect(currentMonth.netFlow).toBe(1300); // 1500 - 200
    });
  });

});

