import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { SourceAccount, Transaction, InvestmentAsset } from '../../types/finance';
import { SourceAvatar } from '../common/SourceAvatar';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import {
  isInvestmentSource,
  computeSourceBalance,
  computeInvestmentAccountSummary,
  type SourceBalanceInfo,
} from '../../utils/finance';

export interface SourceCardContentProps {
  source: SourceAccount;
  sourceBalancesMap: Map<string, SourceBalanceInfo>;
  transactions: Transaction[];
  assets: InvestmentAsset[];
  showBalance: boolean;
  setShowBalance: (val: boolean) => void;
}

export const SourceCardContent: React.FC<SourceCardContentProps> = ({
  source,
  sourceBalancesMap,
  transactions,
  assets,
  showBalance,
  setShowBalance,
}) => {
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

