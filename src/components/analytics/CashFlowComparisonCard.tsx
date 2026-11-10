import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassTooltip } from './GlassTooltip';
import { formatAxisCurrency } from '../../utils/currency';

export interface MonthlyComparisonPoint {
  label: string;
  income: number;
  expense: number;
  savings: number;
  order: number;
}

export interface CashFlowComparisonCardProps {
  monthlyComparisonData: MonthlyComparisonPoint[];
}

export const CashFlowComparisonCard: React.FC<CashFlowComparisonCardProps> = ({
  monthlyComparisonData,
}) => {
  return (
    <div className="rounded-3xl bg-white/[0.07] light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3.5 sm:px-5 py-4 sm:py-5 shadow-2xl light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden">
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
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={monthlyComparisonData}
            margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
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
              width={38}
              tickMargin={2}
              tickFormatter={(v) => formatAxisCurrency(v)}
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
};

