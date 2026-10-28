import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  AlertTriangle,
  Check,
  Building2,
} from 'lucide-react';
import type { InvestmentAsset } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/currency';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: InvestmentAsset | null;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const updateAsset = useFinanceStore((state) => state.updateAsset);

  const [name, setName] = useState('');
  const [sharesStr, setSharesStr] = useState('');
  const [buyPriceStr, setBuyPriceStr] = useState('');
  const [platform, setPlatform] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && asset) {
      setName(asset.name || '');
      setSharesStr(asset.shares.toString());
      setBuyPriceStr(asset.averageBuyPrice.toString());
      setPlatform(asset.platform || '');
      setErrorMsg(null);
    }
  }, [isOpen, asset]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('El nombre del activo es obligatorio.');
      return;
    }

    const numShares = parseFloat(sharesStr.replace(',', '.'));
    if (isNaN(numShares) || numShares <= 0) {
      setErrorMsg('La cantidad de participaciones debe ser un número positivo.');
      return;
    }

    const numBuyPrice = parseFloat(buyPriceStr.replace(',', '.'));
    if (isNaN(numBuyPrice) || numBuyPrice < 0) {
      setErrorMsg('El precio medio de compra debe ser un número positivo o cero.');
      return;
    }

    updateAsset(asset.id, {
      name: cleanName,
      shares: numShares,
      averageBuyPrice: numBuyPrice,
      platform: platform.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-asset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        {/* Top subtle highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-md">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 id="edit-asset-modal-title" className="text-base font-bold text-white tracking-tight">
                Editar Posición
              </h3>
              <p className="text-xs text-slate-400">
                {asset.identifier} {asset.isin ? `• ISIN: ${asset.isin}` : ''}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Asset Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nombre de la Inversión o Índice
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full rounded-xl bg-white/[0.08] border border-white/15 px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Shares & Purchase Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Participaciones
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={sharesStr}
                onChange={(e) => {
                  setSharesStr(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full rounded-xl bg-white/[0.08] border border-white/15 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Precio Medio ({asset.currency})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={buyPriceStr}
                onChange={(e) => {
                  setBuyPriceStr(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full rounded-xl bg-white/[0.08] border border-white/15 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Platform / Broker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Broker / Entidad Custodia
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. MyInvestor, Degiro, Trade Republic..."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl bg-white/[0.08] border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Current Market Price (Read only info) */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Cotización actual en mercado:</span>
            <strong className="text-white font-bold">
              {formatCurrency(asset.currentPrice, asset.currency)}
            </strong>
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
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
