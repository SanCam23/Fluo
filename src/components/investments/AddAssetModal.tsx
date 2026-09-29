import { useState, useEffect, useRef, useMemo } from 'react';
import type { FormEvent } from 'react';
import {
  X,
  Check,
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Coins,
  Building2,
  RefreshCw,
  LineChart,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  searchAssets,
  fetchCurrentPrice,
  isIsin,
  getFundEquivalence,
  findMatchingExistingAssets,
} from '../../services/marketDataService';
import type { AutocompleteAssetMatch } from '../../services/marketDataService';
import type { AssetType, MarketAssetItem } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { GlassSelect } from '../common/GlassSelect';
import type { GlassSelectOption } from '../common/GlassSelect';

const ASSET_TYPE_OPTIONS: GlassSelectOption<AssetType>[] = [
  { value: 'stock', label: 'Acciones Bursátiles', icon: <LineChart className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'etf', label: 'ETFs Cotizados', icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'index_fund', label: 'Fondos Indexados', icon: <Layers className="h-3.5 w-3.5 text-indigo-400" /> },
  { value: 'crypto', label: 'Criptomonedas', icon: <Coins className="h-3.5 w-3.5 text-amber-400" /> },
  { value: 'fixed_income', label: 'Renta Fija / Bonos', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> },
  { value: 'deposit', label: 'Depósitos Remunerados', icon: <Landmark className="h-3.5 w-3.5 text-indigo-400" /> },
];

