import { useState } from 'react';
import { Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { TimeRangeFilter } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { formatCurrency, formatPercentage } from '../../utils/currency';

export const AnalyticsView: React.FC = () => {
  const timeRange = useFinanceStore((state) => state.timeRange);
  const setTimeRange = useFinanceStore((state) => state.setTimeRange);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const brands = useFinanceStore((state) => state.brands);

  const [activeTabMetric, setActiveTabMetric] = useState<'categories' | 'brands'>('categories');

  // Filter transactions according to selected time range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();

  const periodTransactions = transactions.filter((tx) => {
    if (!tx || !tx.date) return false;
    const txTime = new Date(tx.date).getTime();
    switch (timeRange) {
      case 'this_month':
        return txTime >= startOfMonth;
      case 'last_month':
        return txTime >= startOfLastMonth && txTime < startOfMonth;
      case 'last_3_months':
        return txTime >= threeMonthsAgo;
      case 'this_year':
        return txTime >= startOfYear;
      case 'all':
      default:
        return true;
    }
  });

  // Calculate totals for period
  let periodIncome = 0;
  let periodExpense = 0;

  const expensesByCategory: Record<string, number> = {};
  const expensesByBrand: Record<string, { total: number; count: number }> = {};

  periodTransactions.forEach((tx) => {
    if (tx.pillar === 'income') {
      periodIncome += tx.amount;
    } else if (tx.pillar === 'expense') {
      periodExpense += tx.amount;
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

  const periodSavingsRate =
    periodIncome > 0 ? Math.max(0, ((periodIncome - periodExpense) / periodIncome) * 100) : 0;

  // Sorted categories
  const sortedCategories = Object.entries(expensesByCategory)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = periodExpense > 0 ? (amount / periodExpense) * 100 : 0;
      return {
        id: catId,
        name: cat?.name || 'Varios',
        amount,
        percentage,
        color: cat?.color || '#EF4444',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Sorted brands
  const sortedBrands = Object.entries(expensesByBrand)
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
    .sort((a, b) => b.total - a.total);

  const timeRangeOptions: { range: TimeRangeFilter; label: string }[] = [
    { range: 'this_month', label: 'Septiembre 2026' },
    { range: 'last_month', label: 'Agosto 2026' },
    { range: 'last_3_months', label: 'Últimos 3 Meses' },
    { range: 'this_year', label: 'Año 2026' },
    { range: 'all', label: 'Todo el Historial' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Time Range Selector */}
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Income Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingresos Periodo</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="mt-2 text-lg font-bold text-emerald-400">
            +{formatCurrency(periodIncome)}
          </span>
        </div>

        {/* Expense Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gastos Periodo</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="mt-2 text-lg font-bold text-rose-400">
            -{formatCurrency(periodExpense)}
          </span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-5 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Tasa de Ahorro en el Periodo
          </span>
          <Percent className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
            {formatPercentage(periodSavingsRate, false)}
          </span>
          <span className="text-xs text-slate-400">
            (Ahorro neto: {formatCurrency(Math.max(0, periodIncome - periodExpense))})
          </span>
        </div>

        {/* Progress bar visual */}
        <div className="mt-3.5 w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-400 transition-all duration-500"
            style={{ width: `${Math.min(Math.max(periodSavingsRate, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Sub-Tabs: Categorías vs Marcas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-2xl border border-white/10 w-full">
          <button
            type="button"
            onClick={() => setActiveTabMetric('categories')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTabMetric === 'categories'
                ? 'bg-white/20 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por Categorías
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMetric('brands')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTabMetric === 'brands'
                ? 'bg-white/20 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por Marcas Comerciales
          </button>
        </div>
      </div>

      {/* Content: Categorías */}
      {activeTabMetric === 'categories' && (
        <div className="flex flex-col gap-2.5">
          {sortedCategories.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
              No hay gastos registrados en este periodo.
            </div>
          ) : (
            sortedCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 flex flex-col gap-2 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-200">
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
            ))
          )}
        </div>
      )}

      {/* Content: Marcas */}
      {activeTabMetric === 'brands' && (
        <div className="flex flex-col gap-2.5">
          {sortedBrands.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
              No hay compras en marcas identificadas para este periodo.
            </div>
          ) : (
            sortedBrands.map((b, index) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <BrandAvatar brand={b.brand} fallbackText={b.name} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {b.count} transacciones • {b.percentage.toFixed(1)}% del gasto
                    </span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-rose-400">
                  -{formatCurrency(b.total)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
