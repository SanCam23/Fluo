import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Layers,
} from 'lucide-react';
import { useFinanceStore, useFinancialSummary } from '../../store/useFinanceStore';
import type { PillarType, Transaction, SourceAccount } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { computeSourceBalance, computeAllSourceBalances, isInvestmentSource, computeInvestmentAccountSummary } from '../../utils/finance';
import { SourceAvatar } from '../common/SourceAvatar';

interface HeroBalanceProps {
  selectedPillar?: PillarType | 'all';
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  selectedPillar = 'all',
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const summary = useFinancialSummary();
  const isLiveUpdating = useFinanceStore((state) => state.isLiveUpdating);
  const refreshAllAssetPrices = useFinanceStore((state) => state.refreshAllAssetPrices);
  const transactions = useFinanceStore((state) => state.transactions);
  const assets = useFinanceStore((state) => state.assets);
  const sources = useFinanceStore((state) => state.sources);
  const activeSourceId = useFinanceStore((state) => state.activeSourceId);
  const setActiveSourceId = useFinanceStore((state) => state.setActiveSourceId);

  const activeSource = useMemo(
    () => (activeSourceId ? sources.find((s) => s.id === activeSourceId) : null),
    [sources, activeSourceId]
  );

  const sortedSources = useMemo(
    () => [...sources].sort((a, b) => a.orderIndex - b.orderIndex),
    [sources]
  );

  const sourceBalancesMap = useMemo(
    () => computeAllSourceBalances(sortedSources, transactions),
    [sortedSources, transactions]
  );

  const totalSlides = 1 + sortedSources.length;

