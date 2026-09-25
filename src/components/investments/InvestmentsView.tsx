import React, { useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { AssetType } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';

export const InvestmentsView: React.FC = () => {
  const assets = useFinanceStore((state) => state.assets);
  const isLiveUpdating = useFinanceStore((state) => state.isLiveUpdating);
  const refreshAllAssetPrices = useFinanceStore((state) => state.refreshAllAssetPrices);

  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');

  // Compute portfolio metrics
  let totalCost = 0;
  let totalValue = 0;

  assets.forEach((asset) => {
    totalCost += asset.shares * asset.averageBuyPrice;
    totalValue += asset.shares * asset.currentPrice;
  });

  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const filteredAssets = assets.filter((asset) => {
    if (selectedType === 'all') return true;
    return asset.assetType === selectedType;
  });

  const assetTypeLabels: Record<string, string> = {
    all: 'Todos',
    etf: 'ETFs',
    stock: 'Acciones',
    index_fund: 'Fondos',
    crypto: 'Cripto',
    fixed_income: 'Renta Fija',
    deposit: 'Depósitos',
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Portfolio Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Valor de Cartera
          </span>
          <button
            type="button"
            onClick={() => refreshAllAssetPrices()}
            disabled={isLiveUpdating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3 w-3 ${isLiveUpdating ? 'animate-spin' : ''}`} />
            <span>{isLiveUpdating ? 'Actualizando...' : 'Cotización en vivo'}</span>
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {formatCurrency(totalValue)}
          </span>
        </div>

        {/* PnL Sub-pill */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              totalPnL >= 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            {totalPnL >= 0 ? '+' : ''}
            {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercent)})
          </span>
          <span className="text-xs text-slate-400">
            Coste base: {formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Filter Chips by Asset Class */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'etf', 'stock', 'index_fund', 'crypto', 'fixed_income', 'deposit'] as const).map(
          (type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600/80 text-white border border-indigo-400/40 shadow-sm'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
                }`}
              >
                {assetTypeLabels[type]}
              </button>
            );
          }
        )}
      </div>

      {/* Assets List */}
      <div className="flex flex-col gap-2.5">
        {filteredAssets.map((asset) => {
          const marketValue = asset.shares * asset.currentPrice;
          const investedCost = asset.shares * asset.averageBuyPrice;
          const pnl = marketValue - investedCost;
          const pnlPercent = investedCost > 0 ? (pnl / investedCost) * 100 : 0;

          return (
            <div
              key={asset.id}
              className="relative p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col gap-2"
            >
              {/* Top row: Name & Ticker/ISIN badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {asset.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-medium text-slate-300 border border-white/10">
                      {asset.identifier}
                    </span>
                    {asset.platform && (
                      <span className="text-[11px] text-slate-400">
                        {asset.platform}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block">
                    {formatCurrency(marketValue, asset.currency)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pnl >= 0 ? '+' : ''}
                    {formatPercentage(pnlPercent)}
                  </span>
                </div>
              </div>

              {/* Bottom details row */}
              <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {asset.shares} títulos @ {formatCurrency(asset.averageBuyPrice, asset.currency)} (PMCP)
                </span>
                <span className="text-[10px] text-slate-500">
                  {asset.lastUpdated}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
