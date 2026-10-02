import React, { useMemo } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../common/CategoryIcon';

export const DesktopBudgetsWidget: React.FC = () => {
  const transactions = useFinanceStore((state) => state.transactions);
  const getCategoryById = useFinanceStore((state) => state.getCategoryById);

  // Calculate current month's expenses by category
  const { categoryExpenses, totalMonthExpense } = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

    const catTotals: Record<string, number> = {};
    let totalExp = 0;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (tx.pillar !== 'expense' || !tx.date) continue;
      const txTime = new Date(tx.date).getTime();
      if (txTime >= currentMonthStart && txTime < nextMonthStart) {
        catTotals[tx.categoryId] = (catTotals[tx.categoryId] || 0) + tx.amount;
        totalExp += tx.amount;
      }
    }

    const sorted = Object.entries(catTotals)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        const percent = totalExp > 0 ? (amount / totalExp) * 100 : 0;
        return {
          catId,
          name: cat?.name || 'Varios',
          icon: cat?.icon || 'MoreHorizontal',
          color: cat?.color || '#EF4444',
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { categoryExpenses: sorted, totalMonthExpense: totalExp };
  }, [transactions, getCategoryById]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider">
            Presupuestos y Gastos Activos
          </span>
        </div>

        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Este Mes
        </span>
      </div>

      {categoryExpenses.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center gap-1.5">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 opacity-60" />
          <p className="text-xs font-semibold text-slate-300">Sin gastos este mes</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tus partidas de gasto y seguimiento de presupuestos se visualizarán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between px-0.5">
            <span className="text-[11px] text-slate-400">Total Consumido</span>
            <span className="text-sm font-extrabold text-white">
              {formatCurrency(totalMonthExpense)}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {categoryExpenses.slice(0, 5).map((item) => (
              <div
                key={item.catId}
                className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2 transition-all hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 mr-2">
                    <CategoryIcon
                      iconName={item.icon}
                      className="h-4 w-4"
                    />
                    <span className="font-semibold text-white truncate block">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                      {item.percent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, item.percent))}%`,
                      backgroundColor: item.color || '#6366F1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
