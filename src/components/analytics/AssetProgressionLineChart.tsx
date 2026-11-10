import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Coins,
  Filter,
  Sparkles,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { InvestmentAsset, Transaction, AssetSeriesMeta } from '../../types/finance';
import { formatCurrency, formatPercentage, formatAxisCurrency } from '../../utils/currency';
import { computeAssetProgressionSeries } from '../../utils/finance';

interface AssetProgressionLineChartProps {
  assets: InvestmentAsset[];
  transactions: Transaction[];
  title?: string;
  subtitle?: string;
  className?: string;
  defaultTimeRange?: '3m' | '6m' | '1y' | 'all';
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  all: 'Todos',
  etf: 'ETFs',
  crypto: 'Cripto / Monedas',
  stock: 'Acciones',
  index_fund: 'Fondos Indexados',
  fixed_income: 'Renta Fija',
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
  assetsMeta: AssetSeriesMeta[];
  chartMode: 'value' | 'cost' | 'pnl';
}

const AssetProgressionTooltip: React.FC<TooltipProps> = ({
  active,
  payload,
  label,
  assetsMeta,
  chartMode,
}) => {
  if (active && payload && payload.length) {
    const metaMap = new Map(assetsMeta.map((m) => [m.dataKey, m]));
    const costMap = new Map(assetsMeta.map((m) => [`${m.dataKey}_cost`, m]));

    // Sort entries by value descending
    const sortedEntries = [...payload]
      .filter((entry) => typeof entry.value === 'number')
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const totalVal = sortedEntries.reduce((sum, e) => sum + (e.value || 0), 0);

    return (
      <div className="rounded-2xl bg-[#0F1626]/95 light:bg-white/95 border border-white/20 light:border-slate-300/80 p-3.5 shadow-2xl backdrop-blur-2xl text-xs flex flex-col gap-2 z-50 min-w-[200px] max-w-[280px]">
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-1.5">
          <span className="font-bold text-slate-200 light:text-slate-800">{label}</span>
          <span className="text-[10px] font-semibold text-indigo-300 light:text-indigo-600 bg-indigo-500/15 light:bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-500/30 light:border-indigo-200">
            {chartMode === 'cost' ? 'Total Invertido' : chartMode === 'pnl' ? 'Rentabilidad' : 'Total Cartera'}: {formatCurrency(totalVal)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {sortedEntries.map((entry, idx) => {
            const meta = metaMap.get(entry.dataKey || '') || costMap.get(entry.dataKey || '');
            const color = entry.color || meta?.color || '#818CF8';
            const name = meta?.name || entry.name || 'Activo';
            const ticker = meta?.ticker ? `(${meta.ticker})` : '';

            return (
              <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 light:text-slate-700 font-medium truncate">
                    {name} {ticker}
                  </span>
                </div>
                <span className="font-bold text-white light:text-slate-900 flex-shrink-0 whitespace-nowrap">
                  {chartMode === 'pnl' ? `${(entry.value || 0).toFixed(2)}%` : formatCurrency(entry.value || 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const AssetProgressionLineChart: React.FC<AssetProgressionLineChartProps> = ({
  assets,
  transactions,
  title = 'Progresión por Activo (ETFs, Monedas, Acciones)',
  subtitle = 'Evolución cronológica de cada posición en cartera',
  className = '',
  defaultTimeRange = '6m',
}) => {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>(defaultTimeRange);
  const [chartMode, setChartMode] = useState<'value' | 'cost'>('value');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [visibleAssetIds, setVisibleAssetIds] = useState<Set<string>>(() => new Set());
  const [hasCustomVisibility, setHasCustomVisibility] = useState<boolean>(false);

  const monthCount = useMemo(() => {
    switch (timeRange) {
      case '3m': return 3;
      case '6m': return 6;
      case '1y': return 12;
      case 'all': return 18;
    }
  }, [timeRange]);

  // Compute time series progression
  const { series, assetsMeta } = useMemo(() => {
    return computeAssetProgressionSeries(assets, transactions, monthCount);
  }, [assets, transactions, monthCount]);

  // Asset types present in current portfolio
  const availableAssetTypes = useMemo(() => {
    const types = new Set<string>();
    assetsMeta.forEach((m) => types.add(m.assetType));
    return ['all', ...Array.from(types)];
  }, [assetsMeta]);

  // Filtered meta based on selected type
  const typeFilteredMeta = useMemo(() => {
    if (selectedAssetType === 'all') return assetsMeta;
    return assetsMeta.filter((m) => m.assetType === selectedAssetType);
  }, [assetsMeta, selectedAssetType]);

  // Determine active visible assets
  const activeMeta = useMemo(() => {
    if (!hasCustomVisibility) {
      return typeFilteredMeta;
    }
    return typeFilteredMeta.filter((m) => visibleAssetIds.has(m.id));
  }, [typeFilteredMeta, visibleAssetIds, hasCustomVisibility]);

  // Toggle individual asset visibility
  const toggleAssetVisibility = (id: string) => {
    const nextSet = new Set(hasCustomVisibility ? visibleAssetIds : typeFilteredMeta.map((m) => m.id));
    if (nextSet.has(id)) {
      // Don't allow unselecting all assets (keep at least 1)
      if (nextSet.size > 1) {
        nextSet.delete(id);
      }
    } else {
      nextSet.add(id);
    }
    setVisibleAssetIds(nextSet);
    setHasCustomVisibility(true);
  };

  // Isolate a single asset
  const isolateAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleAssetIds(new Set([id]));
    setHasCustomVisibility(true);
  };

  // Reset visibility to show all
  const resetVisibility = () => {
    setVisibleAssetIds(new Set(typeFilteredMeta.map((m) => m.id)));
    setHasCustomVisibility(false);
  };

  // Total current market value across portfolio
  const totalMarketVal = useMemo(
    () => assetsMeta.reduce((sum, m) => sum + m.currentValue, 0),
    [assetsMeta]
  );

  if (assets.length === 0) {
    return (
      <div className={`rounded-3xl bg-white/[0.04] light:bg-white/80 backdrop-blur-2xl border border-white/10 light:border-slate-300/80 p-8 text-center flex flex-col items-center justify-center gap-3 shadow-xl ${className}`}>
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Coins className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1 max-w-xs">
          <h4 className="text-sm font-bold text-white light:text-slate-900">Sin activos en seguimiento</h4>
          <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">
            Añade ETFs, criptomonedas o acciones en la sección de Inversiones para visualizar las líneas de progresión de cada activo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 px-3 sm:px-5 py-4 sm:py-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${className}`}>
      {/* Specular hairline top glow */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-indigo-600/15 to-amber-500/15 border border-white/15 flex items-center justify-center text-indigo-400 light:text-indigo-600 flex-shrink-0 shadow-[0_2px_12px_rgba(99,102,241,0.2)]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-tight truncate">
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Timeframe & Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Chart Mode: Value vs Cost */}
          <div className="inline-flex p-1 gap-1 rounded-full bg-white/[0.06] light:bg-slate-200/80 border border-white/10 light:border-slate-300">
            <button
              type="button"
              onClick={() => setChartMode('value')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'value'
                  ? 'bg-white/20 light:bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white light:text-slate-600'
              }`}
            >
              Valor (€)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('cost')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'cost'
                  ? 'bg-white/20 light:bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white light:text-slate-600'
              }`}
            >
              Coste (€)
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="inline-flex p-1 gap-1 rounded-full bg-white/[0.06] light:bg-slate-200/80 border border-white/10 light:border-slate-300">
            {(['3m', '6m', '1y', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-indigo-500/25 light:bg-indigo-600 text-indigo-300 light:text-white font-bold'
                    : 'text-slate-400 hover:text-white light:text-slate-600'
                }`}
              >
                {r === 'all' ? 'Todo' : r.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="hidden md:inline-flex text-xs font-bold text-indigo-400 light:text-indigo-700 bg-indigo-500/10 light:bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-500/20 light:border-indigo-200 whitespace-nowrap">
            {formatCurrency(totalMarketVal)}
          </span>
        </div>
      </div>

      {/* 2. FILTER PILLS (By Asset Type: ETFs, Crypto, Stocks) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
          <Filter className="h-3 w-3" /> Filtrar:
        </span>
        {availableAssetTypes.map((typeKey) => {
          const isSelected = selectedAssetType === typeKey;
          const count = typeKey === 'all' ? assetsMeta.length : assetsMeta.filter((m) => m.assetType === typeKey).length;
          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => {
                setSelectedAssetType(typeKey);
                setHasCustomVisibility(false);
              }}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                isSelected
                  ? 'bg-indigo-500/20 light:bg-indigo-50 text-indigo-300 light:text-indigo-700 border border-indigo-500/40 light:border-indigo-200 font-bold shadow-sm'
                  : 'bg-white/[0.03] light:bg-slate-100 text-slate-400 light:text-slate-600 border border-white/5 light:border-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <span>{ASSET_TYPE_LABELS[typeKey] || typeKey}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 light:bg-slate-200 text-slate-300 light:text-slate-700 font-bold">
                {count}
              </span>
            </button>
          );
        })}

        {hasCustomVisibility && (
          <button
            type="button"
            onClick={resetVisibility}
            className="ml-auto text-[10px] text-indigo-300 hover:text-white underline cursor-pointer flex-shrink-0"
          >
            Mostrar todos
          </button>
        )}
      </div>

      {/* 3. MULTI-LINE CHART */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart
            data={series}
            margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={38}
              tickMargin={2}
              tickFormatter={(v) => formatAxisCurrency(v)}
            />
            <Tooltip
              content={
                <AssetProgressionTooltip
                  assetsMeta={assetsMeta}
                  chartMode={chartMode}
                />
              }
            />

            {/* Render a smooth curve Line for each active asset */}
            {activeMeta.map((meta) => {
              const key = chartMode === 'cost' ? `${meta.dataKey}_cost` : meta.dataKey;
              return (
                <Line
                  key={meta.id}
                  type="monotone"
                  dataKey={key}
                  name={meta.name}
                  stroke={meta.color}
                  strokeWidth={2.4}
                  dot={{ r: 2.5, fill: meta.color, stroke: 'rgba(0,0,0,0.4)', strokeWidth: 1 }}
                  activeDot={{ r: 5.5, stroke: '#fff', strokeWidth: 1.5 }}
                  isAnimationActive={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4. INTERACTIVE ASSET CHIPS (Toggle lines on / off & see live values) */}
      <div className="pt-2 border-t border-white/10 light:border-slate-200/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400 light:text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Toca un activo para activar/desactivar su línea o aislarlo:
          </span>
          <span>{activeMeta.length} de {typeFilteredMeta.length} visibles</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {typeFilteredMeta.map((meta) => {
            const isVisible = hasCustomVisibility ? visibleAssetIds.has(meta.id) : true;
            return (
              <div
                key={meta.id}
                onClick={() => toggleAssetVisibility(meta.id)}
                className={`group flex items-center gap-2 p-2 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                  isVisible
                    ? 'bg-white/[0.05] light:bg-white border-white/15 light:border-slate-300 shadow-sm'
                    : 'bg-white/[0.01] light:bg-slate-100/60 border-white/5 light:border-slate-200 opacity-40 hover:opacity-70'
                }`}
              >
                {/* Colored Line dot */}
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: meta.color }}
                />

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white light:text-slate-900 truncate max-w-[120px] sm:max-w-[150px]">
                      {meta.name}
                    </span>
                    {meta.ticker && (
                      <span className="text-[9px] font-semibold text-slate-400 light:text-slate-500">
                        {meta.ticker}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-slate-200 light:text-slate-800">
                      {formatCurrency(meta.currentValue)}
                    </span>
                    <span
                      className={`font-semibold ${
                        meta.unrealizedPnL >= 0
                          ? 'text-emerald-400 light:text-emerald-600'
                          : 'text-rose-400 light:text-rose-600'
                      }`}
                    >
                      {meta.unrealizedPnL >= 0 ? '+' : ''}{formatPercentage(meta.unrealizedPnLPercentage)}
                    </span>
                  </div>
                </div>

                {/* Isolate single line quick action */}
                <button
                  type="button"
                  title="Aislar esta línea"
                  onClick={(e) => isolateAsset(meta.id, e)}
                  className="ml-1 p-1 rounded-lg bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
