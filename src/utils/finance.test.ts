import { describe, it, expect } from 'vitest';
import {
  computeSavingsMetrics,
  generateSavingsEvolution,
  computeSourceBalance,
  computeFinancialSummary,
  getTransactionsForAsset,
  computeAssetProgressionSeries,
  getAssetProgressionColor,
  isInvestmentSource,
} from './finance';
import type { Transaction, SourceAccount, InvestmentAsset } from '../types/finance';

describe('Cálculos de Ahorro Neto e Importe Ahorrado (computeSavingsMetrics)', () => {
  it('calcula con exactitud el importe neto ahorrado en periodos con superávit (ahorro positivo)', () => {
    const income = 3500;
    const expense = 2100;
    const daysInPeriod = 30;
    const fixedDate = new Date(2026, 8, 15); // Septiembre 2026 (30 días en el mes)

    const metrics = computeSavingsMetrics(income, expense, daysInPeriod, fixedDate);

    // Superávit neto: 3500 - 2100 = 1400 €
    expect(metrics.netSavings).toBe(1400);
    expect(metrics.isPositive).toBe(true);

    // Tasa de ahorro: (1400 / 3500) * 100 = 40%
    expect(metrics.savingsRate).toBe(40);

    // Ritmo medio diario: 1400 / 30 = 46.666... €/día
    expect(metrics.dailyAverageSavings).toBeCloseTo(46.67, 1);

    // Proyección de cierre de mes: 46.666... * 30 días = 1400 €
    expect(metrics.projectedMonthEndSavings).toBeCloseTo(1400, 1);
  });

  it('calcula con exactitud el importe neto ahorrado en periodos con déficit (ahorro negativo)', () => {
    const income = 1200;
    const expense = 1800;
    const daysInPeriod = 15;
    const fixedDate = new Date(2026, 8, 15); // 15 de Septiembre

    const metrics = computeSavingsMetrics(income, expense, daysInPeriod, fixedDate);

    // Déficit neto: 1200 - 1800 = -600 €
    expect(metrics.netSavings).toBe(-600);
    expect(metrics.isPositive).toBe(false);

    // Tasa de ahorro negativa: (-600 / 1200) * 100 = -50%
    expect(metrics.savingsRate).toBe(-50);

    // Ritmo medio diario: -600 / 15 = -40 €/día
    expect(metrics.dailyAverageSavings).toBe(-40);

    // Proyección fin de mes (30 días de septiembre * -40 €/d): -1200 €
    expect(metrics.projectedMonthEndSavings).toBe(-1200);
  });

  it('comportamiento cuando no hay ingresos registrados en el mes (ahorro negativo igual al total de gastos)', () => {
    const income = 0;
    const expense = 780.50;
    const daysInPeriod = 20;
    const fixedDate = new Date(2026, 8, 20);

    const metrics = computeSavingsMetrics(income, expense, daysInPeriod, fixedDate);

    // El ahorro neto debe ser estrictamente el opuesto exacto del gasto
    expect(metrics.netSavings).toBe(-780.50);
    expect(metrics.isPositive).toBe(false);

    // Tasa de ahorro relativa al ingreso ausente: -100% (déficit absoluto)
    expect(metrics.savingsRate).toBe(-100);

    // Ritmo diario: -780.50 / 20 = -39.025 €/día
    expect(metrics.dailyAverageSavings).toBeCloseTo(-39.025, 2);
  });

  it('comportamiento cuando tanto ingresos como gastos son 0 € (balance neutro)', () => {
    const metrics = computeSavingsMetrics(0, 0, 10);

    expect(metrics.netSavings).toBe(0);
    expect(metrics.isPositive).toBe(true);
    expect(metrics.savingsRate).toBe(0);
    expect(metrics.dailyAverageSavings).toBe(0);
    expect(metrics.projectedMonthEndSavings).toBe(0);
  });

  it('resistencia a valores no numéricos o NaN', () => {
    const metrics = computeSavingsMetrics(NaN as any, undefined as any, 0);

    expect(metrics.netSavings).toBe(0);
    expect(metrics.isPositive).toBe(true);
    expect(metrics.savingsRate).toBe(0);
    expect(metrics.dailyAverageSavings).toBe(0);
  });
});

