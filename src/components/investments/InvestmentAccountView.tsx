import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Coins,
  Calendar,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { SourceAccount, Transaction, SourceAssetHolding } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { computeInvestmentAccountSummary } from '../../utils/finance';
import { SourceAvatar } from '../common/SourceAvatar';
import { SwipeableTransactionItem } from '../home/SwipeableTransactionItem';

interface InvestmentAccountViewProps {
  source: SourceAccount;
  onOpenAddModal: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const InvestmentAccountView: React.FC<InvestmentAccountViewProps> = ({
  source,
  onOpenAddModal,
  onEditTransaction,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'holdings' | 'activity'>('holdings');
  const [expandedHoldingKeys, setExpandedHoldingKeys] = useState<Set<string>>(new Set());

  const transactions = useFinanceStore((state) => state.transactions);
  const assets = useFinanceStore((state) => state.assets);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const getCategoryById = useFinanceStore((state) => state.getCategoryById);
  const getBrandById = useFinanceStore((state) => state.getBrandById);


  // Compute live metrics specifically for this investment/broker account
  const summary = useMemo(
    () => computeInvestmentAccountSummary(source, transactions, assets),
    [source, transactions, assets]
  );

  const toggleExpand = (identifier: string) => {
    setExpandedHoldingKeys((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  };

  // Total allocation percentage (Cash vs Portfolio)
  const totalVal = Math.max(0.01, summary.totalAccountValue);
  const cashPct = Math.max(0, Math.min(100, (Math.max(0, summary.cashBalance) / totalVal) * 100));
  const investPct = Math.max(0, Math.min(100, (summary.portfolioMarketValue / totalVal) * 100));

  // Transactions belonging to this source (sorted newest first)
  const sourceTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.sourceId === source.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, source.id]);

  return (
    <div className="flex flex-col gap-5 w-full animate-fadeIn">
      {/* ══════════════════════════════════════════════════════════════════
          1. HEADER CARD: RESUMEN FINANCIERO Y LIQUIDEZ DEL BROKER
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-indigo-500/20 light:border-slate-200 p-5 sm:p-6 shadow-[0_16px_40px_-12px_rgba(99,102,241,0.2)] transition-all">
        {/* Specular hairline */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 light:border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <SourceAvatar source={source} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900 truncate">
                  {source.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Broker & Inversión
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-500 truncate">
                {source.institution || 'Cuenta de inversión y custodia de valores'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Operar</span>
            </button>
          </div>
        </div>

        {/* Main Capital Breakdown Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-4">
          {/* 1. Valor Total */}
          <div className="flex flex-col justify-center p-3 rounded-2xl bg-white/[0.04] light:bg-slate-100/80 border border-white/10 light:border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 light:text-slate-600">Patrimonio en Cuenta</span>
            <span className="text-lg sm:text-xl font-extrabold text-white light:text-slate-900 mt-0.5 tracking-tight truncate">
              {formatCurrency(summary.totalAccountValue)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Efectivo + Cartera</span>
          </div>

          {/* 2. Capital Invertido */}
          <div className="flex flex-col justify-center p-3 rounded-2xl bg-white/[0.04] light:bg-slate-100/80 border border-white/10 light:border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 light:text-slate-600">Capital Invertido</span>
            <span className="text-lg sm:text-xl font-bold text-slate-200 light:text-slate-800 mt-0.5 tracking-tight truncate">
              {formatCurrency(summary.investedCapital)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Coste total de compra</span>
          </div>

          {/* 3. Cuánto está dando (Rendimiento / P&L) */}
          <div className="flex flex-col justify-center p-3 rounded-2xl bg-white/[0.04] light:bg-slate-100/80 border border-white/10 light:border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 light:text-slate-600">Cuánto está dando</span>
            <div className="flex items-baseline gap-1 mt-0.5 truncate">
              <span
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  summary.isProfit
                    ? 'text-emerald-400 light:text-emerald-600'
                    : 'text-rose-400 light:text-rose-600'
                }`}
              >
                {summary.isProfit ? '+' : ''}
                {formatCurrency(summary.unrealizedPnL)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {summary.isProfit ? (
                <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-400 shrink-0" />
              )}
              <span
                className={`text-[10px] font-bold ${
                  summary.isProfit
                    ? 'text-emerald-400 light:text-emerald-600'
                    : 'text-rose-400 light:text-rose-600'
                }`}
              >
                {summary.isProfit ? '+' : ''}
                {formatPercentage(summary.unrealizedPnLPercentage)}
              </span>
            </div>
          </div>

          {/* 4. Efectivo / Liquidez Disponible */}
          <div className="flex flex-col justify-center p-3 rounded-2xl bg-white/[0.04] light:bg-slate-100/80 border border-white/10 light:border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 light:text-slate-600">Efectivo Disponible</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 light:text-emerald-600 mt-0.5 tracking-tight truncate">
              {formatCurrency(summary.cashBalance)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Liquidez sin invertir</span>
          </div>
        </div>

        {/* Visual Allocation Bar (Cash vs Holdings) */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Invertido: {investPct.toFixed(1)}% ({formatCurrency(summary.portfolioMarketValue)})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Efectivo: {cashPct.toFixed(1)}% ({formatCurrency(summary.cashBalance)})</span>
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${investPct}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              title={`Invertido: ${investPct.toFixed(1)}%`}
            />
            <div
              style={{ width: `${cashPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
              title={`Efectivo: ${cashPct.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. NAVEGACIÓN POR SUBPESTAÑAS (INVERSIONES VS MOVIMIENTOS)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.06] light:bg-slate-200/80 border border-white/10 light:border-slate-300 w-full sm:w-auto overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('holdings')}
          className={`flex-1 sm:flex-initial min-w-max flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'holdings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Inversiones ({summary.assetsCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('activity')}
          className={`flex-1 sm:flex-initial min-w-max flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white light:text-slate-600'
          }`}
        >
          Movimientos ({sourceTransactions.length})
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. CONTENIDO: PESTAÑA A - POSICIONES EN CARTERA
          ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'holdings' && (
        <div className="flex flex-col gap-3">
          {summary.holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-3">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Sin posiciones activas</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Esta cuenta broker no tiene inversiones asociadas todavía. Puedes registrar una compra de activo con cargo a este broker o realizar un traspaso.
              </p>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir Primera Inversión</span>
              </button>
            </div>
          ) : (
            summary.holdings.map((holding: SourceAssetHolding) => {
              const { asset, shares, averageBuyPrice, investedCost, currentValue, pnl, pnlPercentage, isProfit, contributions } = holding;
              const isExpanded = expandedHoldingKeys.has(asset.identifier || asset.name);

              return (
                <div
                  key={asset.id}
                  className="group relative rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg overflow-hidden"
                >
                  {/* Specular Edge */}
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />

                  {/* Main Holding Card Summary */}
                  <div
                    onClick={() => toggleExpand(asset.identifier || asset.name)}
                    className="p-4 sm:p-5 flex flex-col gap-3 cursor-pointer select-none"
                  >
                    {/* Top row: Name & Market value */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white light:text-slate-900 tracking-tight truncate">
                            {asset.name}
                          </h4>
                          {asset.identifier && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 light:bg-slate-200 text-slate-300 light:text-slate-700 text-[10px] font-mono font-semibold">
                              {asset.identifier}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium uppercase">
                            {asset.assetType}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>
                            {shares.toLocaleString('es-ES', { maximumFractionDigits: 6 })} títulos
                          </span>
                          <span>•</span>
                          <span>PMC: {formatCurrency(averageBuyPrice, asset.currency)}</span>
                          <span>•</span>
                          <span>Cotiz: {formatCurrency(asset.currentPrice, asset.currency)}</span>
                        </div>
                      </div>

                      {/* Market Value and Yield */}
                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-extrabold text-white light:text-slate-900 block tracking-tight">
                          {formatCurrency(currentValue, asset.currency)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 border flex-wrap justify-end ${
                            isProfit
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isProfit ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
                          <span className="whitespace-nowrap">
                            {isProfit ? '+' : ''}{formatCurrency(pnl, asset.currency)}
                          </span>
                          <span className="text-[10px] font-medium whitespace-nowrap">
                            ({formatPercentage(pnlPercentage)})
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Invested cost and expand chevron */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] text-slate-400">
                      <span>
                        Invertido en este broker:{' '}
                        <strong className="text-slate-200 font-semibold">
                          {formatCurrency(investedCost, asset.currency)}
                        </strong>
                      </span>

                      <div className="flex items-center gap-1 text-indigo-300 text-[11px] font-semibold group-hover:text-indigo-200">
                        <span>
                          {contributions.length}{' '}
                          {contributions.length === 1 ? 'aportación' : 'aportaciones'}
                        </span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible individual contribution entries */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/10 bg-black/20 flex flex-col gap-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1 py-1">
                        <span>Aportaciones a este índice desde {source.name}</span>
                        <span className="text-[10px] text-slate-500">Pulsa para editar</span>
                      </div>

                      {contributions.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center rounded-xl bg-white/[0.02]">
                          Posición asignada directamente a la entidad sin desglose de transacciones previas.
                        </div>
                      ) : (
                        contributions.map((tx: Transaction) => {
                          const isWithdrawal = tx.pillar === 'income';

                          return (
                            <div
                              key={tx.id}
                              onClick={() => onEditTransaction?.(tx)}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
                              title="Editar esta aportación"
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
                                    {tx.shares && (
                                      <span>
                                        • {tx.shares.toLocaleString('es-ES', { maximumFractionDigits: 6 })} uds
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
                                  {isWithdrawal ? '+' : '-'}
                                  {formatCurrency(tx.amount)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          4. CONTENIDO: PESTAÑA B - MOVIMIENTOS Y TRASPASOS (ACTIVITY)
          ══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'activity' && (
        <div className="flex flex-col gap-2">
          {sourceTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-2">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-400">No hay movimientos registrados en {source.name}.</p>
            </div>
          ) : (
            sourceTransactions.map((tx) => (
              <SwipeableTransactionItem
                key={tx.id}
                tx={tx}
                category={getCategoryById(tx.categoryId)}
                brand={tx.brandId ? getBrandById(tx.brandId) : undefined}
                onDelete={(id) => deleteTransaction(id)}
                onEdit={(t) => onEditTransaction?.(t)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
