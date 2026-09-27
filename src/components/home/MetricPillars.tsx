import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useFinancialSummary } from '../../store/useFinanceStore';
import { formatCompactCurrency } from '../../utils/currency';
import type { PillarType } from '../../types/finance';

interface MetricPillarsProps {
  selectedPillar: PillarType | 'all';
  onSelectPillar: (pillar: PillarType | 'all') => void;
}

export const MetricPillars: React.FC<MetricPillarsProps> = ({
  selectedPillar,
  onSelectPillar,
}) => {
  const summary = useFinancialSummary();

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* 1. Ingresos */}
      <button
        type="button"
        onClick={() => onSelectPillar(selectedPillar === 'income' ? 'all' : 'income')}
        className={`relative flex flex-col items-start p-3 rounded-2xl border backdrop-blur-xl transition-all duration-200 text-left cursor-pointer ${
          selectedPillar === 'income'
            ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
            : 'bg-white/[0.07] hover:bg-white/[0.11] border-white/[0.18] hover:border-white/30 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-semibold text-emerald-400">Ingresos</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="mt-1 text-base font-bold text-white tracking-tight">
          +{formatCompactCurrency(summary.totalIncome)}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">Mensual</span>
      </button>

      {/* 2. Gastos */}
      <button
        type="button"
        onClick={() => onSelectPillar(selectedPillar === 'expense' ? 'all' : 'expense')}
        className={`relative flex flex-col items-start p-3 rounded-2xl border backdrop-blur-xl transition-all duration-200 text-left cursor-pointer ${
          selectedPillar === 'expense'
            ? 'bg-rose-500/20 border-rose-500/50 shadow-lg shadow-rose-500/10'
            : 'bg-white/[0.07] hover:bg-white/[0.11] border-white/[0.18] hover:border-white/30 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-semibold text-rose-400">Gastos</span>
          <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
        </div>
        <span className="mt-1 text-base font-bold text-white tracking-tight">
          -{formatCompactCurrency(summary.totalExpense)}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">Mensual</span>
      </button>

      {/* 3. Inversiones */}
      <button
        type="button"
        onClick={() => onSelectPillar(selectedPillar === 'invest' ? 'all' : 'invest')}
        className={`relative flex flex-col items-start p-3 rounded-2xl border backdrop-blur-xl transition-all duration-200 text-left cursor-pointer ${
          selectedPillar === 'invest'
            ? 'bg-indigo-500/25 border-indigo-500/50 shadow-lg shadow-indigo-500/15'
            : 'bg-white/[0.07] hover:bg-white/[0.11] border-white/[0.18] hover:border-white/30 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-semibold text-indigo-300">Cartera</span>
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <span className="mt-1 text-base font-bold text-white tracking-tight">
          {formatCompactCurrency(summary.portfolioMarketValue)}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">En Activos</span>
      </button>
    </div>
  );
};