describe('Generación de Series Temporales de Ahorro (generateSavingsEvolution)', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      amount: 2000,
      pillar: 'income',
      categoryId: 'cat-salary',
      concept: 'Nómina',
      date: '2026-09-01T10:00:00.000Z',
      createdAt: 1,
    },
    {
      id: 'tx-2',
      amount: 150,
      pillar: 'expense',
      categoryId: 'cat-food',
      concept: 'Supermercado',
      date: '2026-09-03T12:00:00.000Z',
      createdAt: 2,
    },
    {
      id: 'tx-3',
      amount: 450,
      pillar: 'expense',
      categoryId: 'cat-housing',
      concept: 'Alquiler',
      date: '2026-09-05T09:00:00.000Z',
      createdAt: 3,
    },
  ];

  it('genera puntos diarios acumulados para "this_month"', () => {
    // Referencia fija: 5 de Septiembre de 2026
    const refDate = new Date(2026, 8, 5, 12, 0, 0);

    const points = generateSavingsEvolution(mockTransactions, 'this_month', refDate);

    // Debe generar 5 puntos (día 1 al día 5)
    expect(points).toHaveLength(5);

    // Día 1: Ingreso 2000, Gasto 0 -> Neto: 2000, Acumulado: 2000
    expect(points[0].income).toBe(2000);
    expect(points[0].expense).toBe(0);
    expect(points[0].netSavings).toBe(2000);
    expect(points[0].accumulatedSavings).toBe(2000);

    // Día 2: Sin movimientos -> Neto: 0, Acumulado: 2000
    expect(points[1].income).toBe(0);
    expect(points[1].expense).toBe(0);
    expect(points[1].netSavings).toBe(0);
    expect(points[1].accumulatedSavings).toBe(2000);

    // Día 3: Gasto 150 -> Neto: -150, Acumulado: 1850
    expect(points[2].income).toBe(0);
    expect(points[2].expense).toBe(150);
    expect(points[2].netSavings).toBe(-150);
    expect(points[2].accumulatedSavings).toBe(1850);

    // Día 4: Sin movimientos -> Neto: 0, Acumulado: 1850
    expect(points[3].accumulatedSavings).toBe(1850);

    // Día 5: Gasto 450 -> Neto: -450, Acumulado: 1400
    expect(points[4].expense).toBe(450);
    expect(points[4].netSavings).toBe(-450);
    expect(points[4].accumulatedSavings).toBe(1400);
  });

  it('genera puntos diarios acumulados para un mes específico YYYY-MM', () => {
    const augustTransactions: Transaction[] = [
      {
        id: 'tx-aug-1',
        amount: 1500,
        pillar: 'income',
        categoryId: 'cat-salary',
        concept: 'Nómina Agosto',
        date: '2026-08-01T10:00:00.000Z',
        createdAt: 1,
      },
      {
        id: 'tx-aug-2',
        amount: 200,
        pillar: 'expense',
        categoryId: 'cat-travel',
        concept: 'Viaje Agosto',
        date: '2026-08-10T12:00:00.000Z',
        createdAt: 2,
      },
    ];

    const refDate = new Date(2026, 8, 20); // Septiembre 2026
    const points = generateSavingsEvolution(augustTransactions, '2026-08', refDate);

    // Agosto tiene 31 días
    expect(points).toHaveLength(31);
    expect(points[0].income).toBe(1500);
    expect(points[0].accumulatedSavings).toBe(1500);
    // Día 10 (index 9)
    expect(points[9].expense).toBe(200);
    expect(points[9].accumulatedSavings).toBe(1300);
    // Día 31
    expect(points[30].accumulatedSavings).toBe(1300);
  });
});

