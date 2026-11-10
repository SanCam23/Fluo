import React from 'react';
import { ArrowLeftRight, ArrowRight, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import type { SourceAccount } from '../../../types/finance';
import type { GlassSelectOption } from '../../common/GlassSelect';
import { SourceAvatar } from '../../common/SourceAvatar';
import { formatCurrency } from '../../../utils/currency';

export interface TransferFlowCardProps {
  sortedSources: SourceAccount[];
  selectedSourceId: string;
  destinationSourceId: string;
  activeTransferPicker: 'origin' | 'destination' | null;
  setActiveTransferPicker: (picker: 'origin' | 'destination' | null) => void;
  onSelectOrigin: (id: string) => void;
  onSelectDestination: (id: string) => void;
  onSwap: () => void;
  amount: string;
  originSource?: SourceAccount;
  destSource?: SourceAccount;
  sourceOptions: GlassSelectOption<string>[];
  destinationOptions: GlassSelectOption<string>[];
  transferCardRef?: React.RefObject<HTMLDivElement | null>;
}

export const TransferFlowCard: React.FC<TransferFlowCardProps> = ({
  sortedSources,
  selectedSourceId,
  destinationSourceId,
  activeTransferPicker,
  setActiveTransferPicker,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  amount,
  originSource,
  destSource,
  sourceOptions,
  destinationOptions,
  transferCardRef,
}) => {
  const parsedAmount = parseFloat(amount);

  return (
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
        {parsedAmount > 0 && (
          <span className="text-xs font-bold text-indigo-300 light:text-indigo-700 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
            {formatCurrency(parsedAmount)}
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
              {originSource?.institution ||
                (originSource?.type === 'bank' ? 'Cuenta bancaria' : 'Billetera efectivo')}
            </span>
          </div>
        </button>

        {/* Swap Button in Center */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1">
          <button
            type="button"
            title="Intercambiar cuentas (Origen <-> Destino)"
            onClick={onSwap}
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
              {destSource?.institution ||
                (destSource?.type === 'bank' ? 'Cuenta bancaria' : 'Billetera efectivo')}
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
                      onSelectOrigin(opt.value);
                    } else {
                      onSelectDestination(opt.value);
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
            Puedes añadir una cuenta bancaria o tu billetera de efectivo desde tu{' '}
            <strong>Perfil &gt; Mis Fuentes</strong>.
          </span>
        </div>
      )}
    </div>
  );
};

