import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, Receipt, Search, X } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType, Transaction } from '../../types/finance';
import { SwipeableTransactionItem } from './SwipeableTransactionItem';

interface RecentTransactionsListProps {
  selectedPillar: PillarType | 'all';
  onSelectPillar: (pillar: PillarType | 'all') => void;
  onEditTransaction?: (tx: Transaction) => void;
}

const PAGE_SIZE = 25;

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  selectedPillar,
  onSelectPillar,
  onEditTransaction,
}) => {
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized shallow store selectors to avoid re-renders when unrelated store slices update
  const { transactions, sources, activeSourceId, deleteTransaction, getCategoryById, getBrandById } =
    useFinanceStore(
      useShallow((state) => ({
        transactions: state.transactions,
        sources: state.sources,
        activeSourceId: state.activeSourceId,
        deleteTransaction: state.deleteTransaction,
        getCategoryById: state.getCategoryById,
        getBrandById: state.getBrandById,
      }))
    );

  const activeSource = useMemo(
    () => (activeSourceId ? sources.find((s) => s.id === activeSourceId) : null),
    [sources, activeSourceId]
  );

  // Isolate transactions to active source account, or show global if activeSourceId is null
  const sourceScopedTransactions = useMemo(() => {
    if (!activeSourceId) return transactions;
    return transactions.filter((tx) => tx.sourceId === activeSourceId);
  }, [transactions, activeSourceId]);

  // Filter transactions according to selected pillar and search query (memoized)
  const filteredTransactions = useMemo(() => {
    let result = sourceScopedTransactions;
    if (selectedPillar !== 'all') {
      result = result.filter((tx) => tx.pillar === selectedPillar);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((tx) => {
        const cat = getCategoryById(tx.categoryId);
        const br = getBrandById(tx.brandId);
        const conceptMatch = tx.concept.toLowerCase().includes(q);
        const brandMatch = br ? br.name.toLowerCase().includes(q) : false;
        const categoryMatch = cat ? cat.name.toLowerCase().includes(q) : false;
        const amountMatch = tx.amount.toString().includes(q);
        return conceptMatch || brandMatch || categoryMatch || amountMatch;
      });
    }
    return result;
  }, [sourceScopedTransactions, selectedPillar, searchQuery, getCategoryById, getBrandById]);

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
        <h2 className="text-sm font-bold text-white tracking-wide truncate">
          {activeSource ? `Movimientos de ${activeSource.name}` : 'Movimientos Recientes'}
        </h2>
        <span className="text-xs text-slate-400 flex-shrink-0">
          {filteredTransactions.length} {activeSource ? 'movs' : 'registros (Global)'}
        </span>
      </div>

      {/* Pill Filters + Search Button */}
      <div className="flex items-center gap-1.5 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 no-scrollbar">
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

        {/* Botón de búsqueda de movimientos al lado de Inversión */}
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen((prev) => !prev);
            if (isSearchOpen) setSearchQuery('');
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
            isSearchOpen || searchQuery
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
          }`}
          title="Buscar movimientos"
        >
          <Search className="h-3 w-3" />
          <span>Buscar</span>
        </button>
      </div>

      {/* Campo de búsqueda expandible (Liquid Glass) */}
      {isSearchOpen && (
        <div className="relative animate-fadeIn">
          <input
            type="text"
            placeholder="Buscar por concepto, comercio o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full rounded-2xl bg-white/[0.06] border border-white/15 pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 backdrop-blur-xl shadow-inner"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* List of items with Swipe-to-Delete and GPU viewport skipping (cv-auto) */}
      <div className="flex flex-col gap-2.5">
        {sourceScopedTransactions.length === 0 ? (
          <div className="py-10 px-5 text-center rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-400 shadow-inner">
              <Receipt className="h-6 w-6 text-slate-400 opacity-70" />
            </div>
            <div className="flex flex-col gap-1 max-w-xs">
              <p className="text-sm font-semibold text-white">
                {activeSource
                  ? `Sin movimientos en ${activeSource.name}`
                  : 'Sin movimientos registrados aún'}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeSource
                  ? 'Los movimientos asociados a esta cuenta aparecerán aquí al registrarlos con el botón (+).'
                  : 'Pulsa el botón central (+) para registrar tu primer ingreso o gasto.'}
              </p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs">
            {searchQuery
              ? `No se encontraron movimientos que coincidan con «${searchQuery}».`
              : `No hay movimientos de tipo ${selectedPillar} en esta cuenta.`}
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
                onEdit={onEditTransaction}
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