const CURRENCY_OPTIONS: GlassSelectOption<'EUR' | 'USD'>[] = [
  { value: 'EUR', label: 'EUR (€)', icon: <span className="font-bold text-xs text-indigo-400">€</span> },
  { value: 'USD', label: 'USD ($)', icon: <span className="font-bold text-xs text-emerald-400">$</span> },
];

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose }) => {
  const addAsset = useFinanceStore((state) => state.addAsset);
  const portfolioAssets = useFinanceStore((state) => state.assets);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MarketAssetItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete by Ticker or ISIN state
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const [autocompletedNotice, setAutocompletedNotice] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [ticker, setTicker] = useState('');
  const [isin, setIsin] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [shares, setShares] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [totalInvestedInput, setTotalInvestedInput] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [platform, setPlatform] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [initialFee, setInitialFee] = useState('');
  const [change24h, setChange24h] = useState<number | undefined>(undefined);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const matchingExistingAssets = useMemo(() => {
    return findMatchingExistingAssets(identifier, portfolioAssets);
  }, [identifier, portfolioAssets]);

  // Search effect with debounce (only when query is not empty)
  useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false);
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    let isMounted = true;
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAssets(query);
        if (isMounted) {
          setSearchResults(results);
          setIsDropdownOpen(results.length > 0);
        }
      } catch (err) {
        console.error('Error searching assets:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, isOpen]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(e.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Handle autocomplete selection from existing portfolio or catalog matches
  const handleApplyAutocompleteMatch = async (match: AutocompleteAssetMatch) => {
    setName(match.name);
    setIdentifier(match.identifier);
    setTicker(match.ticker || (match.assetType === 'stock' || match.assetType === 'crypto' ? match.identifier : ''));
    setIsin(match.isin || (isIsin(match.identifier) ? match.identifier : ''));
    setAssetType(match.assetType);
    setCurrency(match.currency);
    if (match.platform) {
      setPlatform(match.platform);
    }
    if (match.currentPrice > 0) {
      setCurrentPrice(match.currentPrice.toString());
    }
    if (!averageBuyPrice) {
      if (match.averageBuyPrice && match.averageBuyPrice > 0) {
        setAverageBuyPrice(match.averageBuyPrice.toString());
        const s = parseFloat(shares);
        if (!isNaN(s) && s > 0) {
          setTotalInvestedInput((s * match.averageBuyPrice).toFixed(2));
        }
      } else if (match.currentPrice > 0) {
        setAverageBuyPrice(match.currentPrice.toString());
        const s = parseFloat(shares);
        if (!isNaN(s) && s > 0) {
          setTotalInvestedInput((s * match.currentPrice).toFixed(2));
        }
      }
    }
    setIsAutocompleteOpen(false);
    setAutocompletedNotice(match.name);
    setTimeout(() => setAutocompletedNotice(null), 3500);

    // Try fetching fresh live quote in background
    setIsFetchingQuote(true);
    try {
      const quote = await fetchCurrentPrice(match.identifier);
      if (quote && quote.price > 0) {
        setCurrentPrice(quote.price.toString());
        setCurrency(quote.currency);
        setChange24h(quote.change24h);
        setIsOfflineCached(quote.isOfflineCached);
        if (!averageBuyPrice && !match.averageBuyPrice) {
          setAverageBuyPrice(quote.price.toString());
          const s = parseFloat(shares);
          if (!isNaN(s) && s > 0) {
            setTotalInvestedInput((s * quote.price).toFixed(2));
          }
        }
      }
    } catch {
      // Ignored, price already set
    } finally {
      setIsFetchingQuote(false);
    }
  };

  // Handle asset selection from search results
  const handleSelectAsset = async (item: MarketAssetItem) => {
    setName(item.name);
    setIdentifier(item.identifier);
    setTicker(item.ticker || (item.assetType === 'stock' || item.assetType === 'crypto' ? item.identifier : ''));
    setIsin(item.isin || (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(item.identifier) ? item.identifier : ''));
    setAssetType(item.assetType);
    setCurrency(item.currency);
    setCurrentPrice(item.basePrice.toString());
    setChange24h(item.change24h);
    setIsDropdownOpen(false);
    setSearchQuery('');

    // If averageBuyPrice is empty, suggest currentPrice
    if (!averageBuyPrice) {
      setAverageBuyPrice(item.basePrice.toString());
      const s = parseFloat(shares);
      if (!isNaN(s) && s > 0) {
        setTotalInvestedInput((s * item.basePrice).toFixed(2));
      }
    }

    // Try fetching fresh live quote in background
    setIsFetchingQuote(true);
    try {
      const quote = await fetchCurrentPrice(item.identifier);
      setCurrentPrice(quote.price.toString());
      setCurrency(quote.currency);
      setChange24h(quote.change24h);
      setIsOfflineCached(quote.isOfflineCached);
      if (!averageBuyPrice) {
        setAverageBuyPrice(quote.price.toString());
        const s = parseFloat(shares);
        if (!isNaN(s) && s > 0) {
          setTotalInvestedInput((s * quote.price).toFixed(2));
        }
      }
    } catch {
      // Ignored, base price already set
    } finally {
      setIsFetchingQuote(false);
    }
  };

  // Bidirectional calculations: shares & unit price <-> total invested
  const handleSharesChange = (val: string) => {
    setShares(val);
    const numShares = parseFloat(val);
    const numUnit = parseFloat(averageBuyPrice);
    if (!isNaN(numShares) && !isNaN(numUnit) && numShares > 0) {
      setTotalInvestedInput((numShares * numUnit).toFixed(2));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    setAverageBuyPrice(val);
    const numUnit = parseFloat(val);
    const numShares = parseFloat(shares);
    if (!isNaN(numUnit) && !isNaN(numShares) && numShares > 0) {
      setTotalInvestedInput((numShares * numUnit).toFixed(2));
    }
  };

  const handleTotalInvestedChange = (val: string) => {
    setTotalInvestedInput(val);
    const numTotal = parseFloat(val);
    const numShares = parseFloat(shares);
    if (!isNaN(numTotal) && !isNaN(numShares) && numShares > 0) {
      setAverageBuyPrice((numTotal / numShares).toFixed(4));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numShares = parseFloat(shares);
    const numBuyPrice = parseFloat(averageBuyPrice);
    const numCurrentPrice = parseFloat(currentPrice) || numBuyPrice;
    const numFee = parseFloat(initialFee) || 0;

    if (!identifier.trim() || !name.trim() || isNaN(numShares) || isNaN(numBuyPrice) || numShares <= 0) {
      return;
    }

    const cleanIdent = identifier.trim().toUpperCase();
    const cleanIsin = isin.trim().toUpperCase() || (isIsin(cleanIdent) ? cleanIdent : undefined);
    const fundEq = cleanIsin ? getFundEquivalence(cleanIsin) : undefined;
    const resolvedQuoteTicker = fundEq?.referenceTicker || ticker.trim().toUpperCase() || undefined;

    addAsset({
      name: name.trim(),
      identifier: cleanIdent,
      ticker: ticker.trim().toUpperCase() || undefined,
      isin: cleanIsin,
      quoteTicker: resolvedQuoteTicker,
      quote_ticker: resolvedQuoteTicker,
      assetType,
      shares: numShares,
      averageBuyPrice: numBuyPrice,
      averagePrice: numBuyPrice,
      currentPrice: numCurrentPrice,
      currency,
      platform: platform.trim() || undefined,
      change24h,
      isOfflineCached,
      initialFee: numFee > 0 ? numFee : undefined,
      acquisitionDate: acquisitionDate || undefined,
    });

    // Reset form
    setIdentifier('');
    setName('');
    setTicker('');
    setIsin('');
    setShares('');
    setAverageBuyPrice('');
    setTotalInvestedInput('');
    setCurrentPrice('');
    setPlatform('');
    setInitialFee('');
    setChange24h(undefined);
    onClose();
  };

  const assetTypeLabels: Record<AssetType, string> = {
    stock: 'Acción',
    etf: 'ETF',
    index_fund: 'Fondo Indexado',
    crypto: 'Criptomoneda',
    fixed_income: 'Renta Fija',
    deposit: 'Depósito',
  };

  const assetTypeColors: Record<AssetType, string> = {
    stock: 'bg-blue-500/20 text-blue-300 border-blue-500/30 light:bg-blue-500/10 light:text-blue-700 light:border-blue-500/30',
    etf: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 light:bg-indigo-500/10 light:text-indigo-700 light:border-indigo-500/30',
    index_fund: 'bg-purple-500/20 text-purple-300 border-purple-500/30 light:bg-purple-500/10 light:text-purple-700 light:border-purple-500/30',
    crypto: 'bg-amber-500/20 text-amber-300 border-amber-500/30 light:bg-amber-500/15 light:text-amber-800 light:border-amber-500/35',
    fixed_income: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 light:bg-emerald-500/10 light:text-emerald-700 light:border-emerald-500/30',
    deposit: 'bg-teal-500/20 text-teal-300 border-teal-500/30 light:bg-teal-500/10 light:text-teal-700 light:border-teal-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0E1526]/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Edge Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Añadir Inversión</h3>
              <p className="text-[11px] text-slate-400">Cotizaciones oficiales en tiempo real y cálculo de P&L</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Smart Search Bar with Real-time Floating Dropdown */}
          <div className="relative" ref={searchContainerRef}>
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-indigo-400" />
                Búsqueda Inteligente de Activos
              </span>
              <span className="text-[10px] text-indigo-300 font-normal">
                S&P 500, MSCI Europe, Apple, Santander, BTC, ISIN...
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Busca por nombre, empresa, índice, Ticker o código ISIN..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0 && searchResults.length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (!val.trim()) {
                    setIsDropdownOpen(false);
                  }
                }}
                className="w-full rounded-2xl bg-white/[0.08] border border-white/15 pl-10 pr-9 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

              {isSearching && (
                <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />
              )}
            </div>

            {/* Floating Dropdown Card (Liquid Glass) */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute z-40 left-0 right-0 top-full mt-2 bg-[#0E1526]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)] max-h-64 overflow-y-auto divide-y divide-white/5 animate-fadeIn">
                {searchResults.map((item) => {
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
                              assetTypeColors[item.assetType]
                            }`}
                          >
                            {assetTypeLabels[item.assetType]}
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

                      {/* Price & 24h variation */}
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

          {/* Selected Asset Information Card */}
          {identifier && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 light:bg-indigo-50/70 border border-indigo-500/25 light:border-indigo-200 flex items-center justify-between backdrop-blur-md">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-indigo-300 light:text-indigo-700 tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Activo Seleccionado
                </span>
                <p className="text-sm font-bold text-white truncate mt-0.5">{name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.2 rounded bg-white/10 light:bg-indigo-100/80 font-mono text-xs text-indigo-200 light:text-indigo-800 border border-white/10 light:border-indigo-200">
                    {identifier}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${assetTypeColors[assetType]}`}>
                    {assetTypeLabels[assetType]}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 light:text-slate-600 block">Cotización Actual</span>
                <div className="flex items-center gap-1 justify-end">
                  {isFetchingQuote ? (
                    <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                  ) : (
                    <span className="text-base font-extrabold text-emerald-400 light:text-emerald-700">
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

          {/* Manual Name & Identifier Inputs (if user didn't pick from search or wants to tweak) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-medium text-slate-400">Nombre / Título</label>
              <input
                type="text"
                required
                placeholder="Ej. Apple Inc., Vanguard S&P 500..."
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          {/* Shares / Decimal Units */}
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Cantidad de Títulos / Participaciones (soporta decimales)
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                step="any"
                min="0.000001"
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
          </div>

          {/* Dual Input: Unit Buy Price vs Total Invested Capital */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              Precio de Compra e Inversión Total (Cálculo bidireccional)
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Precio por Título ({currency})</label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  required
                  placeholder="Ej. 124.50"
                  value={averageBuyPrice}
                  onChange={(e) => handleUnitPriceChange(e.target.value)}
                  className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Total Desembolsado ({currency})</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="Ej. 1245.00"
                  value={totalInvestedInput}
                  onChange={(e) => handleTotalInvestedChange(e.target.value)}
                  className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Additional Details (Optional): Date, Initial Fees, Platform */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-indigo-400" />
                Fecha Compra
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Comisión (€/$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialFee}
                onChange={(e) => setInitialFee(e.target.value)}
                className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3 text-indigo-400" />
                Broker
              </label>
              <input
                type="text"
                placeholder="MyInvestor, Trade Republic..."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3.5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 hover:brightness-110 active:scale-[0.98] font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            Guardar en Cartera
          </button>
        </form>
      </div>
    </div>
  );
};
