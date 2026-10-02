import React, { useState, useEffect } from 'react';
import { X, FastForward, Play, RotateCcw, Clock, Calendar, AlertCircle, CheckCircle2, Repeat } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatCurrency } from '../../utils/currency';

interface TimeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeSimulatorModal: React.FC<TimeSimulatorModalProps> = ({ isOpen, onClose }) => {
  const simulatedTimeOffsetDays = useFinanceStore((state) => state.simulatedTimeOffsetDays);
  const simulateTimeAdvance = useFinanceStore((state) => state.simulateTimeAdvance);
  const triggerRecurrencesCheck = useFinanceStore((state) => state.triggerRecurrencesCheck);
  const resetSimulatedTime = useFinanceStore((state) => state.resetSimulatedTime);
  const recurrences = useFinanceStore((state) => state.recurrences);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

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

  if (!isOpen) return null;

  const realNow = new Date();
  const simulatedNow = new Date(Date.now() + simulatedTimeOffsetDays * 86400000);

  const handleAdvance = (days: number, label: string) => {
    const result = simulateTimeAdvance(days);
    if (result.generatedCount > 0) {
      setNotification({
        message: `¡Avanzaste ${label}! Se generaron ${result.generatedCount} transacción(es) recurrente(s) automáticamente. Fecha actual: ${result.simulatedDate}.`,
        type: 'success',
      });
    } else {
      setNotification({
        message: `Avanzaste ${label}. No había movimientos programados pendientes. Fecha simulada: ${result.simulatedDate}.`,
        type: 'info',
      });
    }
  };

  const handleRunCheckNow = () => {
    const count = triggerRecurrencesCheck();
    if (count > 0) {
      setNotification({
        message: `Comprobación ejecutada: Se generaron ${count} transacción(es) recurrente(s).`,
        type: 'success',
      });
    } else {
      setNotification({
        message: 'Comprobación ejecutada: Todas las reglas recurrentes están al día.',
        type: 'info',
      });
    }
  };

  const handleReset = () => {
    resetSimulatedTime();
    setNotification({
      message: 'Simulador reiniciado. Has vuelto a la fecha real del sistema.',
      type: 'info',
    });
  };

  const activeRecurrences = recurrences.filter((r) => r.isActive);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md lg:backdrop-blur-3xl transition-all duration-300 gpu-layer transform-gpu"
    >
      <div
        className="w-full max-w-lg bg-[#0E1526]/95 lg:bg-slate-950/85 border border-white/20 lg:border-white/15 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-2xl lg:backdrop-blur-3xl relative overflow-hidden flex flex-col max-h-[90vh] gpu-layer transform-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <FastForward className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Simulador de Tiempo & Recurrencias
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  Debug Tool
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Acelera el tiempo en cliente para validar cobros e ingresos automáticos
              </p>
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 py-4 flex flex-col gap-4">
          {/* Notification feedback */}
          {notification && (
            <div
              className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs transition-all animate-fadeIn ${
                notification.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Current State Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Real Date */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-medium">
                <Clock className="h-3.5 w-3.5" /> Fecha Real
              </span>
              <p className="text-sm font-bold text-slate-200">
                {realNow.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Simulated Date */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                simulatedTimeOffsetDays > 0
                  ? 'bg-indigo-500/15 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <span className="text-[11px] text-indigo-300 flex items-center gap-1 mb-1 font-semibold">
                <Calendar className="h-3.5 w-3.5" /> Fecha Simulada
                {simulatedTimeOffsetDays > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200">
                    +{simulatedTimeOffsetDays}d
                  </span>
                )}
              </span>
              <p className="text-sm font-bold text-white">
                {simulatedNow.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Time Jump Actions */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Acciones de Salto Temporal
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAdvance(7, '1 semana')}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <FastForward className="h-3.5 w-3.5 text-indigo-400" />
                Avanzar 1 semana
              </button>

              <button
                type="button"
                onClick={() => handleAdvance(30, '1 mes')}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <FastForward className="h-3.5 w-3.5 text-indigo-400" />
                Avanzar 1 mes
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={handleRunCheckNow}
                className="py-2.5 px-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 text-indigo-400" />
                Ejecutar comprobación ahora
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={simulatedTimeOffsetDays === 0}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  simulatedTimeOffsetDays > 0
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 cursor-pointer active:scale-[0.98]'
                    : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer tiempo
              </button>
            </div>
          </div>

          {/* Active Recurrences Monitoring */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-indigo-400" />
                Reglas Recurrentes Activas ({activeRecurrences.length})
              </span>
            </div>

            {activeRecurrences.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-xs text-slate-400">
                No hay reglas recurrentes activas configuradas.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {activeRecurrences.map((rule) => {
                  const nextDueFormatted = new Date(rule.nextDueDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={rule.id}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{rule.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {rule.frequency === 'weekly'
                            ? 'Semanal'
                            : rule.frequency === 'biweekly'
                            ? 'Quincenal'
                            : rule.frequency === 'monthly'
                            ? `Mensual (día ${rule.dayOfMonth ?? 1})`
                            : 'Anual'}
                          {' • '}Próximo: <span className="text-indigo-300 font-medium">{nextDueFormatted}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold ${
                            rule.pillar === 'income'
                              ? 'text-emerald-400'
                              : rule.pillar === 'expense'
                              ? 'text-rose-400'
                              : 'text-indigo-400'
                          }`}
                        >
                          {rule.pillar === 'income' ? '+' : '-'}
                          {formatCurrency(rule.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
