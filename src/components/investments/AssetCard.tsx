import { memo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Pencil,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Wallet,
} from 'lucide-react';
import type { AssetType, InvestmentAsset, Transaction } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { SourceAvatar } from '../common/SourceAvatar';
import { formatCurrency, formatPercentage } from '../../utils/currency';

export const assetTypeLabels: Record<AssetType, string> = {
  stock: 'Acción',
  etf: 'ETF',
  index_fund: 'Fondo Indexado',
  crypto: 'Cripto',
  fixed_income: 'Renta Fija',
  deposit: 'Depósito',
};

export const assetTypeColors: Record<AssetType, string> = {
  stock: 'bg-blue-500/15 text-blue-300 border-blue-500/25 light:bg-blue-500/10 light:text-blue-700 light:border-blue-500/30',
  etf: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25 light:bg-indigo-500/10 light:text-indigo-700 light:border-indigo-500/30',
  index_fund: 'bg-purple-500/15 text-purple-300 border-purple-500/25 light:bg-purple-500/10 light:text-purple-700 light:border-purple-500/30',
  crypto: 'bg-amber-500/15 text-amber-300 border-amber-500/25 light:bg-amber-500/15 light:text-amber-800 light:border-amber-500/35',
  fixed_income: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 light:bg-emerald-500/10 light:text-emerald-700 light:border-emerald-500/30',
  deposit: 'bg-teal-500/15 text-teal-300 border-teal-500/25 light:bg-teal-500/10 light:text-teal-700 light:border-teal-500/30',
};

export interface ConsolidatedAssetGroup {
  key: string;
  primaryAsset: InvestmentAsset;
  shares: number;
  investedCost: number;
  averageBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  isProfit: boolean;
  contributions: Transaction[];
}