  // Ensure carousel starts at 0 on mount if activeSourceId is null
  useEffect(() => {
    if (activeSourceId === null && scrollRef.current && scrollRef.current.scrollLeft !== 0) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [activeSourceId]);

  // Synchronize when activeSourceId changes externally
  useEffect(() => {
    const expectedSlide =
      activeSourceId === null
        ? 0
        : sortedSources.findIndex((s) => s.id === activeSourceId) + 1;
    if (expectedSlide >= 0 && expectedSlide < totalSlides && expectedSlide !== activeSlide) {
      if (scrollRef.current) {
        const targetLeft = expectedSlide * scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
        setActiveSlide(expectedSlide);
      }
    }
  }, [activeSourceId, sortedSources, totalSlides, activeSlide]);

  // Scroll synchronization (mobile carousel)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth <= 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeSlide && newIndex >= 0 && newIndex < totalSlides) {
      setActiveSlide(newIndex);
      const newSourceId = newIndex === 0 ? null : (sortedSources[newIndex - 1]?.id ?? null);
      setActiveSourceId(newSourceId);
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const targetLeft = index * scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });
    setActiveSlide(index);
    const newSourceId = index === 0 ? null : (sortedSources[index - 1]?.id ?? null);
    setActiveSourceId(newSourceId);
  };

  // Pillar-specific calculations for Slide 0 (Consolidated in a single pass)
  const {
    recurringIncome,
    recurringIncomeCount,
    maxIncomeTx,
    recurringExpense,
    recurringExpenseCount,
  } = useMemo(() => {
    let recIncome = 0;
    let recIncomeCount = 0;
    let maxIncome: Transaction | null = null;
    let recExpense = 0;
    let recExpenseCount = 0;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (tx.pillar === 'income') {
        const isRec = tx.isRecurring || tx.isRecurringGenerated;
        if (isRec) {
          recIncome += tx.amount;
          recIncomeCount++;
        }
        if (!maxIncome || tx.amount > maxIncome.amount) {
          maxIncome = tx;
        }
      } else if (tx.pillar === 'expense') {
        const isRec = tx.isRecurring || tx.isRecurringGenerated;
        if (isRec) {
          recExpense += tx.amount;
          recExpenseCount++;
        }
      }
    }

    return {
      recurringIncome: recIncome,
      recurringIncomeCount: recIncomeCount,
      maxIncomeTx: maxIncome,
      recurringExpense: recExpense,
      recurringExpenseCount: recExpenseCount,
    };
  }, [transactions]);
  const dailyAverageExpense = useMemo(() => {
    const daysPassed = Math.max(1, new Date().getDate());
    return summary.totalExpense / daysPassed;
  }, [summary.totalExpense]);

  // Investment calculations
  const { totalInvestedCost, portfolioPnL, portfolioPnLPercentage, isInvestProfit } =
    useMemo(() => {
      let cost = 0;
      let val = 0;
      assets.forEach((a) => {
        const fee = a.initialFee || 0;
        cost += a.shares * a.averageBuyPrice + fee;
        val += a.shares * a.currentPrice;
      });
      const pnl = val - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      return {
        totalInvestedCost: cost,
        portfolioPnL: pnl,
        portfolioPnLPercentage: pnlPct,
        isInvestProfit: pnl >= 0,
      };
    }, [assets]);

  // Main number for Slide 0 according to active pillar
  const mainAmountNumber = useMemo(() => {
    if (selectedPillar === 'income') return summary.totalIncome;
    if (selectedPillar === 'expense') return summary.totalExpense;
    if (selectedPillar === 'invest') return summary.portfolioMarketValue;
    return summary.netBalance;
  }, [selectedPillar, summary]);

  const formattedAmount = formatCurrency(mainAmountNumber);
  const [integerPart, decimalPart] = formattedAmount.split(',');

  // Card theme styling according to active pillar (exact Liquid Glass parity with AnalyticsView)
  const theme = useMemo(() => {
    switch (selectedPillar) {
      case 'income':
        return {
          border: 'border-emerald-500/30 light:border-emerald-500/40',
          shadow: 'shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] light:shadow-[0_8px_24px_rgba(16,185,129,0.10)]',
          hairline: 'from-transparent via-emerald-400/20 light:via-emerald-500/30 to-transparent',
          dot: 'bg-emerald-400',
          accentText: 'text-emerald-400 light:text-emerald-700',
          subCardBg: 'bg-white/[0.04] light:bg-emerald-500/[0.06] border-white/[0.12] light:border-emerald-500/20 shadow-sm',
          title: 'Total Ingresos',
          sign: '+',
          signColor: 'text-emerald-400 light:text-emerald-700',
        };
      case 'expense':
        return {
          border: 'border-rose-500/30 light:border-rose-500/40',
          shadow: 'shadow-[0_8px_32px_0_rgba(239,68,68,0.25)] light:shadow-[0_8px_24px_rgba(239,68,68,0.10)]',
          hairline: 'from-transparent via-rose-400/20 light:via-rose-500/30 to-transparent',
          dot: 'bg-rose-400',
          accentText: 'text-rose-400 light:text-rose-700',
          subCardBg: 'bg-white/[0.04] light:bg-rose-500/[0.06] border-white/[0.12] light:border-rose-500/20 shadow-sm',
          title: 'Total Gastos',
          sign: '-',
          signColor: 'text-rose-400 light:text-rose-700',
        };
      case 'invest':
        return {
          border: 'border-indigo-500/30 light:border-indigo-500/40',
          shadow: 'shadow-[0_8px_32px_0_rgba(99,102,241,0.25)] light:shadow-[0_8px_24px_rgba(99,102,241,0.10)]',
          hairline: 'from-transparent via-indigo-400/20 light:via-indigo-500/30 to-transparent',
          dot: 'bg-indigo-400',
          accentText: 'text-indigo-400 light:text-indigo-700',
          subCardBg: 'bg-white/[0.04] light:bg-indigo-500/[0.06] border-white/[0.12] light:border-indigo-500/20 shadow-sm',
          title: 'Cartera de Inversión',
          sign: '',
          signColor: '',
        };
      default:
        return {
          border: 'border-white/15 light:border-slate-300/80',
          shadow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)]',
          hairline: 'from-transparent via-white/50 light:via-slate-400/30 to-transparent',
          dot: 'bg-emerald-400',
          accentText: 'text-slate-400 light:text-slate-600',
          subCardBg: 'bg-white/[0.04] light:bg-slate-100/90 border-white/[0.12] light:border-slate-200 shadow-sm',
          title: 'Patrimonio Neto Total',
          sign: '',
          signColor: '',
        };
    }
  }, [selectedPillar]);

  // ── Sub-metrics JSX (shared between mobile slide 0 and desktop card) ──
  const SubMetrics = () => (
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* --- 1. DEFAULT (ALL) MODE --- */}
        {selectedPillar === 'all' && (
          <>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Tasa de ahorro</span>
              <span className="mt-0.5 text-sm font-bold text-emerald-400 truncate">
                {formatPercentage(summary.savingsRate, false)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate">Ahorro este mes</span>
            </div>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Rendimiento</span>
              <span className={`mt-0.5 text-xs font-bold truncate ${summary.unrealizedPnL >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
                {summary.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(summary.unrealizedPnL)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                {formatPercentage(summary.unrealizedPnLPercentage)} global
              </span>
            </div>
          </>
        )}
        {/* --- 2. INCOME MODE --- */}
        {selectedPillar === 'income' && (
          <>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Ingresos Recurrentes</span>
              <span className="mt-0.5 text-sm font-bold text-emerald-400 truncate">+{formatCurrency(recurringIncome)}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                {recurringIncomeCount > 0 ? `${recurringIncomeCount} fijos / nómina` : 'Sin cobros fijos'}
              </span>
            </div>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Mayor Ingreso</span>
              <span className="mt-0.5 text-sm font-bold text-white truncate">
                {maxIncomeTx ? `+${formatCurrency(maxIncomeTx.amount)}` : '0,00 €'}
              </span>
              <span className="text-[10px] text-emerald-400/90 truncate mt-0.5">
                {maxIncomeTx ? maxIncomeTx.concept : 'Ninguno'}
              </span>
            </div>
          </>
        )}
        {/* --- 3. EXPENSE MODE --- */}
        {selectedPillar === 'expense' && (
          <>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Gasto Medio Diario</span>
              <span className="mt-0.5 text-sm font-bold text-rose-400 truncate">
                {formatCurrency(dailyAverageExpense)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate">Ritmo este mes</span>
            </div>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Gastos Recurrentes</span>
              <span className="mt-0.5 text-sm font-bold text-white truncate">-{formatCurrency(recurringExpense)}</span>
              <span className="text-[10px] text-rose-400/90 truncate mt-0.5">
                {recurringExpenseCount > 0 ? `${recurringExpenseCount} suscrip. / fijos` : 'Sin cargos fijos'}
              </span>
            </div>
          </>
        )}
        {/* --- 4. INVEST MODE --- */}
        {selectedPillar === 'invest' && (
          <>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">Patrimonio Invertido</span>
              <span className="mt-0.5 text-sm font-bold text-slate-200 truncate">
                {formatCurrency(totalInvestedCost)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 truncate">Coste base total</span>
            </div>
            <div className={`flex flex-col justify-center rounded-2xl ${theme.subCardBg} px-3 py-2 min-w-0`}>
              <span className="text-[11px] font-medium text-slate-400 truncate">P&L No Realizado</span>
              <span className={`mt-0.5 text-sm font-bold truncate ${isInvestProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isInvestProfit ? '+' : ''}{formatCurrency(portfolioPnL)}
              </span>
              <div className={`flex items-center gap-1 text-[10px] font-semibold mt-0.5 ${isInvestProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isInvestProfit ? (
                  <TrendingUp className="h-2.5 w-2.5 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 flex-shrink-0" />
                )}
                <span className="truncate">{formatPercentage(portfolioPnLPercentage)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── Source card content (shared between mobile carousel slide & desktop grid card) ──
  const SourceCardContent = ({ source }: { source: SourceAccount }) => {
    const isInvestAccount = isInvestmentSource(source);
    const balanceInfo = sourceBalancesMap.get(source.id) ?? computeSourceBalance(source, transactions);
    const investSummary = isInvestAccount
      ? computeInvestmentAccountSummary(source, transactions, assets)
      : null;

    const displayBalance = investSummary ? investSummary.totalAccountValue : balanceInfo.netBalance;
    const formattedSourceBalance = formatCurrency(displayBalance);
    const [sourceInt, sourceDec] = formattedSourceBalance.split(',');
    const isPositive = displayBalance >= 0;
    const isBank = source.type === 'bank';

    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <SourceAvatar source={source} size="sm" />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white light:text-slate-900 tracking-tight truncate">
                  {source.name}
                </span>
                <span
                  className={`flex h-1.5 w-1.5 rounded-full ${
                    isInvestAccount ? 'bg-indigo-400' : 'bg-emerald-400'
                  } animate-pulse flex-shrink-0`}
                />
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium truncate">
                {source.institution || (isInvestAccount ? 'Broker & Inversión' : isBank ? 'Cuenta Bancaria' : 'Efectivo')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={showBalance ? 'Ocultar balance' : 'Mostrar balance'}
          >
            {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Big balance number */}
        <div className="my-auto py-2 flex items-baseline gap-1">
          {showBalance ? (
            <>
              <span className="text-4xl font-extrabold tracking-tight text-white light:text-slate-900 drop-shadow-md">
                {sourceInt}
              </span>
              {sourceDec && (
                <span className="text-2xl font-bold text-slate-300 light:text-slate-500">
                  ,{sourceDec}
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-extrabold tracking-widest text-slate-400">•••••••• €</span>
          )}
        </div>

        {/* Bottom sub-metrics */}
        <div className="mt-3 pt-3 border-t border-white/10 light:border-slate-200/80">
          {isInvestAccount && investSummary ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col justify-center rounded-2xl bg-white/[0.04] light:bg-slate-100/90 border border-white/[0.12] light:border-slate-200 shadow-sm px-3 py-2 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 truncate">Invertido</span>
                <span className="mt-0.5 text-sm font-bold text-white light:text-slate-800 truncate">
                  {formatCurrency(investSummary.investedCapital)}
                </span>
                <span className="text-[10px] text-emerald-400 light:text-emerald-600 mt-0.5 truncate">
                  Efectivo: {formatCurrency(investSummary.cashBalance)}
                </span>
              </div>
              <div className="flex flex-col justify-center rounded-2xl bg-white/[0.04] light:bg-slate-100/90 border border-white/[0.12] light:border-slate-200 shadow-sm px-3 py-2 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 truncate">Cuánto está dando</span>
                <span
                  className={`mt-0.5 text-sm font-bold truncate ${
                    investSummary.isProfit
                      ? 'text-emerald-400 light:text-emerald-600'
                      : 'text-rose-400 light:text-rose-600'
                  }`}
                >
                  {investSummary.isProfit ? '+' : ''}
                  {formatCurrency(investSummary.unrealizedPnL)}
                </span>
                <span
                  className={`text-[10px] truncate mt-0.5 font-semibold ${
                    investSummary.isProfit
                      ? 'text-emerald-400 light:text-emerald-600'
                      : 'text-rose-400 light:text-rose-600'
                  }`}
                >
                  {investSummary.isProfit ? '+' : ''}
                  {formatPercentage(investSummary.unrealizedPnLPercentage)} ({investSummary.assetsCount} activos)
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col justify-center rounded-2xl bg-white/[0.04] light:bg-slate-100/90 border border-white/[0.12] light:border-slate-200 shadow-sm px-3 py-2 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 truncate">Movimientos</span>
                <span className="mt-0.5 text-sm font-bold text-white light:text-slate-800 truncate">
                  {balanceInfo.transactionCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {isBank ? 'Transacciones banco' : 'Movimientos en efectivo'}
                </span>
              </div>
              <div className="flex flex-col justify-center rounded-2xl bg-white/[0.04] light:bg-slate-100/90 border border-white/[0.12] light:border-slate-200 shadow-sm px-3 py-2 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 truncate">Balance Inicial</span>
                <span className="mt-0.5 text-sm font-bold text-slate-200 light:text-slate-800 truncate">
                  {formatCurrency(balanceInfo.initialBalance)}
                </span>
                <span className={`text-[10px] truncate mt-0.5 ${isPositive ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'}`}>
                  {balanceInfo.income >= (balanceInfo.expense + balanceInfo.investExpense)
                    ? `+${formatCurrency(balanceInfo.income)} ent.`
                    : `-${formatCurrency(balanceInfo.expense + balanceInfo.investExpense)} sal.`}
                </span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full flex flex-col py-1">

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE / TABLET (<lg): Horizontal swipeable snap carousel
          ══════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex items-stretch overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth w-full py-6 -my-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* SLIDE 0: CONSOLIDATED / PILLAR */}
          <div className="w-full shrink-0 snap-center flex flex-col">
            <div
              className={`relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border ${theme.border} p-5 sm:p-6 ${theme.shadow} transition-all duration-500 h-full flex flex-col justify-between flex-1 min-h-[240px]`}
            >
              <div className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${theme.hairline} transition-all duration-500`} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-indigo-400 flex-shrink-0">
                    {selectedPillar === 'income' && <ArrowUpRight className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                    {selectedPillar === 'expense' && <ArrowDownRight className="h-4 w-4 text-rose-400 flex-shrink-0" />}
                    {selectedPillar === 'invest' && <PieChart className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                    {selectedPillar === 'all' && <Layers className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold truncate ${theme.accentText}`}>{theme.title}</span>
                      <span className={`flex h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse flex-shrink-0`} />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium truncate">Balance Consolidado</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {(selectedPillar === 'all' || selectedPillar === 'invest') && (
                    <button
                      type="button"
                      onClick={() => refreshAllAssetPrices()}
                      disabled={isLiveUpdating}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      title="Actualizar cotizaciones en vivo"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLiveUpdating ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title={showBalance ? 'Ocultar balance' : 'Mostrar balance'}
                  >
                    {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="my-auto py-2 flex items-baseline gap-1">
                {showBalance ? (
                  <>
                    {theme.sign && (
                      <span className={`text-3xl sm:text-4xl font-extrabold mr-0.5 ${theme.signColor}`}>{theme.sign}</span>
                    )}
                    <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">{integerPart}</span>
                    {decimalPart && (
                      <span className="text-2xl font-bold text-slate-300">,{decimalPart}</span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-extrabold tracking-widest text-slate-400">•••••••• €</span>
                )}
              </div>

              <SubMetrics />

              {totalSlides > 1 && (
                <div className="mt-2.5 flex items-center justify-end">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] light:bg-slate-200/80 border border-white/10 light:border-slate-300 backdrop-blur-md">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); scrollToSlide(idx); }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          activeSlide === idx
                            ? 'w-4 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                            : 'w-1.5 h-1.5 bg-white/30 light:bg-slate-400/50 hover:bg-white/50 hover:light:bg-slate-600/70'
                        }`}
                        aria-label={`Ir a ${idx === 0 ? 'Patrimonio Neto Total' : sortedSources[idx - 1]?.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SLIDES 1..N: Individual source accounts */}
          {sortedSources.map((source: SourceAccount) => (
            <div key={source.id} className="w-full shrink-0 snap-center flex flex-col">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-500 h-full flex flex-col justify-between flex-1 min-h-[240px]">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 light:via-white/90 to-transparent" />
                <SourceCardContent source={source} />
                {totalSlides > 1 && (
                  <div className="mt-2.5 flex items-center justify-end">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] light:bg-slate-200/80 border border-white/10 light:border-slate-300 backdrop-blur-md">
                      {Array.from({ length: totalSlides }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); scrollToSlide(idx); }}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            activeSlide === idx
                              ? 'w-4 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                              : 'w-1.5 h-1.5 bg-white/30 light:bg-slate-400/50 hover:bg-white/50 hover:light:bg-slate-600/70'
                          }`}
                          aria-label={`Ir a ${idx === 0 ? 'Patrimonio Neto Total' : sortedSources[idx - 1]?.name}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP (≥lg): Static parallel layout — no swipe, direct click
          ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col gap-4">

        {/* ── 1. Tarjeta de Patrimonio Neto Total / Pilar Activo ── */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border ${theme.border} p-6 ${theme.shadow} transition-all duration-500`}
        >
          <div className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${theme.hairline} transition-all duration-500`} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 flex-shrink-0">
                  {selectedPillar === 'income' && <ArrowUpRight className="h-4.5 w-4.5 text-emerald-400" />}
                  {selectedPillar === 'expense' && <ArrowDownRight className="h-4.5 w-4.5 text-rose-400" />}
                  {selectedPillar === 'invest' && <PieChart className="h-4.5 w-4.5 text-indigo-400" />}
                  {selectedPillar === 'all' && <Layers className="h-4.5 w-4.5 text-indigo-400" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-bold truncate ${theme.accentText}`}>{theme.title}</span>
                    <span className={`flex h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse flex-shrink-0`} />
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    {activeSource ? `Fuente filtrada: ${activeSource.name}` : 'Patrimonio Neto Total (Consolidado)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {(selectedPillar === 'all' || selectedPillar === 'invest') && (
                  <button
                    type="button"
                    onClick={() => refreshAllAssetPrices()}
                    disabled={isLiveUpdating}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Actualizar cotizaciones en vivo"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLiveUpdating ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title={showBalance ? 'Ocultar balance' : 'Mostrar balance'}
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              {showBalance ? (
                <>
                  {theme.sign && (
                    <span className={`text-4xl font-extrabold mr-1 ${theme.signColor}`}>{theme.sign}</span>
                  )}
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">{integerPart}</span>
                  {decimalPart && (
                    <span className="text-3xl font-bold text-slate-300">,{decimalPart}</span>
                  )}
                </>
              ) : (
                <span className="text-4xl font-extrabold tracking-widest text-slate-400">•••••••• €</span>
              )}
            </div>

            <SubMetrics />
          </div>
        </div>

        {/* ── 2. Bandeja de Fuentes existentes en paralelo (grid grid-cols-2 xl:grid-cols-3 gap-4 mt-4) ── */}
        {sortedSources.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fuentes Financieras ({sortedSources.length})
              </span>
              {activeSourceId && (
                <button
                  type="button"
                  onClick={() => setActiveSourceId(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                >
                  Restablecer a Consolidado ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedSources.map((source) => {
                const balanceInfo = sourceBalancesMap.get(source.id) ?? computeSourceBalance(source, transactions);
                const isSelected = activeSourceId === source.id;
                const isBank = source.type === 'bank';

                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setActiveSourceId(isSelected ? null : source.id)}
                    className={`relative p-4 rounded-2xl border text-left backdrop-blur-xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] group ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/40 ring-2 ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : 'bg-white/[0.05] hover:bg-white/[0.09] border-white/10 hover:border-white/25 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <SourceAvatar source={source} size="xs" />
                        <span className="text-xs font-bold text-white tracking-tight truncate">
                          {source.name}
                        </span>
                      </div>
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-white/20'}`} />
                    </div>

                    <div className="mt-2.5">
                      <span className="text-lg font-extrabold text-white tracking-tight block truncate">
                        {showBalance ? formatCurrency(balanceInfo.netBalance) : '•••• €'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium truncate block mt-0.5">
                        {source.institution || (isBank ? 'Cuenta Bancaria' : 'Efectivo')} • {balanceInfo.transactionCount} movs
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
