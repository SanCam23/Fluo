import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType } from '../../types/finance';
import { SwipeableTransactionItem } from './SwipeableTransactionItem';

interface RecentTransactionsListProps {
  selectedPillar: PillarType | 'all';
  onSelectPillar: (pillar: PillarType | 'all') => void;
}

const PAGE_SIZE = 25;

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  selectedPillar,
  onSelectPillar,
}) => {
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Memoized shallow store selectors to avoid re-renders when unrelated store slices update
  const { transactions, deleteTransaction, getCategoryById, getBrandById } = useFinanceStore(
    useShallow((state) => ({
      transactions: state.transactions,
      deleteTransaction: state.deleteTransaction,
      getCategoryById: state.getCategoryById,
      getBrandById: state.getBrandById,
    }))
  );

  // Filter transactions according to selected pillar (memoized)
  const filteredTransactions = useMemo(() => {
    if (selectedPillar === 'all') return transactions;
    return transactions.filter((tx) => tx.pillar === selectedPillar);
  }, [transactions, selectedPillar]);

  // Windowed visible slice for sub-second layout and instant 60/120fps scrolling
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, displayLimit);
  }, [filteredTransactions, displayLimit]);

  const handleFilterChange = (pillar: PillarType | 'all') => {
    setDisplayLimit(PAGE_SIZE);
    onSelectPillar(pillar);
  };

  const hasMore = filteredTransactions.length > displayLimit;

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
              onClick={() => handleFilterChange(pillar)}
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

      {/* List of items with Swipe-to-Delete and GPU viewport skipping (cv-auto) */}
      <div className="flex flex-col gap-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
            No hay transacciones registradas en este filtro.
          </div>
        ) : (
          visibleTransactions.map((tx) => {
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

      {/* Progressive Windowing "Cargar más" Button */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
          className="w-full py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          <span>
            Mostrar más movimientos ({filteredTransactions.length - displayLimit} restantes)
          </span>
        </button>
      )}
    </div>
  );
};
