import React from 'react';
import { Repeat, Clock, Info } from 'lucide-react';
import type { PillarType, RecurrenceFrequency } from '../../../types/finance';

export interface RecurrenceSectionProps {
  pillar: PillarType;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  frequency: RecurrenceFrequency;
  setFrequency: (frequency: RecurrenceFrequency) => void;
  dayOfWeek: number;
  setDayOfWeek: (day: number) => void;
  dayOfMonth: number;
  setDayOfMonth: (day: number) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  autoCharge: boolean;
  setAutoCharge: (auto: boolean) => void;
}

export const RecurrenceSection: React.FC<RecurrenceSectionProps> = ({
  pillar,
  isRecurring,
  setIsRecurring,
  frequency,
  setFrequency,
  dayOfWeek,
  setDayOfWeek,
  dayOfMonth,
  setDayOfMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  autoCharge,
  setAutoCharge,
}) => {
  return (
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
  );
};

