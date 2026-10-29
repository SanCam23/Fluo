import { useState, useEffect, useRef, useMemo } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
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
  Pencil,
  AlertTriangle,
  DollarSign,
  Hash,
  Banknote,
  Wallet,
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type {
  PillarType,
  RecurrenceFrequency,
  AssetType,
  MarketAssetItem,
  Transaction,
  SourceAccount,
} from '../../types/finance';
import { BrandPicker } from './BrandPicker';
import { GlassSelect } from '../common/GlassSelect';
import type { GlassSelectOption } from '../common/GlassSelect';
import { CategoryIcon } from '../common/CategoryIcon';
import { SourceAvatar } from '../common/SourceAvatar';
import { calculateFirstNextDueDate } from '../../services/recurringEngine';
import {
  searchAssets,
  fetchCurrentPrice,
  isIsin,
  getFundEquivalence,
  findMatchingExistingAssets,
} from '../../services/marketDataService';
import type { AutocompleteAssetMatch } from '../../services/marketDataService';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { getTodayDateString, getYesterdayDateString } from '../../utils/dates';
import {
  parseInvestmentConcept,
  findMatchingAssetIndex,
  inferAssetTypeFromCategory,
} from '../../utils/finance';
import {
  normalizeDecimalInput,
  parsePositiveNumber,
  calculateSharesFromTotal,
  calculateTotalFromShares,
  calculateAverageBuyPrice,
  isValidMarketPrice,
} from '../../utils/investmentValidation';

