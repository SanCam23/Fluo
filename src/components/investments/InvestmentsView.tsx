import { useState, useMemo, useEffect, memo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  PieChart,
  Coins,
  Clock,
  Building2,
  Layers,
  Pencil,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { InvestmentAsset, AssetType, Transaction } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { getTransactionsForAsset } from '../../utils/finance';
import { WithdrawInvestmentModal } from './WithdrawInvestmentModal';
import { EditAssetModal } from './EditAssetModal';
import { QuickAddTransactionModal } from '../forms/QuickAddTransactionModal';
import { SourceAvatar } from '../common/SourceAvatar';

const assetTypeLabels: Record<AssetType, string> = {
  stock: 'Acción',
  etf: 'ETF',
  index_fund: 'Fondo Indexado',
  crypto: 'Cripto',
  fixed_income: 'Renta Fija',
  deposit: 'Depósito',
};

const assetTypeColors: Record<AssetType, string> = {
  stock: 'bg-blue-500/15 text-blue-300 border-blue-500/25 light:bg-blue-500/10 light:text-blue-700 light:border-blue-500/30',
  etf: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25 light:bg-indigo-500/10 light:text-indigo-700 light:border-indigo-500/30',
  index_fund: 'bg-purple-500/15 text-purple-300 border-purple-500/25 light:bg-purple-500/10 light:text-purple-700 light:border-purple-500/30',
  crypto: 'bg-amber-500/15 text-amber-300 border-amber-500/25 light:bg-amber-500/15 light:text-amber-800 light:border-amber-500/35',
  fixed_income: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 light:bg-emerald-500/10 light:text-emerald-700 light:border-emerald-500/30',
  deposit: 'bg-teal-500/15 text-teal-300 border-teal-500/25 light:bg-teal-500/10 light:text-teal-700 light:border-teal-500/30',
};

interface ConsolidatedAssetGroup {
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

interface AssetCardProps {
  group: ConsolidatedAssetGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (asset: InvestmentAsset) => void;
  onWithdraw: (asset: InvestmentAsset) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

const AssetCard = memo(({
  group,
  isExpanded,
  onToggleExpand,
  onEdit,
  onWithdraw,
  onEditTransaction,
}: AssetCardProps) => {
  const { primaryAsset, shares, investedCost, averageBuyPrice, currentPrice, marketValue, pnl, pnlPercent, isProfit, contributions } = group;
  const getSourceById = useFinanceStore((state) => state.getSourceById);

  // Swipe gesture state
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const currentOffset = useRef(0);
  const didDrag = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isHorizontal.current = null;
    currentOffset.current = 0;
    didDrag.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const diffX = touch.clientX - startX.current;
    const diffY = touch.clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontal.current) {
      didDrag.current = true;
      if (diffX < 0) {
        // Swiping Left -> Retirada
        const clamped = diffX < -110 ? -110 + (diffX + 110) * 0.35 : diffX;
        currentOffset.current = clamped;
        setOffsetX(clamped);
      } else {
        // Swiping Right -> Editar
        const clamped = diffX > 110 ? 110 + (diffX - 110) * 0.35 : diffX;
        currentOffset.current = clamped;
        setOffsetX(clamped);
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentOffset.current <= -80) {
      setOffsetX(0);
      currentOffset.current = 0;
      onWithdraw(primaryAsset);
    } else if (currentOffset.current >= 80) {
      setOffsetX(0);
      currentOffset.current = 0;
      onEdit(primaryAsset);
    } else {
      setOffsetX(0);
      currentOffset.current = 0;
    }
    isHorizontal.current = null;
  };

  const isPastEditThreshold = offsetX >= 80;
  const isPastWithdrawThreshold = offsetX <= -80;

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={() => {
          if (!didDrag.current) {
            onToggleExpand();
          }
        }}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isHorizontal.current ? 'none' : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
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
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 shrink-0" title={`${contributions.length} aportaciones registradas`}>
                  {contributions.length} aportaciones
                </span>
              )}
            </div>

            {/* Metadata Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-white/10 light:bg-indigo-50/80 text-[10px] font-mono font-bold text-indigo-200 light:text-indigo-800 border border-white/15 light:border-indigo-200/80">
                {primaryAsset.identifier}
              </span>

              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  assetTypeColors[primaryAsset.assetType]
                }`}
              >
                {assetTypeLabels[primaryAsset.assetType]}
              </span>

              {primaryAsset.platform && (
                <span className="text-[10px] text-slate-400 light:text-slate-600 flex items-center gap-0.5">
                  <Building2 className="h-2.5 w-2.5 text-slate-500 light:text-slate-600" />
                  {primaryAsset.platform}
                </span>
              )}

              {primaryAsset.isOfflineCached && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 light:bg-amber-50 light:text-amber-800 light:border-amber-300 text-[10px] font-semibold flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Dato offline
                </span>
              )}

              {primaryAsset.quoteTicker && primaryAsset.quoteTicker !== primaryAsset.identifier && (
                <span
                  className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 text-[10px] font-mono"
                  title={`Cotización activa vía ticker de referencia: ${primaryAsset.quoteTicker}`}
                >
                  Ref: {primaryAsset.quoteTicker}
                </span>
              )}
            </div>
          </div>

          {/* Market Value & P&L Badge */}
          <div className="text-right flex-shrink-0">
            <span className="text-base font-extrabold text-white block">
              {formatCurrency(marketValue, primaryAsset.currency)}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 backdrop-blur-md border shadow-sm transition-all ${
                isProfit
                  ? 'bg-emerald-500/15 text-emerald-400 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/15 text-rose-400 light:bg-rose-50 light:text-rose-700 light:border-rose-200 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              }`}
            >
              {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isProfit ? '+' : ''}{formatPercentage(pnlPercent)}</span>
              <span className="font-normal opacity-90">
                ({isProfit ? '+' : ''}{formatCurrency(pnl, primaryAsset.currency)})
              </span>
            </span>
          </div>
        </div>

        {/* Bottom details & calculation breakdown */}
        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-[11px]">
            <span>
              Invertido: <strong className="text-slate-300 font-semibold">{formatCurrency(investedCost, primaryAsset.currency)}</strong>
              {' '}({shares.toLocaleString('es-ES', { maximumFractionDigits: 6 })} uds @ {formatCurrency(averageBuyPrice, primaryAsset.currency)})
            </span>
            {primaryAsset.initialFee && primaryAsset.initialFee > 0 && (
              <span className="text-[10px] text-slate-500">
                • Comis: {formatCurrency(primaryAsset.initialFee, primaryAsset.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Coins className="h-3 w-3 text-slate-400" />
                Cotiz:{' '}
                <strong className="text-white font-semibold">
                  {formatCurrency(currentPrice, primaryAsset.currency)}
                </strong>
              </span>
              {primaryAsset.change24h !== undefined && (
                <span
                  className={`text-[10px] font-bold block ${
                    primaryAsset.change24h >= 0 ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
                  }`}
                >
                  {primaryAsset.change24h >= 0 ? '+' : ''}{formatPercentage(primaryAsset.change24h)} 24h
                </span>
              )}
            </div>

            {/* Desktop Action Buttons (Pencil & Withdraw) */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onEdit(primaryAsset)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-all cursor-pointer"
                title="Editar posición"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onWithdraw(primaryAsset)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
                title="Retirar fondos a una cuenta"
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleExpand}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer ml-0.5"
                title={isExpanded ? 'Ocultar historial de aportaciones' : 'Ver todas las aportaciones a este índice'}
              >
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Breakdown Drawer: All contributions to this index */}
        {isExpanded && (
          <div
            className="pt-3 border-t border-white/10 mt-1 flex flex-col gap-2.5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
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

export const InvestmentsView: React.FC = () => {
  const {
    assets,
    transactions,
    reconcileInvestments,
    isLiveUpdating,
    refreshAllAssetPrices,
    syncStaleAssetQuotes,
    lastSyncTimestamp,
  } = useFinanceStore(
    useShallow((state) => ({
      assets: state.assets,
      transactions: state.transactions,
      reconcileInvestments: state.reconcileInvestments,
      isLiveUpdating: state.isLiveUpdating,
      refreshAllAssetPrices: state.refreshAllAssetPrices,
      syncStaleAssetQuotes: state.syncStaleAssetQuotes,
      lastSyncTimestamp: state.lastSyncTimestamp,
    }))
  );

  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');
  const [expandedAssetKeys, setExpandedAssetKeys] = useState<Set<string>>(new Set());

  // Modal states
  const [assetToWithdraw, setAssetToWithdraw] = useState<InvestmentAsset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<InvestmentAsset | null>(null);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedAssetKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Auto-reconcile investments if ledger contains invest transactions
  useEffect(() => {
    const hasInvestTransactions = transactions.some((t) => t.pillar === 'invest');
    if (hasInvestTransactions) {
      reconcileInvestments();
    }
  }, [transactions, reconcileInvestments]);

  // Trigger silent synchronization for stale quotes (> 6h) when viewing investments
  useEffect(() => {
    syncStaleAssetQuotes(6);
  }, [syncStaleAssetQuotes]);

  // Consolidate assets sharing the same identifier / ISIN into a single visual card
  const consolidatedGroups: ConsolidatedAssetGroup[] = useMemo(() => {
    const groupMap = new Map<string, { primaryAsset: InvestmentAsset; all: InvestmentAsset[] }>();

    assets.forEach((asset) => {
      const cleanIdent = (asset.isin || asset.identifier || asset.name).trim().toUpperCase();
      const existing = groupMap.get(cleanIdent);
      if (existing) {
        existing.all.push(asset);
      } else {
        groupMap.set(cleanIdent, { primaryAsset: asset, all: [asset] });
      }
    });

    const groups: ConsolidatedAssetGroup[] = [];

    groupMap.forEach(({ primaryAsset, all }, key) => {
      let totalShares = 0;
      let totalInvestedCost = 0;

      all.forEach((a) => {
        const sh = Number(a.shares) || 0;
        const bp = Number(a.averageBuyPrice) || 0;
        const fee = Number(a.initialFee) || 0;
        totalShares += sh;
        totalInvestedCost += sh * bp + fee;
      });

      const weightedAvgBuyPrice = totalShares > 0 ? totalInvestedCost / totalShares : primaryAsset.averageBuyPrice;
      const curPrice = primaryAsset.currentPrice || weightedAvgBuyPrice;
      const marketVal = totalShares * curPrice;
      const pnl = marketVal - totalInvestedCost;
      const pnlPercent = totalInvestedCost > 0 ? (pnl / totalInvestedCost) * 100 : 0;
      const contributions = getTransactionsForAsset(primaryAsset, transactions);

      groups.push({
        key,
        primaryAsset: {
          ...primaryAsset,
          shares: totalShares,
          averageBuyPrice: weightedAvgBuyPrice,
          currentValue: marketVal,
          pnl,
          pnlPercentage: pnlPercent,
        },
        shares: totalShares,
        investedCost: totalInvestedCost,
        averageBuyPrice: weightedAvgBuyPrice,
        currentPrice: curPrice,
        marketValue: marketVal,
        pnl,
        pnlPercent,
        isProfit: pnl >= 0,
        contributions,
      });
    });

    return groups;
  }, [assets, transactions]);

  // Compute portfolio metrics (memoized)
  const { totalCost, totalValue, totalPnL, totalPnLPercent, isOverallProfit } = useMemo(() => {
    let cost = 0;
    let val = 0;
    consolidatedGroups.forEach((g) => {
      cost += g.investedCost;
      val += g.marketValue;
    });
    const pnl = val - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
    return {
      totalCost: cost,
      totalValue: val,
      totalPnL: pnl,
      totalPnLPercent: pnlPercent,
      isOverallProfit: pnl >= 0,
    };
  }, [consolidatedGroups]);

  const filteredGroups = useMemo(() => {
    if (selectedType === 'all') return consolidatedGroups;
    return consolidatedGroups.filter((g) => g.primaryAsset.assetType === selectedType);
  }, [consolidatedGroups, selectedType]);

  const assetTypeTabs: { type: AssetType | 'all'; label: string }[] = [
    { type: 'all', label: 'Todos' },
    { type: 'stock', label: 'Acciones' },
    { type: 'etf', label: 'ETFs' },
    { type: 'index_fund', label: 'Fondos' },
    { type: 'crypto', label: 'Cripto' },
    { type: 'fixed_income', label: 'Renta Fija' },
    { type: 'deposit', label: 'Depósitos' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Portfolio Header Card with Liquid Glass */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Header Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 light:text-slate-600 flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-indigo-400 light:text-indigo-600" />
              Valoración Total Cartera
            </span>
            {lastSyncTimestamp && (
              <span className="text-[10px] text-slate-400 light:text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5 text-indigo-400 light:text-indigo-600" />
                Sincronizado: {lastSyncTimestamp}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshAllAssetPrices()}
              disabled={isLiveUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 light:text-indigo-700 light:bg-indigo-50 light:border-indigo-300 hover:light:bg-indigo-100 border border-indigo-500/30 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
              title="Actualizar cotizaciones oficiales en vivo"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLiveUpdating ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">{isLiveUpdating ? 'Actualizando...' : 'Cotizaciones'}</span>
            </button>
          </div>
        </div>

        {/* Main Valuation Display */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formatCurrency(totalValue)}
          </span>
        </div>

        {/* Global Metrics Cards (Responsive 2 cols on mobile, 4 cols on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4 mt-4 pt-3.5 border-t border-white/10">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 light:text-slate-600 block truncate">
              Patrimonio Invertido
            </span>
            <span className="text-base lg:text-lg font-bold text-slate-200 light:text-slate-800 block mt-1 truncate">
              {formatCurrency(totalCost)}
            </span>
            <span className="text-[11px] text-slate-400 light:text-slate-500 font-medium block mt-0.5 truncate">
              Coste base total
            </span>
          </div>

          <div
            className={`p-3 sm:p-3.5 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between min-w-0 ${
              isOverallProfit
                ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)] light:bg-emerald-50/70 light:border-emerald-200'
                : 'bg-rose-500/10 border-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.15)] light:bg-rose-50/70 light:border-rose-200'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 light:text-slate-600 block truncate">
              P&L Total No Realizado
            </span>
            <span
              className={`text-base lg:text-lg font-bold tracking-tight block mt-1 truncate ${
                isOverallProfit ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
              }`}
            >
              {isOverallProfit ? '+' : ''}{formatCurrency(totalPnL)}
            </span>
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 truncate ${
                isOverallProfit ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
              }`}
            >
              {isOverallProfit ? <TrendingUp className="h-3 w-3 flex-shrink-0" /> : <TrendingDown className="h-3 w-3 flex-shrink-0" />}
              <span className="truncate">{formatPercentage(totalPnLPercent)}</span>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 light:text-slate-600 block truncate">
              Posiciones Únicas
            </span>
            <span className="text-xs sm:text-sm lg:text-base font-bold text-white light:text-slate-800 block mt-1 whitespace-nowrap truncate tracking-tight">
              {consolidatedGroups.length} {consolidatedGroups.length === 1 ? 'índice/activo' : 'índices/activos'}
            </span>
            <span className="text-[11px] text-slate-400 light:text-slate-500 font-medium block mt-0.5 truncate">
              En cartera
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 light:text-slate-600 block truncate">
              Rentabilidad Global
            </span>
            <span
              className={`text-base lg:text-lg font-bold tracking-tight block mt-1 truncate ${
                isOverallProfit ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
              }`}
            >
              {isOverallProfit ? '+' : ''}{formatPercentage(totalPnLPercent)}
            </span>
            <span className="text-[11px] text-slate-400 light:text-slate-500 font-medium block mt-0.5 truncate">
              ROI de cartera
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Asset Class */}
      <div className="flex items-center gap-1.5 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1 no-scrollbar">
        {assetTypeTabs.map((tab) => {
          const isSelected = selectedType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setSelectedType(tab.type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600/80 text-white border border-indigo-400/50 shadow-md font-semibold light:bg-indigo-600 light:text-white'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 light:text-slate-700 light:bg-white/80 light:border-slate-300/80 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assets List (1 col on mobile, 2 cols on PC) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {consolidatedGroups.length === 0 ? (
          <div className="lg:col-span-2 py-12 px-5 text-center rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-3 shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PieChart className="h-7 w-7 text-indigo-400 opacity-80" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-xs">
              <h3 className="text-sm font-bold text-white">Tu cartera está vacía</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Añade tus acciones, ETFs o fondos para seguir su rentabilidad en tiempo real.
              </p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="lg:col-span-2 py-10 px-4 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs flex flex-col items-center gap-1.5">
            <Layers className="h-6 w-6 text-slate-500 opacity-60 mb-0.5" />
            <p className="font-semibold text-slate-300">No tienes activos registrados en esta categoría.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <AssetCard
              key={group.key}
              group={group}
              isExpanded={expandedAssetKeys.has(group.key)}
              onToggleExpand={() => toggleExpand(group.key)}
              onEdit={(asset) => setAssetToEdit(asset)}
              onWithdraw={(asset) => setAssetToWithdraw(asset)}
              onEditTransaction={(tx) => setTxToEdit(tx)}
            />
          ))
        )}
      </div>

      {/* Withdraw Modal */}
      <WithdrawInvestmentModal
        isOpen={!!assetToWithdraw}
        onClose={() => setAssetToWithdraw(null)}
        asset={assetToWithdraw}
      />

      {/* Edit Position Modal */}
      <EditAssetModal
        isOpen={!!assetToEdit}
        onClose={() => setAssetToEdit(null)}
        asset={assetToEdit}
      />

      {/* Edit Transaction Modal (for individual contributions) */}
      {txToEdit && (
        <QuickAddTransactionModal
          isOpen={!!txToEdit}
          onClose={() => setTxToEdit(null)}
          editingTransaction={txToEdit}
        />
      )}
    </div>
  );
};
