import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { useFinanceStore, useFinancialSummary } from '../../store/useFinanceStore';
import { formatCurrency, formatPercentage } from '../../utils/currency';

export const HeroBalance: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  const summary = useFinancialSummary();
  const isLiveUpdating = useFinanceStore((state) => state.isLiveUpdating);
  const refreshAllAssetPrices = useFinanceStore((state) => state.refreshAllAssetPrices);

  const formattedBalance = formatCurrency(summary.netBalance);
  const [integerPart, decimalPart] = formattedBalance.split(',');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-6 shadow-2xl shadow-black/50">
      {/* Specular hairline top reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Header row: Label, Live refresh, Privacy toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Patrimonio Neto Total
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refresh live prices button */}
          <button
            type="button"
            onClick={() => refreshAllAssetPrices()}
            disabled={isLiveUpdating}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Actualizar cotizaciones en vivo"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLiveUpdating ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Privacy toggle */}
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={showBalance ? 'Ocultar balance' : 'Mostrar balance'}
          >
            {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Big Number */}
      <div className="mt-3 flex items-baseline gap-1">
        {showBalance ? (
          <>
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {integerPart}
            </span>
            {decimalPart && (
              <span className="text-2xl font-bold text-slate-300">
                ,{decimalPart}
              </span>
            )}
          </>
        ) : (
          <span className="text-3xl font-extrabold tracking-widest text-slate-400">
            •••••••• €
          </span>
        )}
      </div>

      {/* Bottom Sub-Metrics: Savings rate & Unrealized PnL */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        {/* Savings Rate */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Tasa de ahorro:</span>
          <span className="font-semibold text-emerald-400">
            {formatPercentage(summary.savingsRate, false)}
          </span>
        </div>

        {/* Portfolio Return */}
        <div className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-slate-400">Rendimiento:</span>
          <span
            className={`font-semibold ${
              summary.unrealizedPnL >= 0 ? 'text-indigo-300' : 'text-rose-400'
            }`}
          >
            {summary.unrealizedPnL >= 0 ? '+' : ''}
            {formatCurrency(summary.unrealizedPnL)} ({formatPercentage(summary.unrealizedPnLPercentage)})
          </span>
        </div>
      </div>
    </div>
  );
};