describe('Utilidades base de balance (computeSourceBalance & computeFinancialSummary)', () => {
  const source: SourceAccount = {
    id: 'src-1',
    name: 'Cuenta Principal',
    type: 'bank',
    initialBalance: 1000,
    orderIndex: 0,
    createdAt: '2026-01-01',
  };

  const txs: Transaction[] = [
    {
      id: '1',
      amount: 500,
      pillar: 'income',
      categoryId: 'salary',
      sourceId: 'src-1',
      concept: 'Ingreso',
      date: '2026-01-02',
      createdAt: 1,
    },
    {
      id: '2',
      amount: 200,
      pillar: 'expense',
      categoryId: 'groceries',
      sourceId: 'src-1',
      concept: 'Gasto',
      date: '2026-01-03',
      createdAt: 2,
    },
  ];

  it('calcula correctamente el balance por fuente', () => {
    const res = computeSourceBalance(source, txs);
    expect(res.initialBalance).toBe(1000);
    expect(res.income).toBe(500);
    expect(res.expense).toBe(200);
    expect(res.netBalance).toBe(1300);
  });

  it('calcula el resumen financiero global con inversiones', () => {
    const assets: InvestmentAsset[] = [
      {
        id: 'asset-1',
        name: 'ETF',
        identifier: 'VUSA',
        assetType: 'etf',
        shares: 10,
        averageBuyPrice: 50,
        currentPrice: 60,
        currency: 'EUR',
        lastUpdated: 'Hoy',
      },
    ];

    const summary = computeFinancialSummary(txs, assets, [source]);
    expect(summary.totalIncome).toBe(500);
    expect(summary.totalExpense).toBe(200);
    expect(summary.portfolioMarketValue).toBe(600); // 10 * 60
    expect(summary.netBalance).toBe(1300 + 600); // 1900
    expect(summary.unrealizedPnL).toBe(100); // 600 - 500
  });

  it('no descuenta del saldo en efectivo si la inversión se realizó con fondos externos (sin sourceId)', () => {
    const assets: InvestmentAsset[] = [
      {
        id: 'asset-sp500',
        name: 'Vanguard S&P 500',
        identifier: 'IE0032126645',
        assetType: 'index_fund',
        shares: 2,
        averageBuyPrice: 100,
        currentPrice: 110,
        currency: 'EUR',
        lastUpdated: 'Reciente',
      },
    ];

    // Transacción de inversión con fondos externos (sourceId: undefined)
    const externalInvestTx: Transaction = {
      id: 'tx-inv-ext',
      amount: 200,
      pillar: 'invest',
      categoryId: 'cat-etf',
      concept: 'Inversión en Vanguard S&P 500 (IE0032126645)',
      date: '2026-01-04',
      createdAt: 3,
    };

    const summary = computeFinancialSummary([...txs, externalInvestTx], assets, [source]);
    // Saldo en efectivo: 1000 + 500 - 200 = 1300 € (NO se restan los 200 € porque no tiene sourceId)
    expect(summary.netCashBalance).toBe(1300);
    expect(summary.portfolioMarketValue).toBe(220); // 2 * 110
    expect(summary.netBalance).toBe(1300 + 220); // 1520 €
  });

  it('descuenta del saldo en efectivo cuando la inversión sí tiene una cuenta vinculada (sourceId)', () => {
    const assets: InvestmentAsset[] = [
      {
        id: 'asset-sp500',
        name: 'Vanguard S&P 500',
        identifier: 'IE0032126645',
        assetType: 'index_fund',
        shares: 2,
        averageBuyPrice: 100,
        currentPrice: 110,
        currency: 'EUR',
        lastUpdated: 'Reciente',
      },
    ];

    const linkedInvestTx: Transaction = {
      id: 'tx-inv-linked',
      amount: 200,
      pillar: 'invest',
      categoryId: 'cat-etf',
      sourceId: 'src-1',
      concept: 'Inversión en Vanguard S&P 500 (IE0032126645)',
      date: '2026-01-04',
      createdAt: 3,
    };

    const summary = computeFinancialSummary([...txs, linkedInvestTx], assets, [source]);
    // Saldo en efectivo: 1000 + 500 - 200 - 200 = 1100 € (sí se descuenta)
    expect(summary.netCashBalance).toBe(1100);
  });
});

