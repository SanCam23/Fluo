import { useState, useEffect, useRef, useMemo } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Calendar,
  Pencil,
  Banknote,
  Wallet,
  ArrowLeftRight,
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
import { TransferFlowCard } from './transaction/TransferFlowCard';
import { RecurrenceSection } from './transaction/RecurrenceSection';
import { InvestmentFormFields } from './transaction/InvestmentFormFields';
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
            <InvestmentFormFields
              assetSearchRef={assetSearchRef}
              assetSearchQuery={assetSearchQuery}
              setAssetSearchQuery={setAssetSearchQuery}
              isAssetDropdownOpen={isAssetDropdownOpen}
              setIsAssetDropdownOpen={setIsAssetDropdownOpen}
              isSearchingAssets={isSearchingAssets}
              assetSearchResults={assetSearchResults}
              handleSelectAsset={handleSelectAsset}
              identifier={identifier}
              setIdentifier={setIdentifier}
              assetName={assetName}
              setAssetName={setAssetName}
              assetType={assetType}
              setAssetType={setAssetType}
              currency={currency}
              setCurrency={setCurrency}
              currentPrice={currentPrice}
              isFetchingQuote={isFetchingQuote}
              change24h={change24h}
              isOfflineCached={isOfflineCached}
              autocompleteContainerRef={autocompleteContainerRef}
              matchingExistingAssets={matchingExistingAssets}
              isAutocompleteOpen={isAutocompleteOpen}
              setIsAutocompleteOpen={setIsAutocompleteOpen}
              handleApplyAutocompleteMatch={handleApplyAutocompleteMatch}
              autocompletedNotice={autocompletedNotice}
              setAutocompletedNotice={setAutocompletedNotice}
              investInputMode={investInputMode}
              setInvestInputMode={setInvestInputMode}
              totalInvestedInput={totalInvestedInput}
              handleTotalInvestedChange={handleTotalInvestedChange}
              shares={shares}
              handleSharesChange={handleSharesChange}
              averageBuyPrice={averageBuyPrice}
              handleUnitPriceChange={handleUnitPriceChange}
              quoteVerified={quoteVerified}
              investFormErrors={investFormErrors}
              brokerBrandId={brokerBrandId}
              setBrokerBrandId={(id) => setBrokerBrandId(id || '')}
              selectedSourceId={selectedSourceId}
              setSelectedSourceId={setSelectedSourceId}
              investSourceOptions={investSourceOptions}
            />
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
                  <TransferFlowCard
                    sortedSources={sortedSources}
                    selectedSourceId={selectedSourceId}
                    destinationSourceId={destinationSourceId}
                    activeTransferPicker={activeTransferPicker}
                    setActiveTransferPicker={setActiveTransferPicker}
                    onSelectOrigin={(id) => setSelectedSourceId(id)}
                    onSelectDestination={(id) => setDestinationSourceId(id)}
                    onSwap={handleSwapSources}
                    amount={amount}
                    originSource={originSource}
                    destSource={destSource}
                    sourceOptions={sourceOptions}
                    destinationOptions={destinationOptions}
                    transferCardRef={transferCardRef}
                  />

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

          <RecurrenceSection
            pillar={pillar}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            frequency={frequency}
            setFrequency={setFrequency}
            dayOfWeek={dayOfWeek}
            setDayOfWeek={setDayOfWeek}
            dayOfMonth={dayOfMonth}
            setDayOfMonth={setDayOfMonth}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            autoCharge={autoCharge}
            setAutoCharge={setAutoCharge}
          />

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
