import React from 'react';
import { Award, Percent } from 'lucide-react';
import { useFinanceStore, useFinancialSummary } from '../../store/useFinanceStore';
import type { TimeRangeFilter } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';

export const AnalyticsView: React.FC = () => {
  const timeRange = useFinanceStore((state) => state.timeRange);
  const setTimeRange = useFinanceStore((state) => state.setTimeRange);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const brands = useFinanceStore((state) => state.brands);
  const summary = useFinancialSummary();

  // Aggregate spending by category
  const expensesByCategory: Record<string, number> = {};
  let totalExpenseAmount = 0;

  // Aggregate spending by brand
  const expensesByBrand: Record<string, { total: number; count: number }> = {};

  transactions.forEach((tx) => {
    if (tx.pillar === 'expense') {
      totalExpenseAmount += tx.amount;
      expensesByCategory[tx.categoryId] = (expensesByCategory[tx.categoryId] || 0) + tx.amount;

      if (tx.brandId) {
        if (!expensesByBrand[tx.brandId]) {
          expensesByBrand[tx.brandId] = { total: 0, count: 0 };
        }
        expensesByBrand[tx.brandId].total += tx.amount;
        expensesByBrand[tx.brandId].count += 1;
      }
    }
  });

  // Sort top categories
  const sortedCategories = Object.entries(expensesByCategory)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0;
      return {
        id: catId,
        name: cat?.name || 'Varios',
        amount,
        percentage,
        color: cat?.color || '#EF4444',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Sort top brands
  const sortedBrands = Object.entries(expensesByBrand)
    .map(([brandId, data]) => {
      const brand = brands.find((b) => b.id === brandId);
      return {
        id: brandId,
        name: brand?.name || 'Desconocida',
        color: brand?.brandColor || '#E50914',
        total: data.total,
        count: data.count,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-5">
      {/* Time Range Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(
          [
            ['this_month', 'Este Mes'],
            ['last_month', 'Mes Anterior'],
            ['last_3_months', '3 Meses'],
            ['this_year', 'Este Año'],
            ['all', 'Histórico'],
          ] as [TimeRangeFilter, string][]
        ).map(([range, label]) => {
          const isSelected = timeRange === range;
          return (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Primary Metric: Savings Rate Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Tasa de Ahorro Mensual
          </span>
          <Percent className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-emerald-400">
            {formatPercentage(summary.savingsRate, false)}
          </span>
          <span className="text-xs text-slate-400">del ingreso neto conservado</span>
        </div>

        {/* Progress bar visual */}
        <div className="mt-4 w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${Math.min(Math.max(summary.savingsRate, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Category Expense Breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Distribución de Gastos por Categoría
          </h3>
          <span className="text-xs text-slate-400">
            {formatCurrency(totalExpenseAmount)} total
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {sortedCategories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              className="p-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{cat.name}</span>
                <span className="text-xs font-bold text-slate-200">
                  {formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Recurring Brands Spend */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Marcas con Mayor Gasto
          </h3>
          <Award className="h-4 w-4 text-amber-400" />
        </div>

        <div className="flex flex-col gap-2">
          {sortedBrands.slice(0, 4).map((brand, index) => (
            <div
              key={brand.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300">
                  #{index + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {brand.count} operaciones registradas
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-rose-400">
                -{formatCurrency(brand.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
