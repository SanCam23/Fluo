import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { PillarType } from '../../types/finance';

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const categories = useFinanceStore((state) => state.categories);
  const brands = useFinanceStore((state) => state.brands);
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const [pillar, setPillar] = useState<PillarType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter categories matching the selected pillar
  const availableCategories = categories.filter((c) => c.pillar === pillar);
  const selectedCatId = categoryId || (availableCategories[0]?.id ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!concept.trim()) return;

    addTransaction({
      amount: numAmount,
      pillar,
      categoryId: selectedCatId,
      brandId: brandId || undefined,
      concept: concept.trim(),
      date: new Date().toISOString(),
      isRecurring,
    });

    // Reset & Close
    setAmount('');
    setConcept('');
    setBrandId('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-all duration-300">
      <div
        className="w-full max-w-md bg-[#0F1626]/95 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Nuevo Movimiento</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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

          {/* Brand Selector */}
          <div>
            <label className="text-xs font-medium text-slate-400">Marca Comercial (Opcional)</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#131B2E] border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="">Sin marca específica</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-0"
            />
            <span className="text-xs text-slate-300">Marcar como gasto o ingreso recurrente</span>
          </label>

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
