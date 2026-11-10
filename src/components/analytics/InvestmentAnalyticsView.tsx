import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
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
import type { SourceAccount, TimeRangeFilter } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMonthTitle } from '../../utils/dates';
import { SourceAvatar } from '../common/SourceAvatar';
import { AssetProgressionLineChart } from './AssetProgressionLineChart';
import { GlassTooltip } from './GlassTooltip';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatAxisCurrency } from '../../utils/currency';
import {
  computeInvestmentAccountSummary,
  computeBrokerAssetAllocation,
  computeBrokerMonthlyFlows,
  computeBrokerHoldingsRanking,
  type RankedHoldingItem,
} from '../../utils/finance';

interface InvestmentAnalyticsViewProps {
  source: SourceAccount;
  filterType: 'period' | 'month';
  setFilterType: (type: 'period' | 'month') => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  timeRange: TimeRangeFilter;
  setTimeRange: (range: TimeRangeFilter) => void;
  onOpenAddModal?: () => void;
}

export const InvestmentAnalyticsView: React.FC<InvestmentAnalyticsViewProps> = ({
  source,
  filterType,
  setFilterType,
  selectedMonth,
  setSelectedMonth,
  timeRange,
  setTimeRange,
  onOpenAddModal,
}) => {
  const transactions = useFinanceStore((state) => state.transactions);
  const assets = useFinanceStore((state) => state.assets);
  const [activeChartSection, setActiveChartSection] = useState<'allocation' | 'holdings' | 'flows' | 'evolution'>('allocation');
  const [evolutionMode, setEvolutionMode] = useState<'assets' | 'portfolio'>('assets');

  // Compute overall live broker metrics
  const summary = useMemo(
    () => computeInvestmentAccountSummary(source, transactions, assets),
    [source, transactions, assets]
  );

  // Broker specific assets
  const brokerAssets = useMemo(() => summary.holdings.map((h) => h.asset), [summary.holdings]);

  // Asset allocation breakdown
  const allocations = useMemo(
    () => computeBrokerAssetAllocation(summary),
    [summary]
  );

  // Holdings ranked by market value
  const rankedHoldings = useMemo(
    () => computeBrokerHoldingsRanking(summary),
    [summary]
  );

  // Monthly flow data for the broker (Inflows vs Investments vs Withdrawals)
  const monthlyFlows = useMemo(
    () => computeBrokerMonthlyFlows(source.id, transactions, 5),
    [source.id, transactions]
  );

  // Time filter options for Period Mode
  const timeRangeOptions: { range: TimeRangeFilter; label: string }[] = [
    { range: 'this_month', label: 'Este Mes' },
    { range: 'last_month', label: 'Mes Pasado' },
    { range: 'last_3_months', label: 'Últimos 3 Meses' },
    { range: 'last_6_months', label: 'Últimos 6 Meses' },
    { range: 'this_year', label: 'Este Año' },
    { range: 'all', label: 'Todo' },
  ];

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

  // Compute Period-Specific metrics for this broker
  const { periodInflow, periodInvested, periodWithdrawn, periodTxCount } = useMemo(() => {
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

    let inflow = 0;
    let invested = 0;
    let withdrawn = 0;
    let count = 0;

    transactions.forEach((tx) => {
      if (!tx || !tx.date || tx.sourceId !== source.id) return;
      const t = new Date(tx.date).getTime();
      if (t < minTime || t >= maxTime) return;

      count++;
      const amt = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 0;
      if (tx.pillar === 'income') {
        inflow += amt;
      } else if (tx.pillar === 'invest') {
        invested += amt;
      } else if (tx.pillar === 'expense') {
        withdrawn += amt;
      }
    });

    return {
      periodInflow: inflow,
      periodInvested: invested,
      periodWithdrawn: withdrawn,
      periodTxCount: count,
    };
  }, [transactions, source.id, filterType, selectedMonth, timeRange]);

  // Evolution Area Chart Data
  const evolutionData = useMemo(() => {
    let runningInvested = 0;
    const points: Array<{ label: string; invested: number; value: number }> = [];
    for (const m of monthlyFlows) {
      runningInvested += m.invested;
      const estimatedValue = runningInvested > 0
        ? runningInvested * (1 + (summary.unrealizedPnLPercentage / 100))
        : 0;
      points.push({
        label: m.label,
        invested: Number(runningInvested.toFixed(2)),
        value: Number(estimatedValue.toFixed(2)),
      });
    }
    return points;
  }, [monthlyFlows, summary.unrealizedPnLPercentage]);

  // Liquidity and Health metrics
  const totalVal = Math.max(0.01, summary.totalAccountValue);
  const cashRatio = Math.max(0, Math.min(100, (Math.max(0, summary.cashBalance) / totalVal) * 100));
  const maxHoldingVal = rankedHoldings[0]?.currentValue || 1;

  return (
    <div className="flex flex-col gap-5 w-full animate-fadeIn">
      {/* 1. SELECTION MODE (Periodo vs Mes) & OPTIONS */}
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
          <div className="flex items-center justify-between px-2 sm:px-3 py-1 rounded-full bg-white/[0.06] light:bg-slate-100 border border-white/10 light:border-slate-300 flex-1 min-w-0 backdrop-blur-md shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 light:text-slate-700 transition-all cursor-pointer active:scale-90 flex-shrink-0"
              title="Mes anterior"
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
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. UNIFIED MASTER BROKER & INVESTMENT HERO CARD (Liquid Glass) */}
      <div className="rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-indigo-500/20 light:border-slate-300/80 p-5 shadow-[0_8px_32px_0_rgba(99,102,241,0.2)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300">
        {/* Specular Hairline */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        {/* Ambient Halo Glow */}
        <div
          className={`pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl transition-colors duration-500 ${
            summary.isProfit ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          }`}
        />

        {/* Header row: Account Identity + Badges */}
        <div className="flex items-center justify-between relative z-10 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <SourceAvatar source={source} size="md" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                Rendimiento & Cartera
              </span>
              <span className="text-xs text-white light:text-slate-900 font-bold truncate block">
                {source.name}
              </span>
            </div>
          </div>

          {/* Dynamic Yield Badge ("Cuánto está dando") */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border backdrop-blur-md transition-all whitespace-nowrap ${
                summary.isProfit
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              }`}
            >
              {summary.isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{summary.isProfit ? '+' : ''}{formatCurrency(summary.unrealizedPnL)}</span>
              <span className="opacity-80">({summary.isProfit ? '+' : ''}{formatPercentage(summary.unrealizedPnLPercentage)})</span>
            </span>
          </div>
        </div>

        {/* Core Value: Total Assets under Custody */}
        <div className="relative z-10">
          <div className="text-3xl sm:text-4xl font-black text-white light:text-slate-900 tracking-tight leading-tight">
            {formatCurrency(summary.totalAccountValue)}
          </div>
          <p className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5">
            Patrimonio total custodiado • Efectivo: <strong className="text-emerald-400 font-semibold">{formatCurrency(summary.cashBalance)}</strong> ({cashRatio.toFixed(1)}%) • Cartera: <strong className="text-indigo-300 font-semibold">{formatCurrency(summary.portfolioMarketValue)}</strong>
          </p>
        </div>

        {/* 4-Column Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 light:border-slate-200/80 relative z-10">
          {/* 1. Capital Invertido */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 font-medium truncate">Coste Invertido</span>
            <div className="mt-1 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-white light:text-slate-900 block leading-tight truncate">
                {formatCurrency(summary.investedCapital)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5">
                Desembolso de compra
              </span>
            </div>
          </div>

          {/* 2. Valor Cartera */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 font-medium truncate">Valor de Mercado</span>
            <div className="mt-1 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-indigo-300 light:text-indigo-600 block leading-tight truncate">
                {formatCurrency(summary.portfolioMarketValue)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5">
                {summary.assetsCount} {summary.assetsCount === 1 ? 'activo' : 'activos'}
              </span>
            </div>
          </div>

          {/* 3. Cuánto está dando (Rendimiento Neto) */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 font-medium truncate">Cuánto está dando</span>
            <div className="mt-1 min-w-0">
              <span
                className={`text-sm sm:text-base font-extrabold block leading-tight truncate ${
                  summary.isProfit ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                }`}
              >
                {summary.isProfit ? '+' : ''}{formatCurrency(summary.unrealizedPnL)}
              </span>
              <span
                className={`text-[9px] font-bold block truncate mt-0.5 ${
                  summary.isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {summary.isProfit ? '+' : ''}{formatPercentage(summary.unrealizedPnLPercentage)} P&L
              </span>
            </div>
          </div>

          {/* 4. Aportado en Periodo */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] light:bg-white/80 border border-white/10 light:border-slate-200/80 flex flex-col justify-between min-w-0">
            <span className="text-[10px] text-slate-400 font-medium truncate">Aportado Periodo</span>
            <div className="mt-1 min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-white light:text-slate-900 block leading-tight truncate">
                {formatCurrency(periodInvested)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5">
                {periodTxCount} ops • +{formatCompactCurrency(periodInflow)} dep{periodWithdrawn > 0 ? ` • -${formatCompactCurrency(periodWithdrawn)} ret` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHART SECTION CONTROLS (Segmented Control Liquid Glass) */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.06] light:bg-slate-200/70 rounded-2xl border border-white/10 light:border-slate-300 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveChartSection('allocation')}
          className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
            activeChartSection === 'allocation'
              ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Distribución
        </button>

        <button
          type="button"
          onClick={() => setActiveChartSection('holdings')}
          className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
            activeChartSection === 'holdings'
              ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Posiciones
        </button>

        <button
          type="button"
          onClick={() => setActiveChartSection('flows')}
          className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
            activeChartSection === 'flows'
              ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Flujos
        </button>

        <button
          type="button"
          onClick={() => setActiveChartSection('evolution')}
          className={`flex-1 min-w-max py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
            activeChartSection === 'evolution'
              ? 'bg-white/20 text-white shadow-sm font-bold light:bg-white light:text-indigo-600'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Evolución
        </button>
      </div>

      {/* 4. ACTIVE CHART SECTION RENDERER */}
      {/* SECTION A: ASSET ALLOCATION DONUT */}
      {activeChartSection === 'allocation' && (
        <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
                Distribución por Clase de Activo (Asset Allocation)
              </h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                Ponderación entre instrumentos financieros y efectivo en custodia
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap">
              {formatCurrency(summary.totalAccountValue)}
            </span>
          </div>

          {allocations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No hay activos ni fondos registrados en esta cuenta.
            </div>
          ) : (
            <>
              {/* Donut Chart with Centered Total */}
              <div className="relative h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Tooltip content={<GlassTooltip />} />
                    <Pie
                      data={allocations}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    >
                      {allocations.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Cartera
                  </span>
                  <span className="text-lg font-black text-white light:text-slate-900 leading-tight">
                    {formatCurrency(summary.totalAccountValue)}
                  </span>
                </div>
              </div>

              {/* Chips Legend */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {allocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-transparent transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {item.name}
                      </span>
                      {item.count > 0 && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({item.count} {item.count === 1 ? 'posición' : 'posiciones'})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* SECTION B: HOLDINGS RANKING (Top Positions in Broker) */}
      {activeChartSection === 'holdings' && (
        <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
                Posiciones en Cartera & Ponderación
              </h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                Mayor peso patrimonial y rendimiento generado en este broker
              </p>
            </div>
          </div>

          {rankedHoldings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay inversiones registradas en este broker.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rankedHoldings.map((h: RankedHoldingItem, index: number) => {
                const proportion = (h.currentValue / maxHoldingVal) * 100;
                const medalColors = [
                  'from-amber-400 to-yellow-500 text-slate-950 font-black',
                  'from-slate-200 to-slate-400 text-slate-950 font-black',
                  'from-amber-600 to-amber-700 text-white font-black',
                ];
                const medal = medalColors[index] || 'bg-white/10 text-slate-300';

                return (
                  <div
                    key={h.asset.id}
                    className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-gradient-to-tr ${medal} flex-shrink-0 mt-0.5`}
                        >
                          {h.rank}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {h.asset.name}
                            </span>
                            {h.asset.identifier && (
                              <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300 text-[10px] font-mono">
                                {h.asset.identifier}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{h.shares.toLocaleString('es-ES', { maximumFractionDigits: 4 })} títulos</span>
                            <span>•</span>
                            <span>PMC: {formatCurrency(h.averageBuyPrice)}</span>
                            <span>•</span>
                            <span className="text-indigo-300 font-semibold">{h.weightPercentage.toFixed(1)}% cartera</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-white block">
                          {formatCurrency(h.currentValue)}
                        </span>
                        <span
                          className={`text-[10px] font-bold block mt-0.5 ${
                            h.isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {h.isProfit ? '+' : ''}{formatCurrency(h.pnl)} ({h.isProfit ? '+' : ''}{formatPercentage(h.pnlPercentage)})
                        </span>
                      </div>
                    </div>

                    {/* Weight bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${proportion}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION C: MONTHLY CAPITAL FLOWS BAR CHART */}
      {activeChartSection === 'flows' && (
        <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3.5 sm:px-5 py-4 sm:py-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
                Flujo de Capital en el Broker
              </h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                Traspasos entrantes vs Compras de bolsa vs Retiradas
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] flex-shrink-0 whitespace-nowrap">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Depósitos
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Inversión
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Retiradas
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={monthlyFlows} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={38} tickMargin={2} tickFormatter={(v) => formatAxisCurrency(v)} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="inflow" name="Depósitos / Traspasos" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="invested" name="Invertido en Activos" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="withdrawn" name="Retiradas de Fondos" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Monthly summary row */}
          <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/10 text-center">
            {monthlyFlows.map((m) => (
              <div key={m.label} className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5 min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium truncate">{m.label}</span>
                <span className="text-[11px] font-bold text-indigo-300 block truncate">
                  {formatCompactCurrency(m.invested)}
                </span>
                <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                  +{formatCompactCurrency(m.inflow)} dep
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION D: EVOLUTION & ASSET PROGRESSION CHART */}
      {activeChartSection === 'evolution' && (
        <div className="flex flex-col gap-4">
          {/* Sub-mode selector: Líneas por Activo vs Cartera Global */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-2xl bg-white/[0.04] light:bg-slate-200/70 border border-white/10 light:border-slate-300">
            <span className="text-xs font-bold text-slate-300 light:text-slate-700 pl-1.5">
              Visualización de Evolución:
            </span>
            <div className="inline-flex p-1 gap-1 rounded-xl bg-white/[0.06] light:bg-white border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEvolutionMode('assets')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  evolutionMode === 'assets'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white light:text-slate-600'
                }`}
              >
                Por Activo (Líneas)
              </button>
              <button
                type="button"
                onClick={() => setEvolutionMode('portfolio')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  evolutionMode === 'portfolio'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white light:text-slate-600'
                }`}
              >
                Total Cartera (€)
              </button>
            </div>
          </div>

          {evolutionMode === 'assets' ? (
            <AssetProgressionLineChart
              assets={brokerAssets}
              transactions={transactions}
              title={`Progresión por Activo (${source.name})`}
              subtitle="Evolución del dinero de cada ETF, criptomoneda y posición en custodia"
            />
          ) : (
            <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3.5 sm:px-5 py-4 sm:py-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
                    Evolución de Valor vs Capital Aportado
                  </h3>
                  <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                    Trayectoria del coste de compra vs valoración viva de la cartera
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] flex-shrink-0 whitespace-nowrap">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" /> Valoración
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Coste Invertido
                  </span>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={evolutionData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientInvestedValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={38} tickMargin={2} tickFormatter={(v) => formatAxisCurrency(v)} />
                    <Tooltip content={<GlassTooltip />} />
                    <Area type="monotone" dataKey="value" name="Valor Cartera" stroke="#818CF8" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientInvestedValue)" />
                    <Area type="monotone" dataKey="invested" name="Coste Invertido" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. PORTFOLIO HEALTH & ALLOCATION DIAGNOSTIC CARD */}
      <div className="p-4 rounded-3xl bg-indigo-500/10 light:bg-indigo-50/80 border border-indigo-500/20 light:border-indigo-200 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white light:text-slate-900 block truncate">
              Diagnóstico de Liquidez y Diversificación
            </span>
            <span className="text-[11px] text-indigo-300 light:text-indigo-700 block mt-0.5 leading-relaxed">
              {cashRatio > 30
                ? `Tienes un ${cashRatio.toFixed(1)}% en liquidez sin invertir (${formatCurrency(summary.cashBalance)}). Puedes programar compras periódicas (DCA) para optimizar el rendimiento.`
                : cashRatio > 5
                ? `Ratio de efectivo equilibrado (${cashRatio.toFixed(1)}% en liquidez). Cuentas con ${formatCurrency(summary.cashBalance)} listos para compras tácticas o aportaciones.`
                : `Capital altamente optimizado (${(100 - cashRatio).toFixed(1)}% invertido en activos). Generando rendimientos en ${summary.assetsCount} posiciones.`}
            </span>
          </div>
        </div>

        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Aportar Fondos</span>
          </button>
        )}
      </div>
    </div>
  );
};
