import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassTooltip } from './GlassTooltip';
import { formatCurrency } from '../../utils/currency';

export interface CategoryChartItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CategoryDistributionCardProps {
  categoryChartData: CategoryChartItem[];
  periodExpense: number;
}

export const CategoryDistributionCard: React.FC<CategoryDistributionCardProps> = ({
  categoryChartData,
  periodExpense,
}) => {
  return (
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
};

