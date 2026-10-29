import { createPortal } from 'react-dom';
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowDownRight,
  AlertTriangle,
  Calendar,
  Check,
} from 'lucide-react';
import type { InvestmentAsset, SourceAccount } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { GlassSelect } from '../common/GlassSelect';
import type { GlassSelectOption } from '../common/GlassSelect';
import { SourceAvatar } from '../common/SourceAvatar';
import { formatCurrency } from '../../utils/currency';
import { getTodayDateString } from '../../utils/dates';

interface WithdrawInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: InvestmentAsset | null;
}

export const WithdrawInvestmentModal: React.FC<WithdrawInvestmentModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const sources = useFinanceStore((state) => state.sources);
  const activeSourceId = useFinanceStore((state) => state.activeSourceId);
  const withdrawAsset = useFinanceStore((state) => state.withdrawAsset);

  const sortedSources = useMemo(
    () => [...sources].sort((a, b) => a.orderIndex - b.orderIndex),
    [sources]
  );

  const [amountStr, setAmountStr] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(() => getTodayDateString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived asset numbers
  const currentPrice = asset?.currentPrice || asset?.averageBuyPrice || 1;
  const totalShares = asset?.shares || 0;
  const totalMarketValue = Number((totalShares * currentPrice).toFixed(2));

  // Initialize form state when opened
  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setErrorMsg(null);
      setDateStr(getTodayDateString());
      setSelectedSourceId(activeSourceId || sortedSources[0]?.id || '');
    }
  }, [isOpen, activeSourceId, sortedSources]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Source options for GlassSelect
  const sourceOptions: GlassSelectOption<string>[] = useMemo(() => {
    return sortedSources.map((source: SourceAccount) => ({
      value: source.id,
      label: source.name,
      subtitle: source.institution || (source.type === 'bank' ? 'Banco' : 'Efectivo'),
      icon: <SourceAvatar source={source} size="xs" />,
    }));
  }, [sortedSources]);

  if (!isOpen || !asset) return null;

  const numAmount = parseFloat(amountStr.replace(',', '.'));
  const isValidNumber = !isNaN(numAmount) && numAmount > 0;
  const isFullLiquidation = isValidNumber && numAmount >= totalMarketValue - 0.05;
  const sharesToWithdraw = isValidNumber && currentPrice > 0 ? numAmount / currentPrice : 0;
  const remainingShares = Math.max(0, totalShares - sharesToWithdraw);
  const remainingValue = Math.max(0, totalMarketValue - (numAmount || 0));

  const handlePercentageClick = (pct: number) => {
    if (pct === 100) {
      setAmountStr(totalMarketValue.toFixed(2));
    } else {
      const calculated = Number(((totalMarketValue * pct) / 100).toFixed(2));
      setAmountStr(calculated.toString());
    }
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidNumber) {
      setErrorMsg('Introduce un importe válido a retirar.');
      return;
    }

    if (numAmount > totalMarketValue + 0.01) {
      setErrorMsg(
        `No puedes retirar más del valor de mercado disponible (${formatCurrency(totalMarketValue, asset.currency)}).`
      );
      return;
    }

    if (!selectedSourceId) {
      setErrorMsg('Debes seleccionar una cuenta de destino para depositar el dinero retirado.');
      return;
    }

    // Call store action
    withdrawAsset(asset.id, numAmount, selectedSourceId, dateStr);
    onClose();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        {/* Top subtle highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <h3 id="withdraw-modal-title" className="text-base font-bold text-white tracking-tight">
                Retirar Fondos de Inversión
              </h3>
              <p className="text-xs text-slate-400">
                {asset.name} ({asset.identifier})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Position Snapshot Banner */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Valor Total
            </span>
            <span className="text-sm font-extrabold text-white block mt-0.5">
              {formatCurrency(totalMarketValue, asset.currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Participaciones
            </span>
            <span className="text-sm font-bold text-slate-200 block mt-0.5">
              {totalShares.toLocaleString('es-ES', { maximumFractionDigits: 4 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Cotización
            </span>
            <span className="text-sm font-bold text-indigo-300 block mt-0.5">
              {formatCurrency(currentPrice, asset.currency)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Importe a Retirar (€)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full rounded-2xl bg-white/[0.08] border border-white/15 px-4 py-3 text-2xl font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                EUR (€)
              </span>
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[25, 50, 75].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePercentageClick(100)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                100% (Liquidación total)
              </button>
            </div>
          </div>

          {/* Breakdown Preview */}
          {isValidNumber && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Títulos a liquidar:</span>
                <strong className="font-bold">
                  {sharesToWithdraw.toLocaleString('es-ES', { maximumFractionDigits: 6 })} uds
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Posición restante en cartera:</span>
                <strong className="font-bold">
                  {isFullLiquidation
                    ? 'Se cerrará la posición por completo'
                    : `${remainingShares.toLocaleString('es-ES', { maximumFractionDigits: 4 })} uds (${formatCurrency(remainingValue, asset.currency)})`}
                </strong>
              </div>
            </div>
          )}

          {/* Destination Source Account */}
          <div>
            <GlassSelect
              label="Cuenta de Destino (donde se ingresa el dinero)"
              value={selectedSourceId}
              onChange={(val) => {
                setSelectedSourceId(val);
                setErrorMsg(null);
              }}
              options={sourceOptions}
              placeholder="Selecciona la cuenta destino..."
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Se creará un ingreso automáticamente en la cuenta seleccionada.
            </p>
          </div>

          {/* Date Selector */}
          <div>
            <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-indigo-400" />
              Fecha de la Operación
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Retirada</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
