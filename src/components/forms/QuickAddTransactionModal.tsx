import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  X,
  Check,
  Repeat,
  Info,
  Clock,
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  Calendar,
  RefreshCw,
  LineChart,
  Coins,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type {
  PillarType,
  RecurrenceFrequency,
  AssetType,
  MarketAssetItem,
} from '../../types/finance';
import { BrandPicker } from './BrandPicker';
import { GlassSelect } from '../common/GlassSelect';
import type { GlassSelectOption } from '../common/GlassSelect';
import { CategoryIcon } from '../common/CategoryIcon';
import { calculateFirstNextDueDate } from '../../services/recurringEngine';
import { searchAssets, fetchCurrentPrice } from '../../services/marketDataService';
import { formatCurrency, formatPercentage } from '../../utils/currency';

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

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPillar?: PillarType;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialPillar,
}) => {
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const addRecurrence = useFinanceStore((state) => state.addRecurrence);
  const addAsset = useFinanceStore((state) => state.addAsset);
  const getBrandById = useFinanceStore((state) => state.getBrandById);
  const activeTab = useFinanceStore((state) => state.activeTab);

  // Pillar selection
  const [pillar, setPillar] = useState<PillarType>(() => {
    if (initialPillar) return initialPillar;
    if (activeTab === 'invest') return 'invest';
    return 'expense';
  });

  // Whenever modal opens or activeTab changes, auto-align pillar
  useEffect(() => {
    if (isOpen) {
      setAssetSearchQuery('');
      setAssetSearchResults([]);
      setIsAssetDropdownOpen(false);
      if (initialPillar) {
        setPillar(initialPillar);
      } else if (activeTab === 'invest') {
        setPillar('invest');
      }
    }
  }, [isOpen, initialPillar, activeTab]);

  // Standard movement fields (Expense / Income)
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  // Investment-specific fields
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetSearchResults, setAssetSearchResults] = useState<MarketAssetItem[]>([]);
  const [isSearchingAssets, setIsSearchingAssets] = useState(false);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const assetSearchRef = useRef<HTMLDivElement>(null);

  const [assetName, setAssetName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [ticker, setTicker] = useState('');
  const [isin, setIsin] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('etf');
  const [shares, setShares] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [totalInvestedInput, setTotalInvestedInput] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [brokerBrandId, setBrokerBrandId] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [initialFee, setInitialFee] = useState('');
  const [change24h, setChange24h] = useState<number | undefined>(undefined);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);

  // Recurrence granular configuration (Available for all pillars, including investment DCA)
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(() => new Date().getDate());
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [autoCharge, setAutoCharge] = useState<boolean>(true);

  // Debounced search for financial assets (only searches when user types a query)
  useEffect(() => {
    if (!isOpen || pillar !== 'invest') {
      setIsAssetDropdownOpen(false);
      return;
    }

    const query = assetSearchQuery.trim();
    if (!query) {
      setAssetSearchResults([]);
      setIsAssetDropdownOpen(false);
      return;
    }

    let isMounted = true;
    const timeout = setTimeout(async () => {
      setIsSearchingAssets(true);
      try {
        const results = await searchAssets(query);
        if (isMounted) {
          setAssetSearchResults(results);
          setIsAssetDropdownOpen(results.length > 0);
        }
      } catch (err) {
        console.error('Error searching assets:', err);
      } finally {
        if (isMounted) setIsSearchingAssets(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [assetSearchQuery, isOpen, pillar]);

  // Click outside listener for asset dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assetSearchRef.current && !assetSearchRef.current.contains(e.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter categories matching the selected pillar
  const availableCategories = categories.filter((c) => c.pillar === pillar);
  const selectedCatId = categoryId || (availableCategories[0]?.id ?? (pillar === 'invest' ? 'cat-etf' : ''));

  const categoryOptions: GlassSelectOption[] = availableCategories.map((c) => ({
    value: c.id,
    label: c.name,
    color: c.color,
    icon: (
      <div
        className="w-5 h-5 rounded-lg flex items-center justify-center p-0.5"
        style={{ backgroundColor: `${c.color}20`, color: c.color }}
      >
        <CategoryIcon iconName={c.icon} className="h-3.5 w-3.5" />
      </div>
    ),
  }));

  // Asset selection from search
  const handleSelectAsset = async (item: MarketAssetItem) => {
    setAssetName(item.name);
    setIdentifier(item.identifier);
    setTicker(item.ticker || (item.assetType === 'stock' || item.assetType === 'crypto' ? item.identifier : ''));
    setIsin(item.isin || (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(item.identifier) ? item.identifier : ''));
    setAssetType(item.assetType);
    setCurrency(item.currency);
    setCurrentPrice(item.basePrice.toString());
    setChange24h(item.change24h);
    setIsAssetDropdownOpen(false);
    setAssetSearchQuery('');

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
      // Ignored
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

  const resetAllFormState = () => {
    setAmount('');
    setConcept('');
    setBrandId('');
    setAssetName('');
    setIdentifier('');
    setTicker('');
    setIsin('');
    setShares('');
    setAverageBuyPrice('');
    setTotalInvestedInput('');
    setCurrentPrice('');
    setBrokerBrandId('');
    setInitialFee('');
    setChange24h(undefined);
    setIsRecurring(false);
    setEndDate('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (pillar === 'invest') {
      const numShares = parseFloat(shares);
      const numBuyPrice = parseFloat(averageBuyPrice);
      const numCurrentPrice = parseFloat(currentPrice) || numBuyPrice;
      const numFee = parseFloat(initialFee) || 0;

      if (!identifier.trim() || !assetName.trim() || isNaN(numShares) || isNaN(numBuyPrice) || numShares <= 0) {
        return;
      }

      const brokerBrand = getBrandById(brokerBrandId);
      const totalAmount = numShares * numBuyPrice + numFee;
      const txDate = acquisitionDate ? new Date(`${acquisitionDate}T12:00:00.000Z`).toISOString() : new Date().toISOString();

      // 1. Register asset in portfolio
      addAsset({
        name: assetName.trim(),
        identifier: identifier.trim().toUpperCase(),
        ticker: ticker.trim().toUpperCase() || undefined,
        isin: isin.trim().toUpperCase() || undefined,
        assetType,
        shares: numShares,
        averageBuyPrice: numBuyPrice,
        averagePrice: numBuyPrice,
        currentPrice: numCurrentPrice,
        currency,
        platform: brokerBrand ? brokerBrand.name : undefined,
        brandId: brokerBrandId || undefined,
        initialFee: numFee > 0 ? numFee : undefined,
        acquisitionDate: acquisitionDate || undefined,
        change24h,
        isOfflineCached,
      });

      // 2. Register monetary transaction in ledger
      addTransaction({
        amount: totalAmount,
        pillar: 'invest',
        categoryId: selectedCatId || 'cat-etf',
        brandId: brokerBrandId || undefined,
        concept: `Inversión en ${assetName.trim()} (${identifier.trim().toUpperCase()})`,
        date: txDate,
        isRecurring,
      });

      // 3. Register recurring DCA rule if configured
      if (isRecurring) {
        const nextDue = calculateFirstNextDueDate(new Date(txDate), {
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
          startDate: txDate,
        });

        addRecurrence({
          title: `Aportación periódica ${assetName.trim()}`,
          amount: totalAmount,
          pillar: 'invest',
          categoryId: selectedCatId || 'cat-etf',
          brandId: brokerBrandId || undefined,
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
          startDate: txDate,
          endDate: endDate ? new Date(`${endDate}T23:59:59.000Z`).toISOString() : undefined,
          nextDueDate: nextDue,
          lastProcessedDate: txDate,
          isActive: true,
          autoCharge,
        });
      }

      resetAllFormState();
      onClose();
      return;
    }

    // Standard Expense / Income submission
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!concept.trim()) return;

    const txDate = startDate ? new Date(`${startDate}T12:00:00.000Z`).toISOString() : new Date().toISOString();

    addTransaction({
      amount: numAmount,
      pillar,
      categoryId: selectedCatId,
      brandId: brandId || undefined,
      concept: concept.trim(),
      date: txDate,
      isRecurring,
    });

    if (isRecurring) {
      const nextDue = calculateFirstNextDueDate(new Date(txDate), {
        frequency,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        startDate: txDate,
      });

      addRecurrence({
        title: concept.trim(),
        amount: numAmount,
        pillar,
        categoryId: selectedCatId,
        brandId: brandId || undefined,
        frequency,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        startDate: txDate,
        endDate: endDate ? new Date(`${endDate}T23:59:59.000Z`).toISOString() : undefined,
        nextDueDate: nextDue,
        lastProcessedDate: txDate,
        isActive: true,
        autoCharge,
      });
    }

    resetAllFormState();
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
    stock: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    etf: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    index_fund: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    crypto: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    fixed_income: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    deposit: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-300 gpu-layer transform-gpu">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0E1526]/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden gpu-layer transform-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {pillar === 'invest' ? 'Nueva Inversión' : 'Nuevo Movimiento'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {pillar === 'invest'
                ? 'Registra un activo en cartera con cotización oficial en vivo'
                : 'Registra un gasto o ingreso en tu registro financiero'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Pillar Selector (Gasto / Ingreso / Inversión) */}
          <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPillar('expense');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                pillar === 'expense'
                  ? 'bg-rose-500/25 border border-rose-500/40 text-rose-300 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => {
                setPillar('income');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                pillar === 'income'
                  ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => {
                setPillar('invest');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                pillar === 'invest'
                  ? 'bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inversión
            </button>
          </div>

          {/* ============================================================== */}
          {/* INVERSIÓN: Formulario Completo de Activos con Cotización Real   */}
          {/* ============================================================== */}
          {pillar === 'invest' ? (
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
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between backdrop-blur-md">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Activo Detectado
                    </span>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{assetName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[10px] text-indigo-200 border border-white/10">
                        {identifier}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${assetTypeColors[assetType]}`}>
                        {assetTypeLabels[assetType]}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Cotización Oficial</span>
                    <div className="flex items-center gap-1 justify-end">
                      {isFetchingQuote ? (
                        <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                      ) : (
                        <span className="text-sm font-extrabold text-emerald-400">
                          {formatCurrency(parseFloat(currentPrice) || 0, currency)}
                        </span>
                      )}
                    </div>
                    {change24h !== undefined && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                          change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {change24h >= 0 ? '+' : ''}{formatPercentage(change24h)} 24h
                      </span>
                    )}
                    {isOfflineCached && (
                      <span className="text-[9px] text-amber-300 block">Dato en caché</span>
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

                <div>
                  <label className="text-xs font-medium text-slate-400">Ticker o ISIN</label>
                  <input
                    type="text"
                    required
                    placeholder="AAPL, IE00B4L5Y983..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

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

              {/* Broker Selection using BrandPicker (Identical to New Movement) */}
              <BrandPicker
                selectedBrandId={brokerBrandId}
                onSelectBrand={(id) => setBrokerBrandId(id)}
                categoryId="cat-invest"
                label="Broker o Entidad Financiera (Opcional)"
                placeholder="Busca tu broker (MyInvestor, Trade Republic, Degiro, Kraken...)"
              />

              {/* Date & Initial Fee */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    Fecha Compra
                  </label>
                  <input
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Comisión inicial (€/$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={initialFee}
                    onChange={(e) => setInitialFee(e.target.value)}
                    className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* GASTO / INGRESO: Formulario Tradicional                        */
            /* ============================================================== */
            <div className="flex flex-col gap-4">
              {/* Amount Input */}
              <div>
                <label className="text-xs font-medium text-slate-400">Importe (€)</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-2xl bg-white/[0.07] border border-white/15 px-4 py-3 text-2xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">
                    EUR
                  </span>
                </div>
              </div>

              {/* Concept Input */}
              <div>
                <label className="text-xs font-medium text-slate-400">Concepto / Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra semanal, Netflix, Nómina..."
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                />
              </div>

              {/* Category Selector */}
              <div>
                <GlassSelect
                  label="Categoría"
                  value={selectedCatId}
                  onChange={(val) => setCategoryId(val)}
                  options={categoryOptions}
                />
              </div>

              {/* Brand Picker with Search */}
              <BrandPicker
                selectedBrandId={brandId}
                onSelectBrand={(id, suggestedCatId) => {
                  setBrandId(id);
                  if (suggestedCatId) {
                    const cat = categories.find((c) => c.id === suggestedCatId);
                    if (cat && cat.pillar === pillar) {
                      setCategoryId(suggestedCatId);
                    }
                  }
                  if (id && !concept) {
                    const brand = getBrandById(id);
                    if (brand) setConcept(brand.name);
                  }
                }}
                categoryId={selectedCatId}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* RECURRENCE TOGGLE & CONFIGURATION (Shared across all pillars)   */}
          {/* ============================================================== */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-3.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border transition-colors ${
                    isRecurring
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">
                    {pillar === 'invest' ? 'Aportación periódica recurrente' : 'Hacer recurrente'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {pillar === 'invest'
                      ? 'Programa aportaciones periódicas en este activo'
                      : `Automatiza este ${pillar === 'income' ? 'ingreso' : 'gasto'}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 border ${
                  isRecurring
                    ? 'bg-indigo-600/80 border-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isRecurring ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isRecurring && (
              <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-3 animate-fadeIn">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                    Frecuencia de Repetición
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                    {(
                      [
                        { id: 'weekly', label: 'Semanal' },
                        { id: 'biweekly', label: 'Quincenal' },
                        { id: 'monthly', label: 'Mensual' },
                        { id: 'yearly', label: 'Anual' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrequency(f.id)}
                        className={`py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                          frequency === f.id
                            ? 'bg-indigo-500/30 border border-indigo-400/40 text-white shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frequency === 'weekly' && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                      Día de la semana
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {[
                        { day: 1, label: 'L' },
                        { day: 2, label: 'M' },
                        { day: 3, label: 'X' },
                        { day: 4, label: 'J' },
                        { day: 5, label: 'V' },
                        { day: 6, label: 'S' },
                        { day: 7, label: 'D' },
                      ].map((item) => (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => setDayOfWeek(item.day)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            dayOfWeek === item.day
                              ? 'bg-indigo-500/40 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {frequency === 'monthly' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-slate-400">
                      Día de cobro en el mes (1 - 31)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={dayOfMonth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            setDayOfMonth(Math.max(1, Math.min(31, val)));
                          }
                        }}
                        className="w-24 rounded-xl bg-white/10 border border-white/15 px-3 py-1.5 text-center text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                      />
                      <span className="text-xs text-slate-400">
                        {dayOfMonth === 1
                          ? 'Día 1 de cada mes'
                          : dayOfMonth >= 29
                          ? `Día ${dayOfMonth} (con ajuste a fin de mes)`
                          : `Día ${dayOfMonth} de cada mes`}
                      </span>
                    </div>

                    {dayOfMonth >= 29 && (
                      <div className="flex items-start gap-1.5 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          En meses de menos de {dayOfMonth} días (ej. febrero o abril), la regla se ejecutará automáticamente el último día disponible.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Fecha fin (opcional)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      placeholder="Sin fecha fin"
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    <div>
                      <span className="text-[11px] font-semibold text-slate-200 block">
                        Registrar automáticamente
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {autoCharge
                          ? 'Inserta el movimiento en la app en su fecha'
                          : 'Solo recordatorio sin crear transacción'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCharge}
                    onChange={(e) => setAutoCharge(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3.5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 hover:brightness-110 active:scale-[0.98] font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            {pillar === 'invest' ? 'Guardar Inversión en Cartera' : 'Guardar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  );
};
