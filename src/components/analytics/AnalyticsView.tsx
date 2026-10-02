import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  PiggyBank,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { TimeRangeFilter } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { SourceAvatar } from '../common/SourceAvatar';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import {
  computeSavingsMetrics,
  generateSavingsEvolution,
  type SavingsEvolutionPoint,
} from '../../utils/finance';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
}

const GlassTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-[#0F1626]/95 light:bg-white/95 border border-white/20 light:border-slate-300/80 p-3 shadow-2xl backdrop-blur-2xl text-xs flex flex-col gap-1.5 z-50">
        {label && <span className="font-bold text-slate-300 light:text-slate-800">{label}</span>}
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-slate-300 light:text-slate-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-white light:text-slate-900">{formatCurrency(entry.value ?? 0)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface SavingsCustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: SavingsEvolutionPoint;
  }>;
  label?: string;
}

const SavingsCustomTooltip: React.FC<SavingsCustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length && payload[0]?.payload) {
    const data = payload[0].payload;
    const isNetPositive = data.netSavings >= 0;
    const isAccPositive = data.accumulatedSavings >= 0;

    return (
      <div className="rounded-2xl bg-[#0F1626]/95 light:bg-white/95 border border-white/20 light:border-slate-300/80 p-3 shadow-2xl backdrop-blur-2xl text-xs flex flex-col gap-2 z-50 min-w-[170px]">
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-1.5">
          <span className="font-bold text-slate-200 light:text-slate-800">{data.label}</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isNetPositive
                ? 'bg-emerald-500/15 text-emerald-400 light:text-emerald-700 light:bg-emerald-50 light:border-emerald-200 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 light:text-rose-700 light:bg-rose-50 light:border-rose-200 border-rose-500/30'
            }`}
          >
            {isNetPositive ? 'Superávit' : 'Déficit'}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Ingresos:</span>
            <span className="font-semibold text-emerald-400 light:text-emerald-700">+{formatCurrency(data.income)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Gastos:</span>
            <span className="font-semibold text-rose-400 light:text-rose-700">-{formatCurrency(data.expense)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 light:border-slate-200 pt-1">
            <span className="text-slate-300 light:text-slate-700 font-medium">Ahorro Neto:</span>
            <span className={`font-bold ${isNetPositive ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'}`}>
              {data.netSavings >= 0 ? '+' : ''}
              {formatCurrency(data.netSavings)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 light:text-slate-600">Acumulado:</span>
            <span className={`font-bold ${isAccPositive ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'}`}>
              {data.accumulatedSavings >= 0 ? '+' : ''}
              {formatCurrency(data.accumulatedSavings)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MONTH_NAMES_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

function formatMonthTitle(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return `${MONTH_NAMES_LONG[m - 1]} ${y}`;
}

function formatMonthPill(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return `${MONTH_NAMES_SHORT[m - 1]} '${String(y).slice(-2)}`;
}

export const AnalyticsView: React.FC = () => {
  const timeRange = useFinanceStore((state) => state.timeRange);
  const setTimeRange = useFinanceStore((state) => state.setTimeRange);
  const transactions = useFinanceStore((state) => state.transactions);
  const assets = useFinanceStore((state) => state.assets);
  const sources = useFinanceStore((state) => state.sources);
  const activeSourceId = useFinanceStore((state) => state.activeSourceId);
  const setActiveSourceId = useFinanceStore((state) => state.setActiveSourceId);
  const getSourceById = useFinanceStore((state) => state.getSourceById);
  const getCategoryById = useFinanceStore((state) => state.getCategoryById);
  const getBrandById = useFinanceStore((state) => state.getBrandById);

  // Filter mode: 'period' (relative timeRange) vs 'month' (specific YYYY-MM)
  const [filterType, setFilterType] = useState<'period' | 'month'>('period');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [activeChartSection, setActiveChartSection] = useState<'savings' | 'categories' | 'comparison' | 'networth'>('savings');
  const [savingsChartMode, setSavingsChartMode] = useState<'accumulated' | 'net'>('accumulated');

  const activeSource = useMemo(
    () => (activeSourceId ? getSourceById(activeSourceId) : null),
    [getSourceById, activeSourceId]
  );

  // Isolate transactions to selected source account or show global if null
  const sourceScopedTransactions = useMemo(() => {
    if (!activeSourceId) return transactions;
    return transactions.filter((tx) => tx.sourceId === activeSourceId);
  }, [transactions, activeSourceId]);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Filter options for Period Mode
  const timeRangeOptions: { range: TimeRangeFilter; label: string }[] = [
    { range: 'this_month', label: 'Este Mes' },
    { range: 'last_month', label: 'Mes Pasado' },
    { range: 'last_3_months', label: 'Últimos 3 Meses' },
    { range: 'last_6_months', label: 'Últimos 6 Meses' },
    { range: 'this_year', label: 'Este Año' },
    { range: 'all', label: 'Todo' },
  ];

  // Aggregated data for active period or selected month (consolidated in a single pass)
  const {
    periodIncome,
    periodExpense,
    expensesByCategory,
    expensesByBrand,
    daysInPeriod,
  } = useMemo(() => {
    const now = new Date();
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    const startOfSelMonth = new Date(selYear, selMonth - 1, 1).getTime();
    const startOfNextMonth = new Date(selYear, selMonth, 1).getTime();

    let minTime = -Infinity;
    let maxTime = Infinity;

    if (filterType === 'month') {
      minTime = startOfSelMonth;
      maxTime = startOfNextMonth;
    } else {
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
        case 'all':
        default:
          break;
      }
    }

    let inc = 0;
    let exp = 0;
    let inv = 0;
    const byCat: Record<string, number> = {};
    const byBrand: Record<string, { total: number; count: number }> = {};

    for (let i = 0; i < sourceScopedTransactions.length; i++) {
      const tx = sourceScopedTransactions[i];
      if (!tx || !tx.date) continue;
      const txTime = new Date(tx.date).getTime();
      if (txTime < minTime || txTime >= maxTime) continue;

      if (tx.pillar === 'income') {
        inc += tx.amount;
      } else if (tx.pillar === 'expense') {
        exp += tx.amount;
        byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;

        if (tx.brandId) {
          let bEntry = byBrand[tx.brandId];
          if (!bEntry) {
            bEntry = { total: 0, count: 0 };
            byBrand[tx.brandId] = bEntry;
          }
          bEntry.total += tx.amount;
          bEntry.count += 1;
        }
      } else if (tx.pillar === 'invest') {
        inv += tx.amount;
      }
    }

    let days = 120;
    if (filterType === 'month') {
      if (selYear === now.getFullYear() && selMonth === now.getMonth() + 1) {
        days = Math.max(1, now.getDate());
      } else {
        days = new Date(selYear, selMonth, 0).getDate();
      }
    } else {
      switch (timeRange) {
        case 'this_month':
          days = Math.max(1, now.getDate());
          break;
        case 'last_month':
          days = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          break;
        case 'last_3_months':
          days = 90;
          break;
        case 'last_6_months':
          days = 180;
          break;
        case 'this_year': {
          const start = new Date(now.getFullYear(), 0, 1);
          days = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000));
          break;
        }
        case 'all':
        default:
          days = 120;
          break;
      }
    }

    return {
      periodIncome: inc,
      periodExpense: exp,
      periodInvest: inv,
      expensesByCategory: byCat,
      expensesByBrand: byBrand,
      daysInPeriod: days,
    };
  }, [sourceScopedTransactions, timeRange, filterType, selectedMonth]);

  // Dedicated Absolute Savings Metrics
  const savingsMetrics = useMemo(
    () => computeSavingsMetrics(periodIncome, periodExpense, daysInPeriod),
    [periodIncome, periodExpense, daysInPeriod]
  );

  // Time-Series Savings Evolution for AreaChart (passes selectedMonth YYYY-MM or timeRange)
  const savingsEvolutionData = useMemo(
    () =>
      generateSavingsEvolution(
        sourceScopedTransactions,
        filterType === 'month' ? selectedMonth : timeRange
      ),
    [sourceScopedTransactions, timeRange, filterType, selectedMonth]
  );

  // KPI 1: Savings rate
  const periodSavingsRate = savingsMetrics.savingsRate;

  // KPI 2: Daily average spend
  const dailyAverageSpend = periodExpense / daysInPeriod;

  // KPI 3: Portfolio ROI / Performance
  const portfolioPerformance = useMemo(() => {
    let totalInvested = 0;
    let portfolioMarketValue = 0;
    assets.forEach((a) => {
      totalInvested += a.shares * a.averageBuyPrice;
      portfolioMarketValue += a.shares * a.currentPrice;
    });
    const roi = totalInvested > 0 ? ((portfolioMarketValue - totalInvested) / totalInvested) * 100 : 0;
    return { totalInvested, portfolioMarketValue, roi };
  }, [assets]);

  // Donut data: Expenses by Category
  const categoryChartData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        const percentage = periodExpense > 0 ? (amount / periodExpense) * 100 : 0;
        return {
          id: catId,
          name: cat?.name || 'Varios',
          value: amount,
          percentage,
          color: cat?.color || '#EF4444',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expensesByCategory, getCategoryById, periodExpense]);

  // Bar Chart data: Monthly comparison (Last 5 months)
  const monthlyComparisonData = useMemo(() => {
    const now = new Date();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const buckets: Record<string, { label: string; income: number; expense: number; savings: number; order: number }> = {};

    // Prepare last 5 months
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = {
        label: `${monthNames[d.getMonth()]}`,
        income: 0,
        expense: 0,
        savings: 0,
        order: d.getTime(),
      };
    }

    sourceScopedTransactions.forEach((tx) => {
      if (!tx || !tx.date) return;
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        if (tx.pillar === 'income') {
          buckets[key].income += tx.amount;
        } else if (tx.pillar === 'expense') {
          buckets[key].expense += tx.amount;
        }
      }
    });

    return Object.values(buckets)
      .sort((a, b) => a.order - b.order)
      .map((b) => ({
        ...b,
        savings: Math.max(0, b.income - b.expense),
      }));
  }, [sourceScopedTransactions]);

  // Area Chart data: Net worth evolution
  const netWorthData = useMemo(() => {
    let balance = activeSource
      ? (typeof activeSource.initialBalance === 'number' ? activeSource.initialBalance : 0)
      : 14200;
    const baseAssetsValue = activeSource ? 0 : portfolioPerformance.portfolioMarketValue;
    const result: Array<{ month: string; netWorth: number }> = [];

    for (const m of monthlyComparisonData) {
      const netMonth = m.income - m.expense;
      balance += netMonth;
      result.push({
        month: m.label,
        netWorth: Math.round(balance + baseAssetsValue),
      });
    }

    return result;
  }, [monthlyComparisonData, portfolioPerformance.portfolioMarketValue, activeSource]);

  // Sorted brands ranking
  const sortedBrands = useMemo(() => {
    return Object.entries(expensesByBrand)
      .map(([brandId, data]) => {
        const brand = getBrandById(brandId);
        const percentage = periodExpense > 0 ? (data.total / periodExpense) * 100 : 0;
        return {
          id: brandId,
          brand,
          name: brand?.name || 'Comercio General',
          total: data.total,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [expensesByBrand, getBrandById, periodExpense]);

  const maxBrandTotal = sortedBrands[0]?.total || 1;

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col gap-6 py-4 pb-20">
        <div className="py-16 px-6 text-center rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-4 shadow-2xl">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-indigo-600/15 to-emerald-500/10 border border-white/15 flex items-center justify-center text-indigo-400 shadow-[0_4px_20px_rgba(99,102,241,0.2)]">
            <BarChart3 className="h-8 w-8 text-indigo-300" />
          </div>
          <div className="flex flex-col gap-2 max-w-sm">
            <h3 className="text-base font-bold text-white tracking-tight">Sin métricas aún</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los gráficos de distribución de gastos, flujo de caja mensual y evolución patrimonial se generarán con los primeros registros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* 0. Account Isolation Selector */}
      {sources.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSourceId(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
              activeSourceId === null
                ? 'bg-white/20 text-white border border-white/30 shadow-md font-bold light:bg-indigo-600 light:text-white light:border-indigo-600 light:shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10 light:bg-white/90 light:text-slate-700 light:border-slate-300/80 hover:light:bg-white'
            }`}
          >
            <Layers className="h-3 w-3 text-indigo-400 light:text-indigo-300" />
            <span>Patrimonio Total (Global)</span>
          </button>

          {sources.map((s) => {
            const isSelected = activeSourceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSourceId(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600/30 text-white border border-indigo-400/40 shadow-md font-bold light:bg-indigo-600 light:text-white light:border-indigo-600 light:shadow-sm'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10 light:bg-white/90 light:text-slate-700 light:border-slate-300/80 hover:light:bg-white'
                }`}
              >
                <SourceAvatar source={s} size="xs" />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Selection Mode (Periodo vs Mes) & Options */}
      <div className="flex items-center gap-2 w-full">
        {/* Toggle Mode Segmented Control */}
        <div className="inline-flex p-0.5 rounded-full bg-white/[0.06] light:bg-slate-200/80 border border-white/10 light:border-slate-300 flex-shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('period')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
              filterType === 'period'
                ? 'bg-white/20 light:bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white light:text-slate-600'
            }`}
          >
            Periodo
          </button>
          <button
            type="button"
            onClick={() => setFilterType('month')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
              filterType === 'month'
                ? 'bg-white/20 light:bg-indigo-600 text-white shadow-sm border border-white/20 light:border-indigo-600 font-extrabold'
                : 'text-slate-400 hover:text-white light:text-slate-600'
            }`}
          >
            <Calendar className="h-3 w-3 text-indigo-400 light:text-indigo-200" />
            <span>Mes</span>
          </button>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-4 w-px bg-white/15 light:bg-slate-300 flex-shrink-0" />

        {/* Inline Options based on filterType */}
        {filterType === 'period' ? (
          <div className="flex items-center gap-1.5 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-0.5 no-scrollbar flex-1 min-w-0 pr-1">
            {timeRangeOptions.map((opt) => {
              const isSelected = timeRange === opt.range;
              return (
                <button
                  key={opt.range}
                  type="button"
                  onClick={() => setTimeRange(opt.range)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/30 shadow-md font-bold light:bg-indigo-600 light:text-white light:border-indigo-600 light:shadow-sm'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10 light:bg-white/90 light:text-slate-700 light:border-slate-300/80 hover:light:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          /* Month Stepper - Expanded across full remaining width with correct margins */
          <div className="flex items-center justify-between px-2 sm:px-3 py-1 rounded-full bg-white/[0.06] light:bg-slate-100 border border-white/10 light:border-slate-300 flex-1 min-w-0 backdrop-blur-md shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 light:text-slate-700 transition-all cursor-pointer active:scale-90 flex-shrink-0"
              title="Mes anterior"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="relative flex items-center justify-center flex-1 min-w-0 px-2 cursor-pointer">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) setSelectedMonth(e.target.value);
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                aria-label="Seleccionar mes"
              />
              <span className="text-xs sm:text-sm font-bold text-indigo-300 light:text-indigo-700 whitespace-nowrap capitalize text-center">
                {formatMonthTitle(selectedMonth)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 light:text-slate-700 transition-all cursor-pointer active:scale-90 flex-shrink-0"
              title="Mes siguiente"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. UNIFIED MASTER SAVINGS & BALANCE HERO CARD (Liquid Glass) */}
      <div className="rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300">
        {/* Specular Top Reflection */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 light:via-white/90 to-transparent" />

        {/* Ambient Halo Glow */}
        <div
          className={`pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl transition-colors duration-500 ${
            savingsMetrics.isPositive ? 'bg-emerald-500/15 light:bg-emerald-500/10' : 'bg-rose-500/15 light:bg-rose-500/10'
          }`}
        />

        {/* Top Header: Account + Status Badges */}
        <div className="flex items-center justify-between relative z-10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div
              className={`h-9 w-9 rounded-2xl flex items-center justify-center border shadow-inner transition-colors flex-shrink-0 ${
                savingsMetrics.isPositive
                  ? 'bg-emerald-500/20 light:bg-emerald-50 border-emerald-500/35 light:border-emerald-200 text-emerald-400 light:text-emerald-700'
                  : 'bg-rose-500/20 light:bg-rose-50 border-rose-500/35 light:border-rose-200 text-rose-400 light:text-rose-700'
              }`}
            >
              <PiggyBank className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-widest block truncate">
                Ahorro Neto Real
              </span>
              <span className="text-xs text-slate-200 light:text-slate-800 font-semibold truncate block">
                {activeSource ? `Cuenta: ${activeSource.name}` : 'Patrimonio Consolidado'}
              </span>
            </div>
          </div>

          {/* Dynamic Status Badges (Superávit/Déficit + Savings Rate) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all whitespace-nowrap ${
                savingsMetrics.isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 light:bg-rose-50 light:text-rose-700 light:border-rose-200'
              }`}
            >
              {savingsMetrics.savingsRate >= 0 ? '+' : ''}
              {savingsMetrics.savingsRate.toFixed(1)}% tasa
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all whitespace-nowrap ${
                savingsMetrics.isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)] light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 light:shadow-none'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)] light:bg-rose-50 light:text-rose-700 light:border-rose-200 light:shadow-none'
              }`}
            >
              {savingsMetrics.isPositive ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  <span>Superávit</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  <span>Déficit</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Main Absolute Savings Amount */}
        <div className="relative z-10">
          <div
            className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight transition-colors ${
              savingsMetrics.isPositive
                ? 'text-emerald-400 light:text-emerald-600 drop-shadow-[0_0_24px_rgba(16,185,129,0.35)] light:drop-shadow-none'
                : 'text-rose-400 light:text-rose-600 drop-shadow-[0_0_24px_rgba(244,63,94,0.35)] light:drop-shadow-none'
            }`}
          >
            {savingsMetrics.netSavings >= 0 ? '+' : ''}
            {formatCurrency(savingsMetrics.netSavings)}
          </div>
          <p className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5">
            {savingsMetrics.netSavings >= 0
              ? filterType === 'month'
                ? `Superávit neto conseguido en ${formatMonthTitle(selectedMonth)}`
                : 'Diferencia neta positiva retenida tras cubrir los gastos del periodo'
              : filterType === 'month'
                ? `Los gastos han superado a los ingresos en ${formatMonthTitle(selectedMonth)}`
                : 'Los gastos han superado a los ingresos registrados en este periodo'}
          </p>
        </div>

        {/* Integrated 4-column metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 light:border-slate-200/80 relative z-10">
          {/* 1. Ingresos */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[10px] text-slate-400 light:text-slate-500 font-medium">
              <span className="truncate">Ingresos</span>
              <ArrowUpRight className="h-3 w-3 text-emerald-400 light:text-emerald-600 flex-shrink-0" />
            </div>
            <div className="mt-1 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 light:text-emerald-600 block leading-tight truncate">
                +{formatCompactCurrency(periodIncome)}
              </span>
              <span className="text-[9px] text-slate-500 light:text-slate-500 font-medium block truncate mt-0.5">
                {filterType === 'month' ? formatMonthPill(selectedMonth) : 'en el periodo'}
              </span>
            </div>
          </div>

          {/* 2. Gastos */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[10px] text-slate-400 light:text-slate-500 font-medium">
              <span className="truncate">Gastos</span>
              <ArrowDownRight className="h-3 w-3 text-rose-400 light:text-rose-600 flex-shrink-0" />
            </div>
            <div className="mt-1 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-white light:text-slate-900 block leading-tight truncate">
                -{formatCompactCurrency(periodExpense)}
              </span>
              <span className="text-[9px] text-slate-500 light:text-slate-500 font-medium block truncate mt-0.5">
                {formatCompactCurrency(dailyAverageSpend)}/día
              </span>
            </div>
          </div>

          {/* 3. Ritmo Diario */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 light:text-slate-500 font-medium block truncate">
              Ritmo Ahorro
            </span>
            <div className="mt-1 min-w-0">
              <span
                className={`text-sm sm:text-base font-extrabold block leading-tight truncate ${
                  savingsMetrics.dailyAverageSavings >= 0 ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                }`}
              >
                {savingsMetrics.dailyAverageSavings >= 0 ? '+' : ''}
                {formatCompactCurrency(savingsMetrics.dailyAverageSavings)}/d
              </span>
              <span className="text-[9px] text-slate-500 light:text-slate-500 font-medium block truncate mt-0.5">
                en {daysInPeriod} días
              </span>
            </div>
          </div>

          {/* 4. Proyección Cierre de Mes */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 light:text-slate-500 font-medium block truncate">
              Cierre Mes (Est.)
            </span>
            <div className="mt-1 min-w-0">
              <span
                className={`text-sm sm:text-base font-extrabold block leading-tight truncate ${
                  savingsMetrics.projectedMonthEndSavings >= 0 ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                }`}
              >
                {savingsMetrics.projectedMonthEndSavings >= 0 ? '+' : ''}
                {formatCompactCurrency(savingsMetrics.projectedMonthEndSavings)}
              </span>
              <span className="text-[9px] text-slate-500 light:text-slate-500 font-medium block truncate mt-0.5">
                al ritmo actual
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Helper Renderers for Chart Sections */}
      {(() => {
        const renderSavingsChart = () => (
          <div className="rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-3 relative overflow-hidden transition-all duration-300">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Ambient Glow */}
            <div
              className={`pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-colors duration-500 ${
                savingsMetrics.isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              }`}
            />

            <div className="flex items-center justify-between relative z-10 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Evolución del Ahorro</h3>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                  {savingsChartMode === 'accumulated'
                    ? 'Trayectoria acumulada a lo largo del tiempo'
                    : 'Ahorro neto obtenido por cada corte del periodo'}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center bg-white/[0.06] light:bg-slate-200/70 p-0.5 rounded-xl border border-white/10 light:border-slate-300 text-[10px] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSavingsChartMode('accumulated')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    savingsChartMode === 'accumulated'
                      ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-slate-900 light:shadow-sm'
                      : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  Acumulado
                </button>
                <button
                  type="button"
                  onClick={() => setSavingsChartMode('net')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    savingsChartMode === 'net'
                      ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-slate-900 light:shadow-sm'
                      : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  Neto
                </button>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="h-60 w-full pt-2 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={savingsEvolutionData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="savingsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={savingsMetrics.isPositive ? '#10B981' : '#F43F5E'}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={savingsMetrics.isPositive ? '#10B981' : '#F43F5E'}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactCurrency(v)}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                  <Tooltip content={<SavingsCustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={savingsChartMode === 'accumulated' ? 'accumulatedSavings' : 'netSavings'}
                    name={savingsChartMode === 'accumulated' ? 'Ahorro Acumulado' : 'Ahorro Neto'}
                    stroke={savingsMetrics.isPositive ? '#34D399' : '#FB7185'}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#savingsAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Monthly Superávit/Déficit Row */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/10 light:border-slate-200/80 text-center relative z-10">
              {monthlyComparisonData.map((m) => {
                const net = m.income - m.expense;
                const isPositive = net >= 0;
                return (
                  <div key={m.label} className="p-1.5 rounded-xl bg-white/[0.03] light:bg-slate-100 border border-white/5 light:border-slate-200 min-w-0">
                    <span className="text-[10px] text-slate-400 light:text-slate-500 block font-medium truncate">{m.label}</span>
                    <span
                      className={`text-[11px] font-bold block truncate ${
                        isPositive ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {Math.round(net)}€
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

        const renderCategoriesChart = () => (
          <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Distribución de Gastos</h3>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">Porcentaje por categoría en el periodo</p>
              </div>
              <span className="text-xs font-bold text-rose-400 light:text-rose-600 bg-rose-500/10 light:bg-rose-50 px-2.5 py-1 rounded-full border border-rose-500/20 light:border-rose-200 flex-shrink-0 whitespace-nowrap">
                -{formatCurrency(periodExpense)}
              </span>
            </div>

            {categoryChartData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 light:text-slate-500">
                No hay gastos registrados en este periodo.
              </div>
            ) : (
              <>
                {/* Donut Chart with Centered Total */}
                <div className="relative h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<GlassTooltip />} />
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={92}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                      >
                        {categoryChartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Display */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 light:text-slate-500">
                      Total Gastado
                    </span>
                    <span className="text-lg font-black text-white light:text-slate-900 leading-tight">
                      {formatCurrency(periodExpense)}
                    </span>
                  </div>
                </div>

                {/* Interactive Category Chips Legend */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10 light:border-slate-200/80">
                  {categoryChartData.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] light:bg-white/80 light:hover:bg-white border border-transparent light:border-slate-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-semibold text-slate-200 light:text-slate-800 truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                        <span className="text-xs font-bold text-white light:text-slate-900">
                          {formatCurrency(cat.value)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 light:text-slate-600 bg-white/5 light:bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

        const renderComparisonChart = () => (
          <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Flujo Mensual Comparativo</h3>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">Ingresos vs Gastos vs Ahorro acumulado</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] flex-shrink-0 whitespace-nowrap">
                <span className="flex items-center gap-1 text-emerald-400 light:text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600" /> Ingreso
                </span>
                <span className="flex items-center gap-1 text-rose-400 light:text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-400 light:bg-rose-600" /> Gasto
                </span>
                <span className="flex items-center gap-1 text-indigo-400 light:text-indigo-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 light:bg-indigo-600" /> Ahorro
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyComparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar
                    dataKey="income"
                    name="Ingresos"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="expense"
                    name="Gastos"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="savings"
                    name="Ahorro"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Monthly Superávit/Déficit Row */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/10 light:border-slate-200/80 text-center">
              {monthlyComparisonData.map((m) => {
                const net = m.income - m.expense;
                const isPositive = net >= 0;
                return (
                  <div key={m.label} className="p-1.5 rounded-xl bg-white/[0.03] light:bg-slate-100 border border-white/5 light:border-slate-200 min-w-0">
                    <span className="text-[10px] text-slate-400 light:text-slate-500 block font-medium truncate">{m.label}</span>
                    <span
                      className={`text-[11px] font-bold block truncate ${
                        isPositive ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {Math.round(net)}€
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

        const renderNetWorthChart = () => (
          <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Evolución de Patrimonio</h3>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">Balance acumulado + Cartera de inversión</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 light:text-indigo-700 bg-indigo-500/10 light:bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-500/20 light:border-indigo-200 flex-shrink-0 whitespace-nowrap">
                {formatCurrency(netWorthData[netWorthData.length - 1]?.netWorth || 0)}
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={netWorthData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradientNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    name="Patrimonio Neto"
                    stroke="#818CF8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientNetWorth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

        return (
          <>
            {/* Section Switcher: Tipos de Visualización (Mobile only, <lg) */}
            <div className="lg:hidden flex items-center gap-1 bg-white/[0.06] light:bg-slate-200/70 p-1 rounded-2xl border border-white/10 light:border-slate-300">
              <button
                type="button"
                onClick={() => setActiveChartSection('savings')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeChartSection === 'savings'
                    ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                }`}
              >
                <PiggyBank className="h-3.5 w-3.5" />
                <span>Ahorro</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChartSection('categories')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeChartSection === 'categories'
                    ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                }`}
              >
                <PieIcon className="h-3.5 w-3.5" />
                <span>Categorías</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChartSection('comparison')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeChartSection === 'comparison'
                    ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Mensual</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChartSection('networth')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeChartSection === 'networth'
                    ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Patrimonio</span>
              </button>
            </div>

            {/* Mobile View: Single Tab (<lg) */}
            <div className="lg:hidden flex flex-col gap-4">
              {activeChartSection === 'savings' && renderSavingsChart()}
              {activeChartSection === 'categories' && renderCategoriesChart()}
              {activeChartSection === 'comparison' && renderComparisonChart()}
              {activeChartSection === 'networth' && renderNetWorthChart()}
            </div>

            {/* Desktop View: All 4 charts in expansive 2x2 grid (≥lg) */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 items-start">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                {renderSavingsChart()}
                {renderComparisonChart()}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                {renderCategoriesChart()}
                {renderNetWorthChart()}
              </div>
            </div>
          </>
        );
      })()}

      {/* 7. Ranking de Marcas Más Frecuentes (Gráfico Horizontal con Logos Reales) */}
      <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <div className="h-7 w-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 light:text-rose-600 flex-shrink-0">
              <Flame className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">Comercios & Marcas Top</h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">Mayor volumen de gasto en el periodo</p>
            </div>
          </div>
        </div>

        {sortedBrands.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 light:text-slate-500">
            No hay compras registradas en comercios durante este periodo.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedBrands.map((b, index) => {
              const proportion = (b.total / maxBrandTotal) * 100;
              const medalColors = [
                'from-amber-400 to-yellow-500 text-slate-950 font-black', // 1st
                'from-slate-200 to-slate-400 text-slate-950 font-black', // 2nd
                'from-amber-600 to-amber-700 text-white font-black',     // 3rd
              ];
              const medal = medalColors[index] || 'bg-white/10 text-slate-300 light:bg-slate-200 light:text-slate-700';

              return (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] light:bg-white/80 light:hover:bg-white border border-white/10 light:border-slate-200/80 flex flex-col gap-2 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-gradient-to-tr ${medal} flex-shrink-0`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-shrink-0">
                        <BrandAvatar brand={b.brand} fallbackText={b.name} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white light:text-slate-900 block leading-tight truncate">
                          {b.name}
                        </span>
                        <span className="text-[10px] text-slate-400 light:text-slate-500 block truncate mt-0.5">
                          {b.count} {b.count === 1 ? 'movimiento' : 'movimientos'} •{' '}
                          {b.percentage.toFixed(1)}% del gasto
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-rose-400 light:text-rose-600 flex-shrink-0 whitespace-nowrap">
                      -{formatCurrency(b.total)}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart Progress */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 light:bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${proportion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Bottom Summary Insight Card */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 light:bg-indigo-50/80 border border-indigo-500/20 light:border-indigo-200 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 light:text-indigo-600 flex-shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white light:text-slate-900 block truncate">
              Salud Financiera en el Periodo
            </span>
            <span className="text-[11px] text-indigo-300 light:text-indigo-700 block line-clamp-2">
              {periodSavingsRate >= 20
                ? '¡Excelente! Estás ahorrando más del 20% de tus ingresos.'
                : 'Controla los gastos discrecionales para elevar tu tasa de ahorro.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