export interface AssetCardProps {
  group: ConsolidatedAssetGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (asset: InvestmentAsset) => void;
  onWithdraw: (asset: InvestmentAsset) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const AssetCard = memo(({
  group,
  isExpanded,
  onToggleExpand,
  onEdit,
  onWithdraw,
  onEditTransaction,
}: AssetCardProps) => {
  const {
    primaryAsset,
    shares,
    investedCost,
    averageBuyPrice,
    currentPrice,
    marketValue,
    pnl,
    pnlPercent,
    isProfit,
    contributions,
  } = group;

  const getSourceById = useFinanceStore((state) => state.getSourceById);

  const {
    offsetX,
    isSwiping,
    isPastLeftThreshold: isPastWithdrawThreshold,
    isPastRightThreshold: isPastEditThreshold,
    touchHandlers,
  } = useSwipeGesture({
    threshold: 80,
    maxDistance: 110,
    onSwipeLeft: () => onWithdraw(primaryAsset),
    onSwipeRight: () => onEdit(primaryAsset),
  });

  return (
    <div className="relative overflow-hidden rounded-3xl select-none transition-all duration-200">
      {/* Background revealed when swiping RIGHT (Edit) */}
      <div
        className={`absolute inset-0 flex items-center justify-start pl-6 rounded-3xl transition-colors duration-200 pointer-events-none ${
          isPastEditThreshold ? 'bg-indigo-600 text-white' : 'bg-indigo-500/80 text-indigo-100'
        } backdrop-blur-xl z-0`}
        style={{
          opacity: offsetX > 0 ? Math.min(1, Math.abs(offsetX) / 25) : 0,
          visibility: offsetX > 0 ? 'visible' : 'hidden',
        }}
      >
        <div
          className={`flex items-center gap-2 font-bold text-xs transition-transform duration-150 ${
            isPastEditThreshold ? 'scale-110' : 'scale-100'
          }`}
        >
          <Pencil className="h-4 w-4" />
          <span>{isPastEditThreshold ? 'Soltar para editar' : 'Editar posición'}</span>
        </div>
      </div>

      {/* Background revealed when swiping LEFT (Withdraw) */}
      <div
        className={`absolute inset-0 flex items-center justify-end pr-6 rounded-3xl transition-colors duration-200 pointer-events-none ${
          isPastWithdrawThreshold ? 'bg-emerald-600 text-white' : 'bg-emerald-500/80 text-emerald-100'
        } backdrop-blur-xl z-0`}
        style={{
          opacity: offsetX < 0 ? Math.min(1, Math.abs(offsetX) / 25) : 0,
          visibility: offsetX < 0 ? 'visible' : 'hidden',
        }}
      >
        <div
          className={`flex items-center gap-2 font-bold text-xs transition-transform duration-150 ${
            isPastWithdrawThreshold ? 'scale-110' : 'scale-100'
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>{isPastWithdrawThreshold ? 'Soltar para retirar' : 'Retirar fondos'}</span>
        </div>
      </div>

      {/* Sliding Foreground Card */}
      <div
        {...touchHandlers}
        onTouchCancel={touchHandlers.onTouchEnd}
        onClick={() => {
          if (!isSwiping && Math.abs(offsetX) < 5) {
            onToggleExpand();
          }
        }}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group relative p-4 rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col gap-3 shadow-lg cv-auto cursor-pointer z-10"
      >
        {/* Top row: Name, badges & Market Value */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
                {primaryAsset.name}
              </h4>
              {contributions.length > 1 && (
                <span
                  className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 shrink-0"
                  title={`${contributions.length} aportaciones registradas`}
                >
                  {contributions.length} aportaciones
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                  assetTypeColors[primaryAsset.assetType]
                }`}
              >
                {assetTypeLabels[primaryAsset.assetType]}
              </span>

              {primaryAsset.ticker && (
                <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                  {primaryAsset.ticker}
                </span>
              )}

              {primaryAsset.platform && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  • {primaryAsset.platform}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base font-extrabold text-white tracking-tight block">
              {formatCurrency(marketValue, primaryAsset.currency)}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {shares.toLocaleString('es-ES', { maximumFractionDigits: 4 })} uds
            </span>
          </div>
        </div>

        {/* Middle row: Buy Price, Current Price & P&L */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs items-start">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block truncate">Precio medio</span>
            <span className="font-semibold text-slate-300 block truncate">
              {formatCurrency(averageBuyPrice, primaryAsset.currency)}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
              Actual
              {primaryAsset.lastPriceUpdate && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Precio en vivo" />
              )}
            </span>
            <span className="font-semibold text-white block truncate">
              {formatCurrency(currentPrice, primaryAsset.currency)}
            </span>
          </div>

          <div className="text-right flex flex-col items-end min-w-0">
            <span className="text-[10px] text-slate-400 block truncate">Rentabilidad</span>
            <div
              className={`flex flex-col items-end sm:flex-row sm:items-center sm:justify-end sm:gap-1 font-bold ${
                isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <div className="inline-flex items-center gap-0.5 whitespace-nowrap">
                {isProfit ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
                <span>{isProfit ? '+' : ''}{formatCurrency(pnl, primaryAsset.currency)}</span>
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap">
                ({formatPercentage(pnlPercent)})
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Expand button + Desktop Hover Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
          <span className="text-slate-400">
            Coste: {formatCurrency(investedCost, primaryAsset.currency)}
          </span>

          <div className="flex items-center gap-2">
            {/* Desktop Action Buttons (hover revealed) */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw(primaryAsset);
                }}
                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                title="Retirar fondos o vender participaciones"
              >
                <ArrowDownRight className="h-3 w-3" />
                <span>Retirar</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(primaryAsset);
                }}
                className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                title="Editar posición"
              >
                <Pencil className="h-3 w-3" />
                <span>Editar</span>
              </button>
            </div>

            {/* Expand / Collapse Contribution History Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Ocultar historial' : 'Ver aportaciones'}</span>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Contribution History Drawer */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2.5 animate-fadeIn cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3 text-indigo-400" />
                Historial de aportaciones ({contributions.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Haz clic en una aportación para editarla
              </span>
            </div>

            {contributions.length === 0 ? (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs text-center flex flex-col items-center gap-1">
                <span>Posición consolidada inicial en cartera</span>
                <span className="text-[11px] text-slate-500">
                  {shares} títulos a coste medio de {formatCurrency(averageBuyPrice, primaryAsset.currency)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                {contributions.map((tx) => {
                  const source = tx.sourceId ? getSourceById(tx.sourceId) : undefined;
                  const isWithdrawal = tx.pillar === 'income';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction?.(tx)}
                      className="group/item flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isWithdrawal
                              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                              : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400'
                          }`}
                        >
                          {isWithdrawal ? (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {tx.concept}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5 text-slate-500" />
                              {new Date(tx.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>

                            {source ? (
                              <span className="flex items-center gap-1 text-slate-300">
                                <SourceAvatar source={source} size="xs" />
                                <span className="truncate max-w-[100px]">{source.name}</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10 text-slate-400">
                                <Wallet className="h-2.5 w-2.5 text-slate-500" />
                                Fondos externos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={`text-xs font-bold block ${
                            isWithdrawal ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isWithdrawal ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                        {tx.shares && tx.unitPrice ? (
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                            {tx.shares.toLocaleString('es-ES', { maximumFractionDigits: 4 })} uds @ {formatCurrency(tx.unitPrice)}
                          </span>
                        ) : null}
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[10px] text-indigo-400 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                          <Pencil className="h-2.5 w-2.5" />
                          <span>Editar</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';
