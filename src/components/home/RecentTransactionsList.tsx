import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType } from '../../types/finance';
import { SwipeableTransactionItem } from './SwipeableTransactionItem';

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

      {/* List of items with Swipe-to-Delete */}
      <div className="flex flex-col gap-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
            No hay transacciones registradas en este filtro.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const category = getCategoryById(tx.categoryId);
            const brand = getBrandById(tx.brandId);

            return (
              <SwipeableTransactionItem
                key={tx.id}
                tx={tx}
                category={category}
                brand={brand}
                onDelete={deleteTransaction}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
