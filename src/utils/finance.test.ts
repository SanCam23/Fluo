import { describe, it, expect } from 'vitest';
import {
  computeSavingsMetrics,
  generateSavingsEvolution,
  computeSourceBalance,
  computeFinancialSummary,
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
});
