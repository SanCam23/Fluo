import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SourceAccount } from '../../types/finance';
import { GlassTooltip } from './GlassTooltip';
import { formatCurrency, formatAxisCurrency } from '../../utils/currency';

export interface NetWorthPoint {
  month: string;
  netWorth: number;
}

export interface NetWorthEvolutionCardProps {
  isCashAccount: boolean;
  activeSource?: SourceAccount | null;
  netWorthData: NetWorthPoint[];
}

export const NetWorthEvolutionCard: React.FC<NetWorthEvolutionCardProps> = ({
  isCashAccount,
  activeSource,
  netWorthData,
}) => {
  return (
    <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3.5 sm:px-5 py-4 sm:py-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white light:text-slate-900 truncate">
            {isCashAccount ? 'Evolución de Saldo en Efectivo' : 'Evolución de Patrimonio'}
          </h3>
          <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
            {isCashAccount
              ? 'Saldo acumulado disponible en efectivo'
              : activeSource
              ? `Evolución del saldo en ${activeSource.name}`
              : 'Balance acumulado + Cartera de inversión'}
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-400 light:text-indigo-700 bg-indigo-500/10 light:bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-500/20 light:border-indigo-200 flex-shrink-0 whitespace-nowrap">
          {formatCurrency(netWorthData[netWorthData.length - 1]?.netWorth || 0)}
        </span>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={netWorthData}
            margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
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
              width={38}
              tickMargin={2}
              tickFormatter={(v) => formatAxisCurrency(v)}
            />
            <Tooltip content={<GlassTooltip />} />
            <Area
              type="monotone"
              dataKey="netWorth"
              name={isCashAccount ? 'Saldo Efectivo' : 'Patrimonio Neto'}
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
};

