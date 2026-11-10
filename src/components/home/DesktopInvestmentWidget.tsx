import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, PieChart, ChevronRight, Coins } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { isInvestmentSource, getAssetsForSource } from '../../utils/finance';

export const DesktopInvestmentWidget: React.FC = () => {
  const assets = useFinanceStore((state) => state.assets);
  const sources = useFinanceStore((state) => state.sources);
  const transactions = useFinanceStore((state) => state.transactions);
  const activeSourceId = useFinanceStore((state) => state.activeSourceId);
  const setActiveTab = useFinanceStore((state) => state.setActiveTab);

  const activeSource = useMemo(
    () => (activeSourceId ? sources.find((s) => s.id === activeSourceId) || null : null),
    [sources, activeSourceId]
  );
  const isInvestAccount = Boolean(activeSource && isInvestmentSource(activeSource));

  const scopedAssets = useMemo(() => {
    if (!isInvestAccount || !activeSource) return assets;
    const holdings = getAssetsForSource(activeSource, transactions, assets);
    return holdings.map((h) => ({
      ...h.asset,
      shares: h.shares,
      averageBuyPrice: h.averageBuyPrice,
    }));
  }, [isInvestAccount, activeSource, transactions, assets]);

  const { totalCost, totalValue, totalPnL, totalPnLPercent, isProfit } = useMemo(() => {
    let cost = 0;
    let val = 0;
    scopedAssets.forEach((a) => {
      const fee = a.initialFee || 0;
      cost += a.shares * a.averageBuyPrice + fee;
      val += a.shares * a.currentPrice;
    });
    const pnl = val - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    return {
      totalCost: cost,
      totalValue: val,
      totalPnL: pnl,
      totalPnLPercent: pnlPct,
      isProfit: pnl >= 0,
    };
  }, [scopedAssets]);

  const topAssets = useMemo(() => {
    return [...scopedAssets]
      .sort((a, b) => b.shares * b.currentPrice - a.shares * a.currentPrice)
      .slice(0, 3);
  }, [assets]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
            <PieChart className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider">
            {isInvestAccount && activeSource ? `Cartera en ${activeSource.name}` : 'Cartera de Inversiones'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('invest')}
          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer transition-colors"
        >
          <span>Ver todo</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center gap-1.5">
          <Coins className="h-6 w-6 text-slate-500 opacity-60" />
          <p className="text-xs font-semibold text-slate-300">Sin activos registrados</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Registra tus fondos, acciones o criptos con el botón central (+)
          </p>
        </div>
      ) : (
        <>
          {/* Main Portfolio Value & P&L */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Valor Actual de Mercado
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black tracking-tight text-white light:text-slate-900">
                {formatCurrency(totalValue)}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isProfit
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isProfit ? '+' : ''}{formatPercentage(totalPnLPercent)}</span>
              </span>
            </div>
          </div>

          {/* Submetrics Row */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Capital Invertido</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 truncate">
                {formatCurrency(totalCost)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">P&L No Realizado</span>
              <span
                className={`text-xs font-bold mt-0.5 truncate ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
              </span>
            </div>
          </div>

          {/* Top Holdings Mini List */}
          {topAssets.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Principales Posiciones ({assets.length})
              </span>
              {topAssets.map((asset) => {
                const aVal = asset.shares * asset.currentPrice;
                const aCost = asset.shares * asset.averageBuyPrice;
                const aPnL = aVal - aCost;
                const aIsProfit = aPnL >= 0;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setActiveTab('invest')}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 mr-2">
                      <span className="text-xs font-semibold text-white truncate block">
                        {asset.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {asset.identifier}
                      </span>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(aVal, asset.currency)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          aIsProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {aIsProfit ? '+' : ''}{formatCurrency(aPnL, asset.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