describe('Historial de Aportaciones por Activo (getTransactionsForAsset)', () => {
  const asset: InvestmentAsset = {
    id: 'asset-sp500',
    name: 'Vanguard S&P 500',
    identifier: 'IE0032126645',
    isin: 'IE0032126645',
    ticker: 'VUSA',
    assetType: 'index_fund',
    shares: 4,
    averageBuyPrice: 80,
    currentPrice: 85,
    currency: 'EUR',
    lastUpdated: 'Reciente',
  };

  const allTransactions: Transaction[] = [
    {
      id: 'tx-1',
      amount: 160,
      pillar: 'invest',
      categoryId: 'cat-etf',
      concept: 'Inversión en Vanguard S&P 500 (IE0032126645)',
      date: '2026-01-10',
      createdAt: 1,
    },
    {
      id: 'tx-2',
      amount: 50,
      pillar: 'expense',
      categoryId: 'cat-food',
      concept: 'Supermercado Mercadona',
      date: '2026-01-12',
      createdAt: 2,
    },
    {
      id: 'tx-3',
      amount: 160,
      pillar: 'invest',
      categoryId: 'cat-etf',
      concept: 'Aportación periódica Vanguard S&P 500',
      date: '2026-02-10',
      createdAt: 3,
    },
    {
      id: 'tx-4',
      amount: 50,
      pillar: 'income',
      categoryId: 'cat-dividends',
      concept: 'Retirada de Vanguard S&P 500 (IE0032126645)',
      date: '2026-02-15',
      createdAt: 4,
    },
  ];

  it('recupera todas las aportaciones y retiradas vinculadas al índice ordenadas cronológicamente', () => {
    const result = getTransactionsForAsset(asset, allTransactions);

    // Debe incluir tx-1, tx-3 y tx-4 (3 transacciones del índice), excluyendo tx-2 (Mercadona)
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('tx-4'); // 15 Feb (más reciente)
    expect(result[1].id).toBe('tx-3'); // 10 Feb
    expect(result[2].id).toBe('tx-1'); // 10 Ene
  });
});

