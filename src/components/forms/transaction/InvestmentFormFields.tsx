import React from 'react';
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Check,
  DollarSign,
  Hash,
  Info,
  AlertTriangle,
  LineChart,
  Layers,
  Coins,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import type { AssetType, MarketAssetItem } from '../../../types/finance';
import type { AutocompleteAssetMatch } from '../../../services/marketDataService';
import { formatCurrency, formatPercentage } from '../../../utils/currency';
import {
  parsePositiveNumber,
  calculateSharesFromTotal,
  calculateTotalFromShares,
} from '../../../utils/investmentValidation';
import { GlassSelect } from '../../common/GlassSelect';
import type { GlassSelectOption } from '../../common/GlassSelect';
import { BrandPicker } from '../BrandPicker';

export const ASSET_TYPE_OPTIONS: GlassSelectOption<AssetType>[] = [
  { value: 'stock', label: 'Acciones Bursátiles', icon: <LineChart className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'etf', label: 'ETFs Cotizados', icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'index_fund', label: 'Fondos Indexados', icon: <Layers className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'crypto', label: 'Criptomonedas', icon: <Coins className="h-3.5 w-3.5 text-amber-400" /> },
  { value: 'fixed_income', label: 'Renta Fija / Bonos', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> },
  { value: 'deposit', label: 'Depósitos Remunerados', icon: <Landmark className="h-3.5 w-3.5 text-indigo-400" /> },
];

export const CURRENCY_OPTIONS: GlassSelectOption<'EUR' | 'USD'>[] = [
  { value: 'EUR', label: 'EUR (€)', icon: <span className="font-bold text-xs text-indigo-400">€</span> },
  { value: 'USD', label: 'USD ($)', icon: <span className="font-bold text-xs text-emerald-400">$</span> },
];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: 'Acción',
  etf: 'ETF',
  index_fund: 'Fondo Indexado',
  crypto: 'Criptomoneda',
  fixed_income: 'Renta Fija',
  deposit: 'Depósito',
};

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  stock: 'bg-blue-500/20 text-blue-300 border-blue-500/30 light:bg-blue-500/10 light:text-blue-700 light:border-blue-500/30',
  etf: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 light:bg-indigo-500/10 light:text-indigo-700 light:border-indigo-500/30',
  index_fund: 'bg-purple-500/20 text-purple-300 border-purple-500/30 light:bg-purple-500/10 light:text-purple-700 light:border-purple-500/30',
  crypto: 'bg-amber-500/20 text-amber-300 border-amber-500/30 light:bg-amber-500/15 light:text-amber-800 light:border-amber-500/35',
  fixed_income: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 light:bg-emerald-500/10 light:text-emerald-700 light:border-emerald-500/30',
  deposit: 'bg-teal-500/20 text-teal-300 border-teal-500/30 light:bg-teal-500/10 light:text-teal-700 light:border-teal-500/30',
};

export interface InvestmentFormFieldsProps {
  assetSearchRef: React.RefObject<HTMLDivElement | null>;
  assetSearchQuery: string;
  setAssetSearchQuery: (val: string) => void;
  isAssetDropdownOpen: boolean;
  setIsAssetDropdownOpen: (val: boolean) => void;
  isSearchingAssets: boolean;
  assetSearchResults: MarketAssetItem[];
  handleSelectAsset: (item: MarketAssetItem) => void;

  identifier: string;
  setIdentifier: (val: string) => void;
  assetName: string;
  setAssetName: (val: string) => void;
  assetType: AssetType;
  setAssetType: (val: AssetType) => void;
  currency: 'EUR' | 'USD';
  setCurrency: (val: 'EUR' | 'USD') => void;
  currentPrice: string;
  isFetchingQuote: boolean;
  change24h?: number;
  isOfflineCached?: boolean;

  autocompleteContainerRef: React.RefObject<HTMLDivElement | null>;
  matchingExistingAssets: AutocompleteAssetMatch[];
  isAutocompleteOpen: boolean;
  setIsAutocompleteOpen: (val: boolean) => void;
  handleApplyAutocompleteMatch: (match: AutocompleteAssetMatch) => void;
  autocompletedNotice: string | null;
  setAutocompletedNotice: (val: string | null) => void;

  investInputMode: 'total' | 'shares';
  setInvestInputMode: (mode: 'total' | 'shares') => void;
  totalInvestedInput: string;
  handleTotalInvestedChange: (val: string) => void;
  shares: string;
  handleSharesChange: (val: string) => void;
  averageBuyPrice: string;
  handleUnitPriceChange: (val: string) => void;
  quoteVerified: boolean;

  investFormErrors: string[];
  brokerBrandId: string;
  setBrokerBrandId: (id: string | undefined) => void;
  selectedSourceId: string;
  setSelectedSourceId: (id: string) => void;
  investSourceOptions: Array<{ value: string; label: string }>;
}