export type InvestInputMode = 'total' | 'shares';

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
  editingTransaction?: Transaction | null;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialPillar,
  editingTransaction,
}) => {
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const addRecurrence = useFinanceStore((state) => state.addRecurrence);
  const addAsset = useFinanceStore((state) => state.addAsset);
  const portfolioAssets = useFinanceStore((state) => state.assets);
  const getBrandById = useFinanceStore((state) => state.getBrandById);
  const activeTab = useFinanceStore((state) => state.activeTab);
  const sources = useFinanceStore((state) => state.sources);
  const activeSourceId = useFinanceStore((state) => state.activeSourceId);

  const sortedSources = useMemo(
    () => [...sources].sort((a, b) => a.orderIndex - b.orderIndex),
    [sources]
  );

  // Pillar selection
  const [pillar, setPillar] = useState<PillarType>(() => {
    if (editingTransaction) return editingTransaction.pillar;
    if (initialPillar) return initialPillar;
    if (activeTab === 'invest') return 'invest';
    return 'expense';
  });

  // Source selection state (defaults to activeSourceId or first source by orderIndex)
  const [activeTransferPicker, setActiveTransferPicker] = useState<'origin' | 'destination' | null>(null);
  const transferCardRef = useRef<HTMLDivElement>(null);

  const handleSwapSources = () => {
    if (sortedSources.length < 2) return;
    const oldOrigin = selectedSourceId;
    const oldDest = destinationSourceId;
    setSelectedSourceId(oldDest);
    setDestinationSourceId(oldOrigin);
    setActiveTransferPicker(null);
  };

  const [destinationSourceId, setDestinationSourceId] = useState<string>(() => {
    const origin = editingTransaction?.sourceId || activeSourceId || sortedSources[0]?.id || '';
    return sortedSources.find((s) => s.id !== origin)?.id || '';
  });

  const [selectedSourceId, setSelectedSourceId] = useState<string>(() => {
    if (editingTransaction?.sourceId) return editingTransaction.sourceId;
    return activeSourceId || sortedSources[0]?.id || '';
  });

  // Movement date selection state
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  // Standard movement fields (Expense / Income)
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  // Investment-specific fields
  const [investInputMode, setInvestInputMode] = useState<InvestInputMode>('total');
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
  const [acquisitionDate, setAcquisitionDate] = useState(() => getTodayDateString());
  const [initialFee, setInitialFee] = useState('');
  const [change24h, setChange24h] = useState<number | undefined>(undefined);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteVerified, setQuoteVerified] = useState<boolean>(false);
  const [investFormErrors, setInvestFormErrors] = useState<string[]>([]);

  // Autocomplete by Ticker or ISIN state (matches existing portfolio & catalogue)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const [autocompletedNotice, setAutocompletedNotice] = useState<string | null>(null);

  const matchingExistingAssets = useMemo(() => {
    if (pillar !== 'invest') return [];
    return findMatchingExistingAssets(identifier, portfolioAssets);
  }, [identifier, portfolioAssets, pillar]);

  // Whenever modal opens or activeTab/editingTransaction changes, auto-align state
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setPillar(editingTransaction.pillar);
        setAmount(editingTransaction.amount.toString());
        setConcept(editingTransaction.concept);
        setCategoryId(editingTransaction.categoryId);
        setBrandId(editingTransaction.brandId || '');

        const txDateStr = editingTransaction.date
          ? editingTransaction.date.substring(0, 10)
          : getTodayDateString();
        setSelectedDate(txDateStr);
        setStartDate(txDateStr);
        setIsRecurring(!!editingTransaction.isRecurring);

        if (editingTransaction.pillar === 'invest') {
          // Source: strictly keep empty string if editingTransaction has no sourceId (external funds)
          setSelectedSourceId(editingTransaction.sourceId || '');

          // Parse concept (e.g. 'Inversión en Vanguard US 500 (IE0032126645)' or 'Tesla (TSLA)')
          const { name: parsedName, identifier: parsedIdent } = parseInvestmentConcept(editingTransaction.concept);

          // Find matching asset in portfolio
          const assetIdx = findMatchingAssetIndex(portfolioAssets, {
            identifier: parsedIdent,
            name: parsedName,
          });
          const matchedAsset = assetIdx !== -1 ? portfolioAssets[assetIdx] : undefined;

          const resolvedName = parsedName || matchedAsset?.name || editingTransaction.concept;
          const resolvedIdent = parsedIdent || matchedAsset?.identifier || matchedAsset?.ticker || matchedAsset?.isin || '';
          const resolvedTicker = matchedAsset?.ticker || (resolvedIdent && !isIsin(resolvedIdent) ? resolvedIdent : '');
          const resolvedIsin = matchedAsset?.isin || (resolvedIdent && isIsin(resolvedIdent) ? resolvedIdent : '');
          const resolvedType = matchedAsset?.assetType || inferAssetTypeFromCategory(editingTransaction.categoryId, resolvedIdent);

          setAssetName(resolvedName);
          setIdentifier(resolvedIdent);
          setTicker(resolvedTicker);
          setIsin(resolvedIsin);
          setAssetType(resolvedType);
          setCurrency(matchedAsset?.currency || 'EUR');
          setBrokerBrandId(editingTransaction.brandId || matchedAsset?.brandId || '');
          setAcquisitionDate(txDateStr);

          // Derive price and shares
          let unitPrice = 0;
          if (typeof editingTransaction.unitPrice === 'number' && editingTransaction.unitPrice > 0) {
            unitPrice = editingTransaction.unitPrice;
          } else if (matchedAsset && typeof matchedAsset.averageBuyPrice === 'number' && matchedAsset.averageBuyPrice > 0) {
            unitPrice = matchedAsset.averageBuyPrice;
          } else if (matchedAsset && typeof matchedAsset.currentPrice === 'number' && matchedAsset.currentPrice > 0) {
            unitPrice = matchedAsset.currentPrice;
          } else if (typeof editingTransaction.shares === 'number' && editingTransaction.shares > 0) {
            unitPrice = Number((editingTransaction.amount / editingTransaction.shares).toFixed(4));
          } else {
            unitPrice = editingTransaction.amount;
          }

          let numShares = 0;
          if (typeof editingTransaction.shares === 'number' && editingTransaction.shares > 0) {
            numShares = editingTransaction.shares;
          } else if (unitPrice > 0) {
            numShares = calculateSharesFromTotal(editingTransaction.amount, unitPrice) ?? 1;
          } else {
            numShares = 1;
          }

          setShares(numShares.toString());
          setAverageBuyPrice(unitPrice.toString());
          setTotalInvestedInput(editingTransaction.amount.toString());
          setCurrentPrice((matchedAsset?.currentPrice || unitPrice).toString());
          setQuoteVerified(true);
          setInvestInputMode('total');
          setAssetSearchQuery('');
          setAssetSearchResults([]);
          setIsAssetDropdownOpen(false);
          setIsAutocompleteOpen(false);
          setInvestFormErrors([]);
        } else {
          setSelectedSourceId(editingTransaction.sourceId || activeSourceId || sortedSources[0]?.id || '');
        }
      } else {
        setAssetSearchQuery('');
        setAssetSearchResults([]);
        setIsAssetDropdownOpen(false);
        setIsAutocompleteOpen(false);
        setInvestFormErrors([]);
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
        setAmount('');
        setConcept('');
        setCategoryId('');
        setBrandId('');
    setDestinationSourceId(sortedSources.find((s) => s.id !== (activeSourceId || sortedSources[0]?.id))?.id || '');
        const today = getTodayDateString();
        setSelectedDate(today);
        setStartDate(today);
        setAcquisitionDate(today);
        setSelectedSourceId(activeSourceId || sortedSources[0]?.id || '');
        if (initialPillar) {
          setPillar(initialPillar);
        } else if (activeTab === 'invest') {
          setPillar('invest');
        } else {
          setPillar('expense');
        }
      }
    }
  }, [isOpen, initialPillar, activeTab, editingTransaction, sortedSources, activeSourceId, portfolioAssets]);

  // Handle Escape key to close modal on desktop
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Source Options for Liquid Glass Select
  const sourceOptions: GlassSelectOption<string>[] = useMemo(() => {
    return sortedSources.map((source: SourceAccount) => ({
      value: source.id,
      label: source.name,
      subtitle: source.institution || (source.type === 'bank' ? 'Banco' : 'Efectivo'),
      icon: <SourceAvatar source={source} size="xs" />,
    }));
  }, [sortedSources]);

  // Investment Source Options (Includes option for external funds without debiting accounts)
  const investSourceOptions: GlassSelectOption<string>[] = useMemo(() => {
    return [
      {
        value: '',
        label: 'Sin cuenta vinculada (Fondos externos)',
        subtitle: 'No descuenta saldo de tus cuentas',
        icon: <Wallet className="h-3.5 w-3.5 text-slate-400" />,
      },
      ...sourceOptions,
    ];
  }, [sourceOptions]);

  // Destination options for transfers (filters out selected origin source)
  const destinationOptions: GlassSelectOption<string>[] = useMemo(() => {
    return sortedSources
      .filter((s) => s.id !== selectedSourceId)
      .map((source: SourceAccount) => ({
        value: source.id,
        label: source.name,
        subtitle: source.institution || (source.type === 'bank' ? 'Cuenta bancaria' : 'Billetera efectivo'),
        icon: <SourceAvatar source={source} size="xs" />,
      }));
  }, [sortedSources, selectedSourceId]);

  // Keep destination source distinct from origin source
  useEffect(() => {
    if (selectedSourceId && destinationSourceId === selectedSourceId) {
      const nextDest = sortedSources.find((s) => s.id !== selectedSourceId)?.id || '';
      setDestinationSourceId(nextDest);
    } else if (!destinationSourceId && sortedSources.length > 1) {
      const nextDest = sortedSources.find((s) => s.id !== selectedSourceId)?.id || '';
      setDestinationSourceId(nextDest);
    }
  }, [selectedSourceId, destinationSourceId, sortedSources]);

  // Recurrence granular configuration (Available for all pillars, including investment DCA)
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(() => new Date().getDate());
  const [startDate, setStartDate] = useState<string>(() => getTodayDateString());
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

  // Click outside listener for asset dropdown & autocomplete
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assetSearchRef.current && !assetSearchRef.current.contains(e.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
      if (transferCardRef.current && !transferCardRef.current.contains(e.target as Node)) {
        setActiveTransferPicker(null);
      }
      if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(e.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter categories matching the selected pillar
  const availableCategories = categories.filter((c) => c.pillar === pillar);
  const selectedCatId = categoryId || (availableCategories[0]?.id ?? (pillar === 'invest' ? 'cat-etf' : ''));
  const isTransferMode = pillar === 'expense' && selectedCatId === 'cat-transfer';
  const originSource = sortedSources.find((s) => s.id === selectedSourceId);
  const destSource = sortedSources.find((s) => s.id === destinationSourceId);

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
    setIsin(item.isin || (isIsin(item.identifier) ? item.identifier : ''));
    setAssetType(item.assetType);
    setCurrency(item.currency);
    setCurrentPrice(item.basePrice.toString());
    setChange24h(item.change24h);
    setIsAssetDropdownOpen(false);
    setAssetSearchQuery('');
    setQuoteVerified(isValidMarketPrice(item.basePrice));
    setInvestFormErrors([]);

    if (!averageBuyPrice) {
      setAverageBuyPrice(item.basePrice.toString());
      // Auto-calc shares in "by total" mode
      const totalNum = parsePositiveNumber(totalInvestedInput);
      if (investInputMode === 'total' && totalNum !== null && isValidMarketPrice(item.basePrice)) {
        const calcShares = calculateSharesFromTotal(totalNum, item.basePrice);
        if (calcShares !== null) setShares(calcShares.toString());
      } else {
        // "by shares" mode: recalculate total
        const s = parsePositiveNumber(shares);
        if (s !== null) {
          const calcTotal = calculateTotalFromShares(s, item.basePrice);
          if (calcTotal !== null) setTotalInvestedInput(calcTotal.toString());
        }
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
      setQuoteVerified(isValidMarketPrice(quote.price));
      if (!averageBuyPrice || averageBuyPrice === item.basePrice.toString()) {
        setAverageBuyPrice(quote.price.toString());
        // Recalculate based on mode
        if (investInputMode === 'total') {
          const totalNum = parsePositiveNumber(totalInvestedInput);
          if (totalNum !== null && isValidMarketPrice(quote.price)) {
            const calcShares = calculateSharesFromTotal(totalNum, quote.price);
            if (calcShares !== null) setShares(calcShares.toString());
          }
        } else {
          const s = parsePositiveNumber(shares);
          if (s !== null) {
            const calcTotal = calculateTotalFromShares(s, quote.price);
            if (calcTotal !== null) setTotalInvestedInput(calcTotal.toString());
          }
        }
      }
    } catch {
      setQuoteVerified(false);
    } finally {
      setIsFetchingQuote(false);
    }
  };

  // Handle autocomplete selection from existing portfolio or catalog matches
  const handleApplyAutocompleteMatch = async (match: AutocompleteAssetMatch) => {
    setAssetName(match.name);
    setIdentifier(match.identifier);
    setTicker(match.ticker || (match.assetType === 'stock' || match.assetType === 'crypto' ? match.identifier : ''));
    setIsin(match.isin || (isIsin(match.identifier) ? match.identifier : ''));
    setAssetType(match.assetType);
    setCurrency(match.currency);
    if (match.brandId) {
      setBrokerBrandId(match.brandId);
    }
    if (match.currentPrice > 0) {
      setCurrentPrice(match.currentPrice.toString());
      setQuoteVerified(isValidMarketPrice(match.currentPrice));
    }
    setIsAutocompleteOpen(false);
    setAutocompletedNotice(match.name);
    setTimeout(() => setAutocompletedNotice(null), 3500);

    const priceToUse = match.currentPrice || match.averageBuyPrice || 0;
    if (!averageBuyPrice && priceToUse > 0) {
      setAverageBuyPrice(priceToUse.toString());
      const totalNum = parsePositiveNumber(totalInvestedInput);
      if (investInputMode === 'total' && totalNum !== null && isValidMarketPrice(priceToUse)) {
        const calcShares = calculateSharesFromTotal(totalNum, priceToUse);
        if (calcShares !== null) setShares(calcShares.toString());
      } else {
        const s = parsePositiveNumber(shares);
        if (s !== null) {
          const calcTotal = calculateTotalFromShares(s, priceToUse);
          if (calcTotal !== null) setTotalInvestedInput(calcTotal.toString());
        }
      }
    }

    // Try fetching fresh live quote in background
    setIsFetchingQuote(true);
    try {
      const quote = await fetchCurrentPrice(match.identifier);
      if (quote && quote.price > 0) {
        setCurrentPrice(quote.price.toString());
        setCurrency(quote.currency);
        setChange24h(quote.change24h);
        setIsOfflineCached(quote.isOfflineCached);
        setQuoteVerified(isValidMarketPrice(quote.price));
        if (!averageBuyPrice && !match.averageBuyPrice) {
          setAverageBuyPrice(quote.price.toString());
          if (investInputMode === 'total') {
            const totalNum = parsePositiveNumber(totalInvestedInput);
            if (totalNum !== null && isValidMarketPrice(quote.price)) {
              const calcShares = calculateSharesFromTotal(totalNum, quote.price);
              if (calcShares !== null) setShares(calcShares.toString());
            }
          } else {
            const s = parsePositiveNumber(shares);
            if (s !== null) {
              const calcTotal = calculateTotalFromShares(s, quote.price);
              if (calcTotal !== null) setTotalInvestedInput(calcTotal.toString());
            }
          }
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsFetchingQuote(false);
    }
  };

  // Bidirectional calculations: shares & unit price <-> total invested
  // Uses normalizeDecimalInput to support comma separators from mobile keyboards
  const handleSharesChange = (rawVal: string) => {
    const val = normalizeDecimalInput(rawVal);
    setShares(val);
    const numShares = parsePositiveNumber(val);
    const numUnit = parsePositiveNumber(averageBuyPrice);
    if (numShares !== null && numUnit !== null) {
      const total = calculateTotalFromShares(numShares, numUnit);
      if (total !== null) setTotalInvestedInput(total.toString());
    }
  };

  const handleUnitPriceChange = (rawVal: string) => {
    const val = normalizeDecimalInput(rawVal);
    setAverageBuyPrice(val);
    const numUnit = parsePositiveNumber(val);
    if (investInputMode === 'total') {
      // In total mode: recalculate shares from total and new price
      const numTotal = parsePositiveNumber(totalInvestedInput);
      if (numTotal !== null && numUnit !== null) {
        const calcShares = calculateSharesFromTotal(numTotal, numUnit);
        if (calcShares !== null) setShares(calcShares.toString());
      }
    } else {
      // In shares mode: recalculate total
      const numShares = parsePositiveNumber(shares);
      if (numUnit !== null && numShares !== null) {
        const total = calculateTotalFromShares(numShares, numUnit);
        if (total !== null) setTotalInvestedInput(total.toString());
      }
    }
  };

  const handleTotalInvestedChange = (rawVal: string) => {
    const val = normalizeDecimalInput(rawVal);
    setTotalInvestedInput(val);
    const numTotal = parsePositiveNumber(val);
    const numUnit = parsePositiveNumber(averageBuyPrice) ?? parsePositiveNumber(currentPrice);
    if (numTotal !== null && numUnit !== null && numUnit > 0) {
      // Calculate shares from total using unit price
      const calcShares = calculateSharesFromTotal(numTotal, numUnit);
      if (calcShares !== null) setShares(calcShares.toString());
      if (!averageBuyPrice) setAverageBuyPrice(numUnit.toString());
    } else if (numTotal !== null) {
      // If no buy price yet, derive from shares if user entered shares
      const numShares = parsePositiveNumber(shares);
      if (numShares !== null && numShares > 0) {
        const avgP = calculateAverageBuyPrice(numTotal, numShares);
        if (avgP !== null) setAverageBuyPrice(avgP.toString());
      }
    }
  };

  const resetAllFormState = () => {
    setAmount('');
    setConcept('');
    setBrandId('');
    setDestinationSourceId(sortedSources.find((s) => s.id !== (activeSourceId || sortedSources[0]?.id))?.id || '');
    const today = getTodayDateString();
    setSelectedDate(today);
    setStartDate(today);
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
    setInvestFormErrors([]);

    if (pillar === 'invest') {
      // --- Strict runtime validation ---
      const errors: string[] = [];

      if (!identifier.trim()) errors.push('El identificador del activo es obligatorio.');
      if (!assetName.trim()) errors.push('El nombre del activo es obligatorio.');

      const numBuyPrice = parsePositiveNumber(averageBuyPrice);
      if (numBuyPrice === null) errors.push('El precio de compra por título debe ser un número positivo.');

      let numShares = parsePositiveNumber(shares);
      const numTotal = parsePositiveNumber(totalInvestedInput);

      // In "by total" mode, auto-derive shares strictly from total / unit price
      if (investInputMode === 'total') {
        if (numTotal === null) {
          errors.push('El importe total desembolsado debe ser un número positivo.');
        } else if (numBuyPrice !== null && numBuyPrice > 0) {
          numShares = calculateSharesFromTotal(numTotal, numBuyPrice);
          if (numShares !== null) setShares(numShares.toString());
        }
      }

      if (numShares === null || numShares <= 0) {
        errors.push('La cantidad de títulos debe ser un número positivo.');
      }

      if (errors.length > 0) {
        setInvestFormErrors(errors);
        return;
      }

      // At this point numShares and numBuyPrice are guaranteed valid
      const safeShares = numShares!;
      const safeBuyPrice = numBuyPrice!;
      const numCurrentPrice = parsePositiveNumber(currentPrice) ?? safeBuyPrice;
      const numFee = parsePositiveNumber(initialFee) ?? 0;

      const brokerBrand = getBrandById(brokerBrandId);
      const numTotalInput = parsePositiveNumber(totalInvestedInput);
      const totalAmount =
        investInputMode === 'total' && numTotalInput !== null
          ? numTotalInput + numFee
          : Number((safeShares * safeBuyPrice + numFee).toFixed(2));

      let txDate: string;
      if (acquisitionDate) {
        if (editingTransaction?.date && editingTransaction.date.substring(0, 10) === acquisitionDate) {
          txDate = editingTransaction.date;
        } else {
          txDate = new Date(`${acquisitionDate}T12:00:00.000Z`).toISOString();
        }
      } else {
        txDate = editingTransaction ? editingTransaction.date : new Date().toISOString();
      }

      if (editingTransaction) {
        // === EDITING EXISTING INVESTMENT TRANSACTION ===
        updateTransaction(editingTransaction.id, {
          amount: totalAmount,
          shares: safeShares,
          unitPrice: safeBuyPrice,
          pillar: 'invest',
          categoryId: selectedCatId || editingTransaction.categoryId || 'cat-etf',
          brandId: brokerBrandId || undefined,
          sourceId: selectedSourceId ? selectedSourceId : undefined,
          concept: `Inversión en ${assetName.trim()} (${identifier.trim().toUpperCase()})`,
          date: txDate,
        });

        resetAllFormState();
        onClose();
        return;
      }

      // 1. Register asset in portfolio
      const cleanIdent = identifier.trim().toUpperCase();
      const cleanIsin = isin.trim().toUpperCase() || (isIsin(cleanIdent) ? cleanIdent : undefined);
      const fundEq = cleanIsin ? getFundEquivalence(cleanIsin) : undefined;
      const resolvedQuoteTicker = fundEq?.referenceTicker || ticker.trim().toUpperCase() || undefined;

      addAsset({
        name: assetName.trim(),
        identifier: cleanIdent,
        ticker: ticker.trim().toUpperCase() || undefined,
        isin: cleanIsin,
        quoteTicker: resolvedQuoteTicker,
        quote_ticker: resolvedQuoteTicker,
        assetType,
        shares: safeShares,
        averageBuyPrice: safeBuyPrice,
        averagePrice: safeBuyPrice,
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
      const recurrenceId = isRecurring
        ? `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        : undefined;

      addTransaction({
        amount: totalAmount,
        shares: safeShares,
        unitPrice: safeBuyPrice,
        pillar: 'invest',
        categoryId: selectedCatId || 'cat-etf',
        brandId: brokerBrandId || undefined,
        sourceId: selectedSourceId ? selectedSourceId : undefined,
        concept: `Inversión en ${assetName.trim()} (${identifier.trim().toUpperCase()})`,
        date: txDate,
        isRecurring,
        recurrenceId,
      });

      // 3. Register recurring DCA rule if configured
      if (isRecurring && recurrenceId) {
        const nextDue = calculateFirstNextDueDate(new Date(txDate), {
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
          startDate: txDate,
        });

        addRecurrence({
          id: recurrenceId,
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

    // ==============================================================
    // TRANSFER SUBMISSION (Between user's accounts or cash wallet)
    // ==============================================================
    if (isTransferMode) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;
      if (!destinationSourceId || destinationSourceId === selectedSourceId) return;

      const dest = sortedSources.find((s) => s.id === destinationSourceId);

      const customConcept = concept.trim();
      const expenseConcept = customConcept
        ? `Traspaso a ${dest?.name || 'otra cuenta'} (${customConcept})`
        : `Traspaso a ${dest?.name || 'otra cuenta'}`;

      let txDate: string;
      if (selectedDate === todayStr) {
        txDate = new Date().toISOString();
      } else if (selectedDate) {
        txDate = new Date(`${selectedDate}T12:00:00.000Z`).toISOString();
      } else {
        txDate = new Date().toISOString();
      }

      if (editingTransaction) {
        updateTransaction(editingTransaction.id, {
          amount: numAmount,
          pillar: 'expense',
          categoryId: 'cat-transfer',
          sourceId: selectedSourceId,
          concept: customConcept || editingTransaction.concept || expenseConcept,
          date: txDate,
        });

        resetAllFormState();
        onClose();
        return;
      }

      const recurrenceId = isRecurring
        ? `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        : undefined;

      addTransaction({
        amount: numAmount,
        pillar: 'expense',
        categoryId: 'cat-transfer',
        sourceId: selectedSourceId || sortedSources[0]?.id,
        destinationSourceId,
        concept: expenseConcept,
        date: txDate,
        isRecurring,
        recurrenceId,
      });

      if (isRecurring && recurrenceId) {
        const nextDue = calculateFirstNextDueDate(new Date(txDate), {
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
          startDate: txDate,
        });

        addRecurrence({
          id: recurrenceId,
          title: expenseConcept,
          amount: numAmount,
          pillar: 'expense',
          categoryId: 'cat-transfer',
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

    // Editing existing movement
    if (editingTransaction) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;
      if (!concept.trim()) return;

      let txDate: string;
      if (selectedDate) {
        if (editingTransaction.date && editingTransaction.date.substring(0, 10) === selectedDate) {
          txDate = editingTransaction.date;
        } else {
          txDate = new Date(`${selectedDate}T12:00:00.000Z`).toISOString();
        }
      } else {
        txDate = editingTransaction.date;
      }

      updateTransaction(editingTransaction.id, {
        amount: numAmount,
        pillar,
        categoryId: selectedCatId,
        brandId: brandId || undefined,
        sourceId: selectedSourceId ? selectedSourceId : undefined,
        concept: concept.trim(),
        date: txDate,
      });

      resetAllFormState();
      onClose();
      return;
    }

    // Standard Expense / Income submission
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!concept.trim()) return;

    const today = getTodayDateString();
    let txDate: string;
    if (selectedDate === today) {
      txDate = new Date().toISOString();
    } else if (selectedDate) {
      txDate = new Date(`${selectedDate}T12:00:00.000Z`).toISOString();
    } else {
      txDate = new Date().toISOString();
    }

    const recurrenceId = isRecurring
      ? `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : undefined;

    addTransaction({
      amount: numAmount,
      pillar,
      categoryId: selectedCatId,
      brandId: brandId || undefined,
      sourceId: selectedSourceId || sortedSources[0]?.id || undefined,
      concept: concept.trim(),
      date: txDate,
      isRecurring,
      recurrenceId,
    });

    if (isRecurring && recurrenceId) {
      const nextDue = calculateFirstNextDueDate(new Date(txDate), {
        frequency,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        startDate: txDate,
      });

      addRecurrence({
        id: recurrenceId,
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
    stock: 'bg-blue-500/20 text-blue-300 border-blue-500/30 light:bg-blue-500/10 light:text-blue-700 light:border-blue-500/30',
    etf: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 light:bg-indigo-500/10 light:text-indigo-700 light:border-indigo-500/30',
    index_fund: 'bg-purple-500/20 text-purple-300 border-purple-500/30 light:bg-purple-500/10 light:text-purple-700 light:border-purple-500/30',
    crypto: 'bg-amber-500/20 text-amber-300 border-amber-500/30 light:bg-amber-500/15 light:text-amber-800 light:border-amber-500/35',
    fixed_income: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 light:bg-emerald-500/10 light:text-emerald-700 light:border-emerald-500/30',
    deposit: 'bg-teal-500/20 text-teal-300 border-teal-500/30 light:bg-teal-500/10 light:text-teal-700 light:border-teal-500/30',
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md lg:backdrop-blur-3xl transition-all duration-300 gpu-layer transform-gpu"
    >
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0E1526]/95 lg:bg-slate-950/80 border border-white/20 lg:border-white/15 rounded-t-3xl sm:rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-2xl lg:backdrop-blur-3xl relative overflow-hidden gpu-layer transform-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              {editingTransaction ? (
                <>
                  <Pencil className="h-4 w-4 text-indigo-400" />
                  Editar Movimiento
                </>
              ) : pillar === 'invest' ? (
                'Nueva Inversión'
              ) : (
                'Nuevo Movimiento'
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              {editingTransaction
                ? 'Modifica los datos del registro y guarda los cambios'
                : pillar === 'invest'
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

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1 pb-6 sm:pb-2">
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
                      <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${assetTypeColors[assetType]}`}>
                        {assetTypeLabels[assetType]}
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
                <>
                  {/* Total Amount Input (Primary in "by total" mode) */}
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
                </>
              ) : (
                <>
                  {/* Shares / Decimal Units (Primary in "by shares" mode) */}
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
                </>
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
          ) : (
            <div className="flex flex-col gap-4">
              {/* Amount Input */}
              <div>
                <label className="text-xs font-medium text-slate-400">
                  {isTransferMode ? 'Importe a Traspasar (€)' : 'Importe (€)'}
                </label>
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

              {/* Category Selector */}
              <div>
                <GlassSelect
                  label="Categoría"
                  value={selectedCatId}
                  onChange={(val) => setCategoryId(val)}
                  options={categoryOptions}
                />
              </div>

              {isTransferMode ? (
                /* ============================================================== */
                /* TRANSFER INTERFACE (Cuentas <-> Cuentas / Billetera Efectivo)  */
                /* ============================================================== */
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {/* Visual Transfer Flow Liquid Glass Card with In-Place Interactive Pickers */}
                  <div
                    ref={transferCardRef}
                    className="p-4 rounded-2xl bg-indigo-500/10 light:bg-indigo-50/70 border border-indigo-500/20 light:border-indigo-200/80 backdrop-blur-xl flex flex-col gap-3 shadow-[0_8px_32px_0_rgba(99,102,241,0.15)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                          <ArrowLeftRight className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white light:text-slate-900 block">
                            Traspaso entre Cuentas y Efectivo
                          </span>
                          <span className="text-[11px] text-slate-400 light:text-slate-600 block">
                            Pulsa sobre el origen o destino para cambiar de cuenta
                          </span>
                        </div>
                      </div>
                      {parseFloat(amount) > 0 && (
                        <span className="text-xs font-bold text-indigo-300 light:text-indigo-700 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                          {formatCurrency(parseFloat(amount))}
                        </span>
                      )}
                    </div>

                    {/* Flow Indicator with In-Place Interactive Buttons */}
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/[0.04] light:bg-white/60 border border-white/10 light:border-slate-200">
                      {/* Origin Account Interactive Button */}
                      <button
                        type="button"
                        onClick={() =>
                          sortedSources.length >= 2 &&
                          setActiveTransferPicker(activeTransferPicker === 'origin' ? null : 'origin')
                        }
                        className={`flex items-center gap-2 min-w-0 flex-1 p-2 rounded-xl text-left transition-all cursor-pointer ${
                          activeTransferPicker === 'origin'
                            ? 'bg-indigo-600/30 border border-indigo-400/50 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'hover:bg-white/[0.08] border border-transparent'
                        } ${sortedSources.length < 2 ? 'cursor-default' : ''}`}
                      >
                        {originSource && <SourceAvatar source={originSource} size="xs" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block truncate">
                              Desde
                            </span>
                            {sortedSources.length >= 2 && (
                              <ChevronDown
                                className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                                  activeTransferPicker === 'origin' ? 'rotate-180 text-indigo-400' : ''
                                }`}
                              />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white light:text-slate-800 truncate block">
                            {originSource?.name || 'Selecciona origen'}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {originSource?.institution || (originSource?.type === 'bank' ? 'Cuenta bancaria' : 'Billetera efectivo')}
                          </span>
                        </div>
                      </button>

                      {/* Swap Button in Center */}
                      <div className="flex flex-col items-center justify-center shrink-0 px-1">
                        <button
                          type="button"
                          title="Intercambiar cuentas (Origen <-> Destino)"
                          onClick={handleSwapSources}
                          disabled={sortedSources.length < 2}
                          className={`w-7 h-7 rounded-full bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/40 hover:border-indigo-400/60 flex items-center justify-center text-indigo-300 active:scale-90 transition-all shadow-sm ${
                            sortedSources.length < 2 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Destination Account Interactive Button */}
                      <button
                        type="button"
                        onClick={() =>
                          sortedSources.length >= 2 &&
                          setActiveTransferPicker(activeTransferPicker === 'destination' ? null : 'destination')
                        }
                        className={`flex items-center gap-2 min-w-0 flex-1 p-2 rounded-xl text-right justify-end transition-all cursor-pointer ${
                          activeTransferPicker === 'destination'
                            ? 'bg-indigo-600/30 border border-indigo-400/50 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'hover:bg-white/[0.08] border border-transparent'
                        } ${sortedSources.length < 2 ? 'cursor-default' : ''}`}
                      >
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block truncate">
                              Hacia
                            </span>
                            {sortedSources.length >= 2 && (
                              <ChevronDown
                                className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                                  activeTransferPicker === 'destination' ? 'rotate-180 text-indigo-400' : ''
                                }`}
                              />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white light:text-slate-800 truncate block">
                            {destSource?.name || 'Selecciona destino'}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {destSource?.institution || (destSource?.type === 'bank' ? 'Cuenta bancaria' : 'Billetera efectivo')}
                          </span>
                        </div>
                        {destSource && <SourceAvatar source={destSource} size="xs" />}
                      </button>
                    </div>

                    {/* In-Place Liquid Glass Drawer for Account Selection */}
                    {activeTransferPicker && sortedSources.length >= 2 && (
                      <div className="pt-2.5 border-t border-white/10 flex flex-col gap-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                          <span className="font-semibold text-indigo-300">
                            {activeTransferPicker === 'origin'
                              ? 'Elige la cuenta o billetera de origen (Desde):'
                              : 'Elige la cuenta o billetera de destino (Hacia):'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTransferPicker(null)}
                            className="text-[10px] text-slate-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            Cerrar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
                          {(activeTransferPicker === 'origin' ? sourceOptions : destinationOptions).map((opt) => {
                            const isSelected =
                              activeTransferPicker === 'origin'
                                ? opt.value === selectedSourceId
                                : opt.value === destinationSourceId;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  if (activeTransferPicker === 'origin') {
                                    setSelectedSourceId(opt.value);
                                  } else {
                                    setDestinationSourceId(opt.value);
                                  }
                                  setActiveTransferPicker(null);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600/35 border border-indigo-400/50 text-white font-semibold shadow-sm'
                                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/5 hover:border-white/15'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {opt.icon}
                                  <div className="min-w-0 truncate">
                                    <span className="text-xs font-medium block truncate text-white">
                                      {opt.label}
                                    </span>
                                    {opt.subtitle && (
                                      <span className="text-[10px] text-slate-400 block truncate">
                                        {opt.subtitle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Single Account Warning */}
                    {sortedSources.length < 2 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>
                          Para realizar traspasos necesitas tener al menos dos cuentas o billeteras registradas.
                          Puedes añadir una cuenta bancaria o tu billetera de efectivo desde tu <strong>Perfil &gt; Mis Fuentes</strong>.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fecha del Traspaso */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        Fecha del traspaso
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(todayStr);
                            setStartDate(todayStr);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate === todayStr
                              ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Hoy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(yesterdayStr);
                            setStartDate(yesterdayStr);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate === yesterdayStr
                              ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Ayer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dateInputRef.current?.showPicker?.();
                            dateInputRef.current?.focus();
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate !== todayStr && selectedDate !== yesterdayStr
                              ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Elegir fecha
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedDate(val);
                          if (val) setStartDate(val);
                        }}
                        className="w-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors [color-scheme:dark] cursor-pointer"
                      />
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Concept Input (Optional in transfer) */}
                  <div>
                    <label className="text-xs font-medium text-slate-400">Concepto / Motivo (opcional)</label>
                    <input
                      type="text"
                      placeholder={`Ej. Traspaso a ${destSource?.name || 'cuenta'} (opcional)`}
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-white/[0.07] border border-white/15 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                    />
                  </div>
                </div>
              ) : (
                /* ============================================================== */
                /* GASTO / INGRESO TRADICIONAL                                    */
                /* ============================================================== */
                <>
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

                  {/* Fecha del movimiento (Liquid Glass Date Selector) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        Fecha del movimiento
                      </label>
                      {/* Quick Pills */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(todayStr);
                            setStartDate(todayStr);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate === todayStr
                              ? pillar === 'income'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm font-semibold'
                                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Hoy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(yesterdayStr);
                            setStartDate(yesterdayStr);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate === yesterdayStr
                              ? pillar === 'income'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm font-semibold'
                                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Ayer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dateInputRef.current?.showPicker?.();
                            dateInputRef.current?.focus();
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            selectedDate !== todayStr && selectedDate !== yesterdayStr
                              ? pillar === 'income'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm font-semibold'
                                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm font-semibold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                          }`}
                        >
                          Elegir fecha
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedDate(val);
                          if (val) setStartDate(val);
                        }}
                        className="w-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 transition-colors [color-scheme:dark] cursor-pointer"
                      />
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Informative banner for ATM / Cajero cash companion deposit */}
                  {pillar === 'expense' && selectedCatId === 'cat-atm' && (
                    <div className="p-3 rounded-2xl bg-teal-500/10 light:bg-teal-50/80 border border-teal-500/25 light:border-teal-200 text-xs text-teal-300 light:text-teal-800 flex items-start gap-2.5 animate-fadeIn">
                      <Banknote className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-teal-200 light:text-teal-900">Retirada en Cajero Automático</span>
                        <span className="text-[11px] text-teal-300/80 light:text-teal-700 leading-relaxed">
                          {sources.some((s) => s.type === 'cash')
                            ? `Al guardar, se registrará este gasto en la cuenta origen y automáticamente un ingreso del mismo importe en tu cuenta de efectivo ("${
                                sources.find((s) => s.type === 'cash')?.name
                              }").`
                            : 'No tienes una cuenta de efectivo configurada aún. Puedes crear una desde tu Perfil > Fuentes para que las retiradas se abonen solas en tu efectivo.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Source Account Selector (Liquid Glass) */}
                  {sourceOptions.length > 0 && (
                    <div>
                      <GlassSelect
                        label="Cuenta o Fuente de Dinero"
                        value={selectedSourceId}
                        onChange={(val) => setSelectedSourceId(val)}
                        options={sourceOptions}
                        placeholder="Selecciona la cuenta o billetera..."
                      />
                    </div>
                  )}

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
                </>
              )}
            </div>
          )}

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
            disabled={isTransferMode && (sortedSources.length < 2 || !destinationSourceId || destinationSourceId === selectedSourceId)}
            className={`mt-2 w-full py-3.5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 hover:brightness-110 active:scale-[0.98] font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isTransferMode && (sortedSources.length < 2 || !destinationSourceId || destinationSourceId === selectedSourceId)
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {isTransferMode ? <ArrowLeftRight className="h-4 w-4" /> : <Check className="h-4 w-4 stroke-[3]" />}
            {editingTransaction
              ? 'Guardar Cambios'
              : pillar === 'invest'
              ? 'Guardar Inversión en Cartera'
              : isTransferMode
              ? 'Confirmar Traspaso'
              : 'Guardar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
