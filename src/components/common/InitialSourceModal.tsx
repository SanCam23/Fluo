import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { SourceType } from '../../types/finance';

const COMMON_BANKS = [
  'BBVA',
  'Santander',
  'CaixaBank',
  'Revolut',
  'ING',
  'Sabadell',
  'N26',
  'Openbank',
  'Bankinter',
];

interface InitialSourceModalProps {
  isOpen: boolean;
}

export const InitialSourceModal: React.FC<InitialSourceModalProps> = ({ isOpen }) => {
  const addSource = useFinanceStore((state) => state.addSource);

  const [name, setName] = useState('Cuenta Principal');
  const [type, setType] = useState<SourceType>('bank');
  const [institution, setInstitution] = useState('BBVA');
  const [initialBalance, setInitialBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica un nombre para la cuenta o billetera.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parsedBalance = parseFloat(initialBalance.replace(',', '.'));
    const balanceNum = isNaN(parsedBalance) ? 0 : parsedBalance;

    try {
      addSource({
        name: name.trim(),
        type,
        institution: type === 'cash' ? 'Efectivo' : institution.trim() || undefined,
        initialBalance: balanceNum,
        orderIndex: 0,
        color: type === 'cash' ? '#10b981' : '#6366f1',
      });
    } catch (err: any) {
      setError(err?.message || 'Error al crear la fuente inicial.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col gap-3.5 sm:gap-4 text-white my-auto">
        {/* Specular Top Reflection */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-emerald-500/20 border border-white/20 shadow-inner">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Configura tu Primera Fuente
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 max-w-xs leading-relaxed">
            Para organizar tus finanzas y balances, añade tu origen de dinero principal (un banco o tu efectivo diario).
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-3.5">
          {/* Source Type Selector (Bank vs Cash) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('bank');
                if (institution === 'Efectivo') setInstitution('BBVA');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                type === 'bank'
                  ? 'bg-indigo-500/20 border-indigo-400/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Landmark className={`h-4 w-4 ${type === 'bank' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Cuenta Bancaria</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('cash');
                setName('Billetera Efectivo');
                setInstitution('Efectivo');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                type === 'cash'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Wallet className={`h-4 w-4 ${type === 'cash' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Efectivo Físico</span>
            </button>
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Nombre de la Fuente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Nómina Principal, Ahorros, Billetera..."
              className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-400/70 focus:bg-white/[0.1] focus:outline-none transition-all"
              required
            />
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {(type === 'bank'
                ? ['Cuenta Nómina', 'Ahorros', 'Compartida']
                : ['Billetera', 'Caja Fuerte', 'Bolsillo']
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Institution (Bank Entity) */}
          {type === 'bank' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Entidad o Banco
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ej. BBVA, Santander, Revolut, CaixaBank..."
                className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-400/70 focus:bg-white/[0.1] focus:outline-none transition-all"
              />
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                {COMMON_BANKS.slice(0, 5).map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setInstitution(bank)}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                      institution === bank
                        ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300'
                        : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial Balance */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Balance Inicial (€)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl bg-white/[0.06] border border-white/15 pl-3 pr-7 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-400/70 focus:bg-white/[0.1] focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                €
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Saldo con el que comienzas en esta cuenta (opcional, por defecto 0 €).
            </span>
          </div>

          {/* Trust / Security notice */}
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 p-2 text-[10px] sm:text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span>Tus fuentes se cifran con RLS en Supabase y son privadas a tu cuenta.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-[0_4px_25px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Continuar a mi Balance</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