export const InvestmentFormFields: React.FC<InvestmentFormFieldsProps> = ({
  assetSearchRef,
  assetSearchQuery,
  setAssetSearchQuery,
  isAssetDropdownOpen,
  setIsAssetDropdownOpen,
  isSearchingAssets,
  assetSearchResults,
  handleSelectAsset,
  identifier,
  setIdentifier,
  assetName,
  setAssetName,
  assetType,
  setAssetType,
  currency,
  setCurrency,
  currentPrice,
  isFetchingQuote,
  change24h,
  isOfflineCached,
  autocompleteContainerRef,
  matchingExistingAssets,
  isAutocompleteOpen,
  setIsAutocompleteOpen,
  handleApplyAutocompleteMatch,
  autocompletedNotice,
  setAutocompletedNotice,
  investInputMode,
  setInvestInputMode,
  totalInvestedInput,
  handleTotalInvestedChange,
  shares,
  handleSharesChange,
  averageBuyPrice,
  handleUnitPriceChange,
  quoteVerified,
  investFormErrors,
  brokerBrandId,
  setBrokerBrandId,
  selectedSourceId,
  setSelectedSourceId,
  investSourceOptions,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Smart Search Bar with Real-time Floating Dropdown */}
      <div className="relative" ref={assetSearchRef}>
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-indigo-400" />
            Búsqueda Inteligente de Activos
          </span>
          <span className="text-[10px] text-indigo-300 font-normal">
            S&P 500, Apple, Santander, BTC, ISIN...
          </span>
        </label>

        <div className="relative">
          <input
            type="text"
            placeholder="Busca por nombre, índice, Ticker o código ISIN..."
            value={assetSearchQuery}
            onFocus={() => {
              if (assetSearchQuery.trim().length > 0 && assetSearchResults.length > 0) {
                setIsAssetDropdownOpen(true);
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              setAssetSearchQuery(val);
              if (!val.trim()) {
                setIsAssetDropdownOpen(false);
              }
            }}
            className="w-full rounded-2xl bg-white/[0.08] border border-white/15 pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md shadow-inner"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

          {isSearchingAssets && (
            <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />
          )}
        </div>

        {/* Floating Dropdown Card (Liquid Glass) */}
        {isAssetDropdownOpen && assetSearchResults.length > 0 && (
          <div className="absolute z-40 left-0 right-0 top-full mt-2 bg-[#0E1526]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)] max-h-60 overflow-y-auto divide-y divide-white/5 animate-fadeIn">
            {assetSearchResults.map((item) => {
              const isPositive = item.change24h >= 0;
              return (
                <button
                  key={`${item.identifier}-${item.name}`}
                  type="button"
                  onClick={() => handleSelectAsset(item)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.08] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {item.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${
                          ASSET_TYPE_COLORS[item.assetType as AssetType] || 'border-white/10'
                        }`}
                      >
                        {ASSET_TYPE_LABELS[item.assetType as AssetType] || item.assetType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-300 font-semibold">{item.identifier}</span>
                      {item.isin && item.isin !== item.identifier && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.isin}</span>
                        </>
                      )}
                      {item.benchmarkOrIndex && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400/90 text-[10px]">{item.benchmarkOrIndex}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white block">
                      {formatCurrency(item.basePrice, item.currency)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {formatPercentage(item.change24h)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Asset Information Badge */}
      {identifier && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 light:bg-indigo-50/70 border border-indigo-500/25 light:border-indigo-200 flex items-center justify-between backdrop-blur-md">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-indigo-300 light:text-indigo-700 tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Activo Detectado
            </span>
            <p className="text-xs font-bold text-white truncate mt-0.5">{assetName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-1.5 py-0.2 rounded bg-white/10 light:bg-indigo-100/80 font-mono text-[10px] text-indigo-200 light:text-indigo-800 border border-white/10 light:border-indigo-200">
                {identifier}
              </span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${ASSET_TYPE_COLORS[assetType]}`}>
                {ASSET_TYPE_LABELS[assetType]}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 light:text-slate-600 block">Cotización Oficial</span>
            <div className="flex items-center gap-1 justify-end">
              {isFetchingQuote ? (
                <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              ) : (
                <span className="text-sm font-extrabold text-emerald-400 light:text-emerald-700">
                  {formatCurrency(parseFloat(currentPrice) || 0, currency)}
                </span>
              )}
            </div>
            {change24h !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                  change24h >= 0 ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
                }`}
              >
                {change24h >= 0 ? '+' : ''}{formatPercentage(change24h)} 24h
              </span>
            )}
            {isOfflineCached && (
              <span className="text-[9px] text-amber-300 light:text-amber-800 block">Dato en caché</span>
            )}
          </div>
        </div>
      )}

      {/* Name & Ticker / ISIN Manual Inputs */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-medium text-slate-400">Nombre / Título</label>
          <input
            type="text"
            required
            placeholder="Ej. Apple Inc., S&P 500..."
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="relative" ref={autocompleteContainerRef}>
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Ticker o ISIN</span>
            {matchingExistingAssets.length > 0 && (
              <span className="text-[10px] text-indigo-400 font-normal flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                {matchingExistingAssets.length} {matchingExistingAssets.length === 1 ? 'coincidencia' : 'coincidencias'}
              </span>
            )}
          </label>
          <input
            type="text"
            required
            placeholder="AAPL, IE0032126645..."
            value={identifier}
            onFocus={() => {
              if (matchingExistingAssets.length > 0) setIsAutocompleteOpen(true);
            }}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setIdentifier(val);
              setIsAutocompleteOpen(true);
            }}
            className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />

          {/* Floating Dropdown for Autocompleting Existing Matches (Liquid Glass) */}
          {isAutocompleteOpen && matchingExistingAssets.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-[#0E1526]/95 light:bg-white/95 backdrop-blur-2xl border border-indigo-500/30 light:border-indigo-200 rounded-2xl p-2 shadow-[0_12px_36px_rgba(0,0,0,0.6)] light:shadow-[0_12px_24px_rgba(15,23,42,0.1)] divide-y divide-white/5 light:divide-slate-200 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="px-2 py-1 text-[10px] font-bold text-indigo-300 light:text-indigo-600 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Pinchar para autocompletar
                </span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Coincide con existente
                </span>
              </div>

              {matchingExistingAssets.map((match) => (
                <button
                  key={`${match.source}-${match.identifier}-${match.isin || ''}`}
                  type="button"
                  onClick={() => handleApplyAutocompleteMatch(match)}
                  className="w-full text-left p-2 rounded-xl hover:bg-indigo-500/15 light:hover:bg-indigo-50/80 transition-all flex items-center justify-between gap-2.5 cursor-pointer group mt-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition-colors truncate">
                        {match.name}
                      </span>
                      {match.source === 'portfolio' ? (
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border border-emerald-500/30 shrink-0">
                          En cartera
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-indigo-500/15 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 border border-indigo-500/30 shrink-0">
                          {match.assetType === 'index_fund' ? 'Fondo Indexado' : match.assetType.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 light:text-slate-500 mt-0.5 font-mono">
                      <span className="font-semibold text-slate-300 light:text-slate-700">{match.identifier}</span>
                      {match.isin && match.isin !== match.identifier && (
                        <>
                          <span>•</span>
                          <span>ISIN: {match.isin}</span>
                        </>
                      )}
                      {match.quoteTicker && match.quoteTicker !== match.identifier && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400">Ref: {match.quoteTicker}</span>
                        </>
                      )}
                      {match.platform && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300 light:text-slate-700">{match.platform}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {match.currentPrice > 0 && (
                      <span className="text-xs font-bold text-emerald-400 light:text-emerald-700 block">
                        {formatCurrency(match.currentPrice, match.currency)}
                      </span>
                    )}
                    <span className="text-[10px] text-indigo-400 light:text-indigo-600 group-hover:underline flex items-center gap-0.5 justify-end mt-0.5 font-semibold">
                      Rellenar <Check className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Autocompletion notification badge */}
      {autocompletedNotice && (
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/25 light:border-emerald-200 text-emerald-300 light:text-emerald-800 text-[11px] font-medium flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5 truncate">
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Datos autocompletados desde: <strong className="font-semibold truncate">{autocompletedNotice}</strong>
          </span>
          <button
            type="button"
            onClick={() => setAutocompletedNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Asset Class & Currency */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <GlassSelect<AssetType>
            label="Tipo de Activo"
            value={assetType}
            onChange={(val) => setAssetType(val)}
            options={ASSET_TYPE_OPTIONS}
            size="sm"
          />
        </div>

        <div>
          <GlassSelect<'EUR' | 'USD'>
            label="Divisa"
            value={currency}
            onChange={(val) => setCurrency(val)}
            options={CURRENCY_OPTIONS}
            size="sm"
          />
        </div>
      </div>

      {/* ──── Investment Input Mode Selector (Liquid Glass Segmented Control) ──── */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setInvestInputMode('total')}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            investInputMode === 'total'
              ? 'bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 shadow-md'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Por Importe Total
        </button>
        <button
          type="button"
          onClick={() => setInvestInputMode('shares')}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            investInputMode === 'shares'
              ? 'bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 shadow-md'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Hash className="h-3.5 w-3.5" />
          Por Nº de Títulos
        </button>
      </div>

      {/* ──── Primary Input: depends on active mode ──── */}
      {investInputMode === 'total' ? (
        <div>
          <label className="text-xs font-semibold text-slate-300">
            Importe Total Desembolsado ({currency})
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              inputMode="decimal"
              required
              placeholder="Ej. 500, 1000, 2500.50"
              value={totalInvestedInput}
              onChange={(e) => handleTotalInvestedChange(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.08] border border-white/15 px-4 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {currency}
            </span>
          </div>
          {/* Auto-calculated shares estimate */}
          {(() => {
            const numTotal = parsePositiveNumber(totalInvestedInput);
            const numPrice = parsePositiveNumber(averageBuyPrice);
            if (numTotal !== null && numPrice !== null) {
              const estShares = calculateSharesFromTotal(numTotal, numPrice);
              if (estShares !== null) {
                return (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-indigo-300/80 light:text-indigo-600 leading-snug">
                    <Info className="h-3 w-3 mt-0.5 shrink-0 text-indigo-400/60" />
                    A la cotización de {formatCurrency(numPrice, currency)}, compras aprox. <strong className="text-indigo-200 light:text-indigo-700">{estShares.toLocaleString('es-ES', { maximumFractionDigits: 6 })}</strong> títulos.
                  </p>
                );
              }
            }
            return null;
          })()}
        </div>
      ) : (
        <div>
          <label className="text-xs font-semibold text-slate-300">
            Cantidad de Títulos / Participaciones (soporta decimales)
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              inputMode="decimal"
              required
              placeholder="Ej. 10, 12.5 o 0.045 BTC"
              value={shares}
              onChange={(e) => handleSharesChange(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.08] border border-white/15 px-4 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              unidades
            </span>
          </div>
          {/* Auto-calculated total estimate */}
          {(() => {
            const numShares = parsePositiveNumber(shares);
            const numPrice = parsePositiveNumber(averageBuyPrice);
            if (numShares !== null && numPrice !== null) {
              const estTotal = calculateTotalFromShares(numShares, numPrice);
              if (estTotal !== null) {
                return (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-indigo-300/80 light:text-indigo-600 leading-snug">
                    <Info className="h-3 w-3 mt-0.5 shrink-0 text-indigo-400/60" />
                    Inversión total estimada: <strong className="text-indigo-200 light:text-indigo-700">{formatCurrency(estTotal, currency)}</strong>
                  </p>
                );
              }
            }
            return null;
          })()}
        </div>
      )}

      {/* ──── Unit Buy Price (always visible, editable) ──── */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2.5">
        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-indigo-400" />
          Precio de Compra por Título ({currency})
        </span>
        <input
          type="text"
          inputMode="decimal"
          required
          placeholder="Ej. 124.50"
          value={averageBuyPrice}
          onChange={(e) => handleUnitPriceChange(e.target.value)}
          className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400"
        />

        {/* Unverified quote warning */}
        {identifier && !isFetchingQuote && !quoteVerified && (
          <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-500/10 light:bg-amber-50 border border-amber-500/20 light:border-amber-200 text-amber-400 light:text-amber-800 text-[11px] leading-relaxed">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              No se pudo verificar la cotización real en tiempo real. Introduce el precio unitario de compra manualmente para continuar.
            </span>
          </div>
        )}
      </div>

      {/* ──── Validation Errors Panel ──── */}
      {investFormErrors.length > 0 && (
        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-rose-500/10 light:bg-rose-50 border border-rose-500/20 light:border-rose-200 animate-fadeIn">
          {investFormErrors.map((err, idx) => (
            <p key={idx} className="text-[11px] text-rose-400 light:text-rose-700 flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Broker Selection using BrandPicker (Identical to New Movement) */}
      <BrandPicker
        selectedBrandId={brokerBrandId}
        onSelectBrand={(id) => setBrokerBrandId(id)}
        categoryId="cat-invest"
        label="Broker o Entidad Financiera (Opcional)"
        placeholder="Busca tu broker (MyInvestor, Trade Republic, Degiro, Kraken...)"
      />

      {/* Source Account Selector for Investment Outflow (Optional) */}
      <div>
        <GlassSelect
          label="Cuenta o Fuente de Cargo (Opcional)"
          value={selectedSourceId}
          onChange={(val) => setSelectedSourceId(val)}
          options={investSourceOptions}
          placeholder="Selecciona cuenta de origen o fondos externos..."
        />
        <p className="mt-1 text-[11px] text-slate-400">
          {selectedSourceId
            ? 'Se registrará una salida vinculada de tu cuenta seleccionada.'
            : 'Fondos externos: no se restará saldo de ninguna de tus cuentas en la app.'}
        </p>
      </div>
    </div>
  );
};
