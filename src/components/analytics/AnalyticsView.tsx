import { useState, useMemo } from 'react';
import {
  Layers,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { TimeRangeFilter } from '../../types/finance';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatMonthTitle } from '../../utils/dates';
import { SourceAvatar } from '../common/SourceAvatar';
import { InvestmentAnalyticsView } from './InvestmentAnalyticsView';
import { AssetProgressionLineChart } from './AssetProgressionLineChart';
import {
  computeSavingsMetrics,
  generateSavingsEvolution,
  isInvestmentSource,
} from '../../utils/finance';
import { SavingsEvolutionCard } from './SavingsEvolutionCard';
import { CategoryDistributionCard } from './CategoryDistributionCard';
import { CashFlowComparisonCard } from './CashFlowComparisonCard';
import { NetWorthEvolutionCard } from './NetWorthEvolutionCard';
import { BrandRankingCard } from './BrandRankingCard';




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

  const [activeChartSection, setActiveChartSection] = useState<'savings' | 'categories' | 'comparison' | 'networth' | 'assets'>('savings');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const activeSource = useMemo(
    () => (activeSourceId ? getSourceById(activeSourceId) : null),
    [getSourceById, activeSourceId]
  );
  const isInvestAccount = Boolean(activeSource && isInvestmentSource(activeSource));
  const isCashAccount = Boolean(
    activeSource && (activeSource.type === 'cash' || activeSource.institution?.toLowerCase() === 'efectivo')
  );

  const effectiveChartSection =
    isCashAccount && activeChartSection === 'assets' ? 'savings' : activeChartSection;

  

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

    let days: number;
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

      {isInvestAccount && activeSource ? (
        <InvestmentAnalyticsView
          source={activeSource}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      ) : (
        <>
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
      <SavingsEvolutionCard
        savingsMetrics={savingsMetrics}
        activeSource={activeSource}
        filterType={filterType}
        selectedMonth={selectedMonth}
        periodIncome={periodIncome}
        periodExpense={periodExpense}
        dailyAverageSpend={dailyAverageSpend}
        daysInPeriod={daysInPeriod}
        savingsEvolutionData={savingsEvolutionData}
        monthlyComparisonData={monthlyComparisonData}
      />

      {/* 3. Helper Renderers for Chart Sections */}
      {(() => {
        const renderAssetProgressionChart = () => (
          <AssetProgressionLineChart
            assets={assets}
            transactions={transactions}
            title="Progresión de Inversiones (ETFs, Cripto, Acciones)"
            subtitle="Evolución del dinero invertido y valor de mercado de cada activo en cartera"
          />
        );

        return (
          <>
            {!isDesktop ? (
              <>
                {/* Section Switcher: Tipos de Visualización (Mobile only, <lg) */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.06] light:bg-slate-200/70 rounded-2xl border border-white/10 light:border-slate-300 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveChartSection('categories')}
                    className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
                      effectiveChartSection === 'categories'
                        ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                    }`}
                  >
                    Categorías
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChartSection('comparison')}
                    className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
                      effectiveChartSection === 'comparison'
                        ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                    }`}
                  >
                    Mensual
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChartSection('networth')}
                    className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
                      effectiveChartSection === 'networth'
                        ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                    }`}
                  >
                    {isCashAccount ? 'Saldo' : 'Patrimonio'}
                  </button>

                  {!isCashAccount && (
                    <button
                      type="button"
                      onClick={() => setActiveChartSection('assets')}
                      className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
                        effectiveChartSection === 'assets'
                          ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600 light:shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                      }`}
                    >
                      Activos
                    </button>
                  )}
                </div>

                {/* Mobile View: Single Tab (<lg) */}
                <div className="flex flex-col gap-4">
                  {effectiveChartSection === 'categories' && (
                    <CategoryDistributionCard categoryChartData={categoryChartData} periodExpense={periodExpense} />
                  )}
                  {effectiveChartSection === 'comparison' && (
                    <CashFlowComparisonCard monthlyComparisonData={monthlyComparisonData} />
                  )}
                  {effectiveChartSection === 'networth' && (
                    <NetWorthEvolutionCard isCashAccount={isCashAccount} activeSource={activeSource} netWorthData={netWorthData} />
                  )}
                  {effectiveChartSection === 'assets' && !isCashAccount && renderAssetProgressionChart()}
                </div>
              </>
            ) : (
              /* Desktop View: Charts in 2x2 grid + Full Width Asset Progression (≥lg) */
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6 items-start">
                  <CategoryDistributionCard categoryChartData={categoryChartData} periodExpense={periodExpense} />
                  <CashFlowComparisonCard monthlyComparisonData={monthlyComparisonData} />
                </div>

                <NetWorthEvolutionCard isCashAccount={isCashAccount} activeSource={activeSource} netWorthData={netWorthData} />

                {/* Full-width Multi-Line Progression Chart for each asset (excluded for cash accounts) */}
                {!isCashAccount && renderAssetProgressionChart()}
              </div>
            )}
          </>
        );
      })()}

      <BrandRankingCard sortedBrands={sortedBrands} maxBrandTotal={maxBrandTotal} />

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
        </>
      )}
    </div>
  );
};
