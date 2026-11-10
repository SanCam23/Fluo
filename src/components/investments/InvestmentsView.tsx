import { useState, useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  PieChart,
  Clock,
  Layers,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { InvestmentAsset, AssetType, Transaction } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { getTransactionsForAsset } from '../../utils/finance';
import { WithdrawInvestmentModal } from './WithdrawInvestmentModal';
import { EditAssetModal } from './EditAssetModal';
import { QuickAddTransactionModal } from '../forms/QuickAddTransactionModal';
import { AssetCard, type ConsolidatedAssetGroup } from './AssetCard';

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
