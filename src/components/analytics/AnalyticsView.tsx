import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
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
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { TimeRangeFilter } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';

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
      <div className="rounded-2xl bg-[#0F1626]/95 border border-white/20 p-3 shadow-2xl backdrop-blur-2xl text-xs flex flex-col gap-1.5 z-50">
        {label && <span className="font-bold text-slate-300">{label}</span>}
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-slate-300">{entry.name}:</span>
            </div>
            <span className="font-bold text-white">{formatCurrency(entry.value ?? 0)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView: React.FC = () => {
  const timeRange = useFinanceStore((state) => state.timeRange);
  const setTimeRange = useFinanceStore((state) => state.setTimeRange);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const brands = useFinanceStore((state) => state.brands);
  const assets = useFinanceStore((state) => state.assets);

  const [activeChartSection, setActiveChartSection] = useState<'categories' | 'comparison' | 'networth'>('categories');

  // Filter options
  const timeRangeOptions: { range: TimeRangeFilter; label: string }[] = [
    { range: 'this_month', label: 'Este Mes' },
    { range: 'last_month', label: 'Mes Pasado' },
    { range: 'last_3_months', label: 'Últimos 3 Meses' },
    { range: 'last_6_months', label: 'Últimos 6 Meses' },
    { range: 'this_year', label: 'Este Año' },
    { range: 'all', label: 'Todo' },
  ];

  // Aggregated data for active period
  const {
    periodIncome,
    periodExpense,
    expensesByCategory,
    expensesByBrand,
    daysInPeriod,
  } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const filtered = transactions.filter((tx) => {
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
        case 'all':
        default:
          return true;
      }
    });

    let inc = 0;
    let exp = 0;
    const byCat: Record<string, number> = {};
    const byBrand: Record<string, { total: number; count: number }> = {};

    filtered.forEach((tx) => {
      if (tx.pillar === 'income') {
        inc += tx.amount;
      } else if (tx.pillar === 'expense') {
        exp += tx.amount;
        byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;

        if (tx.brandId) {
          if (!byBrand[tx.brandId]) {
            byBrand[tx.brandId] = { total: 0, count: 0 };
          }
          byBrand[tx.brandId].total += tx.amount;
          byBrand[tx.brandId].count += 1;
        }
      }
    });

    let days = 120;
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
    }

    return {
      periodIncome: inc,
      periodExpense: exp,
      expensesByCategory: byCat,
      expensesByBrand: byBrand,
      daysInPeriod: days,
    };
  }, [transactions, timeRange]);

  // KPI 1: Savings rate
  const periodSavingsRate =
    periodIncome > 0 ? Math.max(0, ((periodIncome - periodExpense) / periodIncome) * 100) : 0;

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
        const cat = categories.find((c) => c.id === catId);
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
  }, [expensesByCategory, categories, periodExpense]);

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

    transactions.forEach((tx) => {
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
  }, [transactions]);

  // Area Chart data: Net worth evolution
  const netWorthData = useMemo(() => {
    let balance = 14200; // Base starting assets / liquid capital
    const baseAssetsValue = portfolioPerformance.portfolioMarketValue;
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
  }, [monthlyComparisonData, portfolioPerformance.portfolioMarketValue]);

  // Sorted brands ranking
  const sortedBrands = useMemo(() => {
    return Object.entries(expensesByBrand)
      .map(([brandId, data]) => {
        const brand = brands.find((b) => b.id === brandId);
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
  }, [expensesByBrand, brands, periodExpense]);

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
      {/* 1. Time Range Selector Segmented Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {timeRangeOptions.map((opt) => {
          const isSelected = timeRange === opt.range;
          return (
            <button
              key={opt.range}
              type="button"
              onClick={() => setTimeRange(opt.range)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-white/20 text-white border border-white/30 shadow-md font-bold'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2. Top KPI Cards Grid (Liquid Glass - Ingresos, Gastos, Inversiones) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* 1. Ingresos */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.07] light:bg-white/85 backdrop-blur-xl border border-white/[0.18] light:border-slate-300/80 shadow-sm flex flex-col gap-1 transition-all">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 light:text-emerald-700">
            <span>Ingresos</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600 flex-shrink-0" />
          </div>
          <div className="mt-0.5">
            <span className="text-[14px] sm:text-base font-extrabold text-emerald-400 light:text-emerald-700 block leading-tight tracking-tight whitespace-nowrap">
              +{formatCompactCurrency(periodIncome)}
            </span>
            <span className="text-[10px] text-slate-400 light:text-slate-600 font-medium block truncate mt-0.5">
              {periodSavingsRate.toFixed(0)}% ahorro
            </span>
          </div>
        </div>

        {/* 2. Gastos */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.07] light:bg-white/85 backdrop-blur-xl border border-white/[0.18] light:border-slate-300/80 shadow-sm flex flex-col gap-1 transition-all">
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-400 light:text-rose-700">
            <span>Gastos</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400 light:text-rose-600 flex-shrink-0" />
          </div>
          <div className="mt-0.5">
            <span className="text-[14px] sm:text-base font-extrabold text-white light:text-slate-900 block leading-tight tracking-tight whitespace-nowrap">
              -{formatCompactCurrency(periodExpense)}
            </span>
            <span className="text-[10px] text-slate-400 light:text-slate-600 font-medium block truncate mt-0.5">
              {formatCompactCurrency(dailyAverageSpend)}/día
            </span>
          </div>
        </div>

        {/* 3. Inversiones */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.07] light:bg-white/85 backdrop-blur-xl border border-white/[0.18] light:border-slate-300/80 shadow-sm flex flex-col gap-1 transition-all">
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400 light:text-indigo-700">
            <span>Inversiones</span>
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400 light:text-indigo-600 flex-shrink-0" />
          </div>
          <div className="mt-0.5">
            <span className="text-[14px] sm:text-base font-extrabold text-white light:text-slate-900 block leading-tight tracking-tight whitespace-nowrap">
              {formatCompactCurrency(portfolioPerformance.portfolioMarketValue)}
            </span>
            <span
              className={`text-[10px] font-semibold block truncate mt-0.5 ${
                portfolioPerformance.roi >= 0
                  ? 'text-indigo-400 light:text-indigo-700'
                  : 'text-rose-400 light:text-rose-700'
              }`}
            >
              {portfolioPerformance.roi >= 0 ? '+' : ''}{portfolioPerformance.roi.toFixed(1)}% ROI
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section Switcher: Tipos de Visualización */}
      <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setActiveChartSection('categories')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChartSection === 'categories'
              ? 'bg-white/20 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieIcon className="h-3.5 w-3.5" />
          <span>Categorías</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChartSection('comparison')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChartSection === 'comparison'
              ? 'bg-white/20 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Mensual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChartSection('networth')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChartSection === 'networth'
              ? 'bg-white/20 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Patrimonio</span>
        </button>
      </div>

      {/* 4. CHART SECTION 1: Donut de Categorías */}
      {activeChartSection === 'categories' && (
        <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Distribución de Gastos</h3>
              <p className="text-[11px] text-slate-400">Porcentaje por categoría en el periodo</p>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              -{formatCurrency(periodExpense)}
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Gastado
                  </span>
                  <span className="text-lg font-black text-white leading-tight">
                    {formatCurrency(periodExpense)}
                  </span>
                </div>
              </div>

              {/* Interactive Category Chips Legend */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {categoryChartData.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(cat.value)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 5. CHART SECTION 2: Barras Comparativas Mensuales */}
      {activeChartSection === 'comparison' && (
        <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Flujo Mensual Comparativo</h3>
              <p className="text-[11px] text-slate-400">Ingresos vs Gastos vs Ahorro acumulado</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Ingreso
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Gasto
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Ahorro
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
          <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/10 text-center">
            {monthlyComparisonData.map((m) => {
              const net = m.income - m.expense;
              const isPositive = net >= 0;
              return (
                <div key={m.label} className="p-1.5 rounded-xl bg-white/[0.03]">
                  <span className="text-[10px] text-slate-400 block font-medium">{m.label}</span>
                  <span
                    className={`text-[11px] font-bold block ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
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
      )}

      {/* 6. CHART SECTION 3: Evolución del Patrimonio Neto */}
      {activeChartSection === 'networth' && (
        <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Evolución de Patrimonio</h3>
              <p className="text-[11px] text-slate-400">Balance acumulado + Cartera de inversión</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
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
      )}

      {/* 7. Ranking de Marcas Más Frecuentes (Gráfico Horizontal con Logos Reales) */}
      <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Comercios & Marcas Top</h3>
              <p className="text-[11px] text-slate-400">Mayor volumen de gasto en el periodo</p>
            </div>
          </div>
        </div>

        {sortedBrands.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
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
              const medal = medalColors[index] || 'bg-white/10 text-slate-300';

              return (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex flex-col gap-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-gradient-to-tr ${medal}`}
                      >
                        {index + 1}
                      </span>
                      <BrandAvatar brand={b.brand} fallbackText={b.name} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {b.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.count} {b.count === 1 ? 'movimiento' : 'movimientos'} •{' '}
                          {b.percentage.toFixed(1)}% del gasto
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-rose-400">
                      -{formatCurrency(b.total)}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart Progress */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
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
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Salud Financiera en el Periodo
            </span>
            <span className="text-[11px] text-indigo-300">
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
