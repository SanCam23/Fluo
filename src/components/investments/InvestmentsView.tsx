import { useState, useMemo, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  PieChart,
  Coins,
  Clock,
  Trash2,
  Building2,
  Layers,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { InvestmentAsset, AssetType } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';

const assetTypeLabels: Record<AssetType, string> = {
  stock: 'Acción',
  etf: 'ETF',
  index_fund: 'Fondo Indexado',
  crypto: 'Cripto',
  fixed_income: 'Renta Fija',
  deposit: 'Depósito',
};

const assetTypeColors: Record<AssetType, string> = {
  stock: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  etf: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  index_fund: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  crypto: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  fixed_income: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  deposit: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
};

interface AssetCardProps {
  asset: InvestmentAsset;
  onDelete: (id: string) => void;
}

const AssetCard = memo(({ asset, onDelete }: AssetCardProps) => {
  const investedCost = asset.shares * asset.averageBuyPrice + (asset.initialFee || 0);
  const marketValue = asset.shares * asset.currentPrice;
  const pnl = marketValue - investedCost;
  const pnlPercent = investedCost > 0 ? (pnl / investedCost) * 100 : 0;
  const isProfit = pnl >= 0;

  return (
    <div className="group relative p-4 rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col gap-3 shadow-lg cv-auto">
      {/* Top row: Name, badges & Market Value */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
            {asset.name}
          </h4>

          {/* Metadata Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-bold text-indigo-200 border border-white/15">
              {asset.identifier}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                assetTypeColors[asset.assetType]
              }`}
            >
              {assetTypeLabels[asset.assetType]}
            </span>

            {asset.platform && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Building2 className="h-2.5 w-2.5 text-slate-500" />
                {asset.platform}
              </span>
            )}

            {asset.isOfflineCached && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                Dato offline / en caché
              </span>
            )}
          </div>
        </div>

        {/* Market Value & P&L Badge */}
        <div className="text-right flex-shrink-0">
          <span className="text-base font-extrabold text-white block">
            {formatCurrency(marketValue, asset.currency)}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 backdrop-blur-md border shadow-sm transition-all ${
              isProfit
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
            }`}
          >
            {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isProfit ? '+' : ''}{formatPercentage(pnlPercent)}</span>
            <span className="font-normal opacity-90">
              ({isProfit ? '+' : ''}{formatCurrency(pnl, asset.currency)})
            </span>
          </span>
        </div>
      </div>

      {/* Bottom details & calculation breakdown */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-[11px]">
          <span>
            Invertido: <strong className="text-slate-300 font-semibold">{formatCurrency(investedCost, asset.currency)}</strong>
            {' '}({asset.shares} uds @ {formatCurrency(asset.averageBuyPrice, asset.currency)})
          </span>
          {asset.initialFee && asset.initialFee > 0 && (
            <span className="text-[10px] text-slate-500">
              • Comis: {formatCurrency(asset.initialFee, asset.currency)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="h-3 w-3 text-slate-400" />
              Cotiz:{' '}
              <strong className="text-white font-semibold">
                {formatCurrency(asset.currentPrice, asset.currency)}
              </strong>
            </span>
            {asset.change24h !== undefined && (
              <span
                className={`text-[10px] font-bold block ${
                  asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {asset.change24h >= 0 ? '+' : ''}{formatPercentage(asset.change24h)} 24h
              </span>
            )}
          </div>

          {/* Delete action button */}
          <button
            type="button"
            onClick={() => onDelete(asset.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            title="Eliminar activo de la cartera"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';

export const InvestmentsView: React.FC = () => {
  const { assets, isLiveUpdating, refreshAllAssetPrices, deleteAsset, lastSyncTimestamp } =
    useFinanceStore(
      useShallow((state) => ({
        assets: state.assets,
        isLiveUpdating: state.isLiveUpdating,
        refreshAllAssetPrices: state.refreshAllAssetPrices,
        deleteAsset: state.deleteAsset,
        lastSyncTimestamp: state.lastSyncTimestamp,
      }))
    );

  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all');

  // Compute portfolio metrics (memoized)
  const { totalCost, totalValue, totalPnL, totalPnLPercent, isOverallProfit } = useMemo(() => {
    let cost = 0;
    let val = 0;
    assets.forEach((asset) => {
      const fee = asset.initialFee || 0;
      cost += asset.shares * asset.averageBuyPrice + fee;
      val += asset.shares * asset.currentPrice;
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
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (selectedType === 'all') return assets;
    return assets.filter((asset) => asset.assetType === selectedType);
  }, [assets, selectedType]);

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
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-indigo-400" />
              Valoración Total Cartera
            </span>
            {lastSyncTimestamp && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5 text-indigo-400" />
                Sincronizado: {lastSyncTimestamp}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshAllAssetPrices()}
              disabled={isLiveUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
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

        {/* Global Metrics Dual Card (Patrimonio Total Invertido & Plusvalía/Minusvalía Real) */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Patrimonio Invertido
            </span>
            <span className="text-base font-bold text-slate-200 block mt-1">
              {formatCurrency(totalCost)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              Coste base total
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between ${
              isOverallProfit
                ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-rose-500/10 border-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              P&L Total No Realizado
            </span>
            <span
              className={`text-base font-bold tracking-tight block mt-1 ${
                isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isOverallProfit ? '+' : ''}{formatCurrency(totalPnL)}
            </span>
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isOverallProfit ? <TrendingUp className="h-3 w-3 flex-shrink-0" /> : <TrendingDown className="h-3 w-3 flex-shrink-0" />}
              <span>{formatPercentage(totalPnLPercent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Asset Class */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {assetTypeTabs.map((tab) => {
          const isSelected = selectedType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setSelectedType(tab.type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600/80 text-white border border-indigo-400/50 shadow-md font-semibold'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assets List */}
      <div className="flex flex-col gap-3">
        {assets.length === 0 ? (
          <div className="py-12 px-5 text-center rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-3 shadow-xl">
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
        ) : filteredAssets.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-xs flex flex-col items-center gap-1.5">
            <Layers className="h-6 w-6 text-slate-500 opacity-60 mb-0.5" />
            <p className="font-semibold text-slate-300">No tienes activos registrados en esta categoría.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onDelete={deleteAsset} />
          ))
        )}
      </div>
    </div>
  );
};
