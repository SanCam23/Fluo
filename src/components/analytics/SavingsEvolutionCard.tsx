import React, { useState } from 'react';
import {
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SourceAccount } from '../../types/finance';
import type { SavingsEvolutionPoint } from '../../utils/finance';
import {
  formatCurrency,
  formatCompactCurrency,
  formatAxisCurrency,
} from '../../utils/currency';
import { formatMonthTitle, formatMonthPill } from '../../utils/dates';
import type { MonthlyComparisonPoint } from './CashFlowComparisonCard';

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

export interface SavingsMetricsData {
  netSavings: number;
  savingsRate: number;
  dailyAverageSavings: number;
  projectedMonthEndSavings: number;
  isPositive: boolean;
}

export interface SavingsEvolutionCardProps {
  savingsMetrics: SavingsMetricsData;
  activeSource?: SourceAccount | null;
  filterType: 'period' | 'month';
  selectedMonth: string;
  periodIncome: number;
  periodExpense: number;
  dailyAverageSpend: number;
  daysInPeriod: number;
  savingsEvolutionData: SavingsEvolutionPoint[];
  monthlyComparisonData: MonthlyComparisonPoint[];
}

export const SavingsEvolutionCard: React.FC<SavingsEvolutionCardProps> = ({
  savingsMetrics,
  activeSource,
  filterType,
  selectedMonth,
  periodIncome,
  periodExpense,
  dailyAverageSpend,
  daysInPeriod,
  savingsEvolutionData,
  monthlyComparisonData,
}) => {
  const [savingsChartMode, setSavingsChartMode] = useState<'accumulated' | 'net'>('accumulated');

  return (
    <>
      {/* 1. Main KPI Highlight Card */}
      <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 sm:p-6 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

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

      {/* 2. Interactive Area Chart */}
      <div className="rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3.5 sm:px-5 py-4 sm:py-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-3 relative overflow-hidden transition-all duration-300">
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
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={savingsEvolutionData}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
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
                width={38}
                tickMargin={2}
                tickFormatter={(v) => formatAxisCurrency(v)}
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
    </>
  );
};

