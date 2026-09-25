import { Repeat, Trash2 } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType } from '../../types/finance';
import { BrandAvatar } from '../common/BrandAvatar';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate } from '../../utils/dates';

interface RecentTransactionsListProps {
  selectedPillar: PillarType | 'all';
  onSelectPillar: (pillar: PillarType | 'all') => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  selectedPillar,
  onSelectPillar,
}) => {
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const getCategoryById = useFinanceStore((state) => state.getCategoryById);
  const getBrandById = useFinanceStore((state) => state.getBrandById);

  // Filter transactions according to selected pillar
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedPillar === 'all') return true;
    return tx.pillar === selectedPillar;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Header and Filter Pills */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white tracking-wide">
          Movimientos Recientes
        </h2>
        <span className="text-xs text-slate-400">
          {filteredTransactions.length} registros
        </span>
      </div>

      {/* Pill Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'income', 'expense', 'invest'] as const).map((pillar) => {
          const isSelected = selectedPillar === pillar;
          const labels: Record<string, string> = {
            all: 'Todos',
            income: 'Ingresos',
            expense: 'Gastos',
            invest: 'Inversión',
          };

          return (
            <button
              key={pillar}
              type="button"
              onClick={() => onSelectPillar(pillar)}
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
              }`}
            >
              {labels[pillar]}
            </button>
          );
        })}
      </div>

      {/* List of items */}
      <div className="flex flex-col gap-2">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
            No hay transacciones registradas en este filtro.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const category = getCategoryById(tx.categoryId);
            const brand = getBrandById(tx.brandId);

            const isIncome = tx.pillar === 'income';
            const isInvest = tx.pillar === 'invest';

            return (
              <div
                key={tx.id}
                className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                {/* Left side: Avatar + Concept + Category */}
                <div className="flex items-center gap-3 min-w-0">
                  <BrandAvatar
                    brand={brand}
                    fallbackText={category?.name || 'TX'}
                    categoryIcon={category?.icon}
                    categoryColor={category?.color}
                    size="md"
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">
                      {tx.concept}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{category?.name || 'General'}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(tx.date)}</span>
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-0.5 text-indigo-400 font-medium">
                          <Repeat className="h-2.5 w-2.5" />
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and delete action on hover/touch */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold tracking-tight block ${
                        isIncome
                          ? 'text-emerald-400'
                          : isInvest
                          ? 'text-indigo-300'
                          : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">
                      {tx.pillar}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTransaction(tx.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-opacity rounded-lg hover:bg-white/10 cursor-pointer"
                    title="Eliminar movimiento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