describe('Progresión por Activo y Líneas de Inversión (computeAssetProgressionSeries)', () => {
  const sampleAssets: InvestmentAsset[] = [
    {
      id: 'asset-sp500',
      name: 'Vanguard S&P 500 ETF',
      identifier: 'IE0032126645',
      isin: 'IE0032126645',
      assetType: 'etf',
      shares: 10,
      averageBuyPrice: 80,
      currentPrice: 84.74,
      currency: 'EUR',
      lastUpdated: '2026-10-31',
      platform: 'MyInvestor',
    },
    {
      id: 'asset-btc',
      name: 'Bitcoin',
      identifier: 'BTC',
      ticker: 'BTC',
      assetType: 'crypto',
      shares: 0.05,
      averageBuyPrice: 60000,
      currentPrice: 68000,
      currency: 'EUR',
      lastUpdated: '2026-10-31',
      platform: 'Binance',
    },
  ];

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-inv-1',
      amount: 400,
      pillar: 'invest',
      categoryId: 'cat-invest',
      concept: 'Compra Vanguard S&P 500 ETF',
      shares: 5,
      unitPrice: 80,
      date: '2026-08-10T10:00:00.000Z',
      createdAt: 1,
    },
    {
      id: 'tx-inv-2',
      amount: 400,
      pillar: 'invest',
      categoryId: 'cat-invest',
      concept: 'Aportación Vanguard S&P 500 ETF',
      shares: 5,
      unitPrice: 80,
      date: '2026-09-15T10:00:00.000Z',
      createdAt: 2,
    },
    {
      id: 'tx-inv-3',
      amount: 3000,
      pillar: 'invest',
      categoryId: 'cat-invest',
      concept: 'Compra Bitcoin',
      shares: 0.05,
      unitPrice: 60000,
      date: '2026-07-20T10:00:00.000Z',
      createdAt: 3,
    },
  ];

  const fixedRefDate = new Date(2026, 9, 31); // 31 Oct 2026

  it('devuelve series y metadatos vacíos si no hay activos', () => {
    const res = computeAssetProgressionSeries([], []);
    expect(res.series).toEqual([]);
    expect(res.assetsMeta).toEqual([]);
  });

  it('genera metadatos de activos con valoración actual y rentabilidad precisa', () => {
    const res = computeAssetProgressionSeries(sampleAssets, sampleTransactions, 6, fixedRefDate);

    expect(res.assetsMeta.length).toBe(2);

    const sp500Meta = res.assetsMeta.find((m) => m.id === 'asset-sp500')!;
    expect(sp500Meta.currentValue).toBe(847.40); // 10 * 84.74
    expect(sp500Meta.investedCost).toBe(800.00); // 10 * 80
    expect(sp500Meta.unrealizedPnL).toBe(47.40);
    expect(sp500Meta.unrealizedPnLPercentage).toBeCloseTo(5.93, 1);
    expect(sp500Meta.color).toBe('#6366F1'); // Indigo

    const btcMeta = res.assetsMeta.find((m) => m.id === 'asset-btc')!;
    expect(btcMeta.currentValue).toBe(3400.00); // 0.05 * 68000
    expect(btcMeta.investedCost).toBe(3000.00); // 0.05 * 60000
    expect(btcMeta.unrealizedPnL).toBe(400.00);
    expect(btcMeta.color).toBe('#F59E0B'); // Bitcoin Gold
  });

  it('genera cubos cronológicos mensuales con el valor exacto actual en el mes en curso', () => {
    const res = computeAssetProgressionSeries(sampleAssets, sampleTransactions, 6, fixedRefDate);

    // 6 meses
    expect(res.series.length).toBe(6);

    const latestPoint = res.series[res.series.length - 1];
    expect(latestPoint.date).toBe('2026-10');
    expect(latestPoint.asset_asset_sp500).toBe(847.40);
    expect(latestPoint.asset_asset_btc).toBe(3400.00);
    expect(latestPoint.totalValue).toBeCloseTo(847.40 + 3400.00, 2);
    expect(latestPoint.totalCost).toBeCloseTo(800.00 + 3000.00, 2);
  });

  it('asigna colores icónicos y consistentes a activos clave como Bitcoin y ETFs', () => {
    expect(getAssetProgressionColor(sampleAssets[1], 1)).toBe('#F59E0B');
  });
});

describe('Identificación de Cuentas de Inversión y Exclusión de Efectivo (isInvestmentSource)', () => {
  it('identifica correctamente cuentas de broker o inversión', () => {
    const brokerSource: SourceAccount = {
      id: 'src-myinv',
      name: 'MyInvestor Cartera',
      type: 'investment',
      institution: 'MyInvestor',
      orderIndex: 0,
      createdAt: '2026-01-01',
    };
    expect(isInvestmentSource(brokerSource)).toBe(true);
  });

  it('excluye estrictamente las cuentas de efectivo para no mezclar inversiones', () => {
    const cashSource: SourceAccount = {
      id: 'src-cash',
      name: 'Billetera Efectivo',
      type: 'cash',
      institution: 'Efectivo',
      orderIndex: 1,
      createdAt: '2026-01-01',
    };
    expect(isInvestmentSource(cashSource)).toBe(false);

    // Incluso si un usuario nombra su efectivo con la palabra "inversión"
    const trickyCashSource: SourceAccount = {
      id: 'src-cash-2',
      name: 'Efectivo para inversión',
      type: 'cash',
      institution: 'Efectivo',
      orderIndex: 2,
      createdAt: '2026-01-01',
    };
    expect(isInvestmentSource(trickyCashSource)).toBe(false);
  });

  it('retorna false para cuentas bancarias corrientes estándar', () => {
    const bankSource: SourceAccount = {
      id: 'src-bbva',
      name: 'Nómina BBVA',
      type: 'bank',
      institution: 'BBVA',
      orderIndex: 0,
      createdAt: '2026-01-01',
    };
    expect(isInvestmentSource(bankSource)).toBe(false);
  });
});
