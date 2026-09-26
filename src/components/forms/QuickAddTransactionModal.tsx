import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Check, Repeat, Info, Clock } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType, RecurrenceFrequency } from '../../types/finance';
import { BrandPicker } from './BrandPicker';
import { calculateFirstNextDueDate } from '../../services/recurringEngine';

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const addRecurrence = useFinanceStore((state) => state.addRecurrence);
  const getBrandById = useFinanceStore((state) => state.getBrandById);

  const [pillar, setPillar] = useState<PillarType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  // Recurrence granular configuration
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Lunes, ..., 7 = Domingo
  const [dayOfMonth, setDayOfMonth] = useState<number>(() => new Date().getDate());
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [autoCharge, setAutoCharge] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filter categories matching the selected pillar
  const availableCategories = categories.filter((c) => c.pillar === pillar);
  const selectedCatId = categoryId || (availableCategories[0]?.id ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!concept.trim()) return;

    const txDate = startDate ? new Date(`${startDate}T12:00:00.000Z`).toISOString() : new Date().toISOString();

    // 1. Register immediate initial transaction
    addTransaction({
      amount: numAmount,
      pillar,
      categoryId: selectedCatId,
      brandId: brandId || undefined,
      concept: concept.trim(),
      date: txDate,
      isRecurring,
    });

    // 2. If recurring is configured, register rule in the recurrence engine
    if (isRecurring) {
      const nextDue = calculateFirstNextDueDate(
        new Date(txDate),
        {
          frequency,
          dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
          startDate: txDate,
        }
      );

      addRecurrence({
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

    // Reset & Close
    setAmount('');
    setConcept('');
    setBrandId('');
    setIsRecurring(false);
    setEndDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-all duration-300">
      <div
        className="w-full max-w-md max-h-[92vh] flex flex-col bg-[#0F1626]/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <h3 className="text-base font-bold text-white">Nuevo Movimiento</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Pillar Selector (Ingreso / Gasto / Inversión) */}
          <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
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

          {/* Amount Input */}
          <div>
            <label className="text-xs font-medium text-slate-400">Importe (€)</label>
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

          {/* Category Selector */}
          <div>
            <label className="text-xs font-medium text-slate-400">Categoría</label>
            <select
              value={selectedCatId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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

          {/* Recurrence Toggle & Configuration Card */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-3.5 transition-all">
            {/* Header / Switch */}
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
                    Hacer recurrente
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Automatiza este {pillar === 'income' ? 'ingreso' : pillar === 'expense' ? 'gasto' : 'movimiento'}
                  </span>
                </div>
              </div>

              {/* iOS Liquid Glass Switch */}
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

            {/* Granular Recurrence Settings (Smoothly revealed when active) */}
            {isRecurring && (
              <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-3 animate-fadeIn">
                {/* Frequency Segmented Control */}
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

                {/* Day of Week Selector (If weekly) */}
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

                {/* Day of Month Selector (If monthly) */}
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

                    {/* Short months notice */}
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

                {/* Date range (Start Date & Optional End Date) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Fecha de inicio
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl bg-[#131B2E] border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Fecha fin (opcional)
                    </label>
                    <div className="relative">
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
                </div>

                {/* Auto-charge / Notification toggle */}
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
            className="mt-2 w-full py-3.5 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 hover:brightness-110 active:scale-[0.98] font-bold text-white text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            Guardar Movimiento
          </button>
        </form>
      </div>
    </div>
  );
};
