import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Landmark,
  Wallet,
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import type { SourceAccount, SourceType } from '../../types/finance';
import { computeSourceBalance } from '../../utils/finance';
import { formatCurrency } from '../../utils/currency';
import { SourceAvatar } from '../common/SourceAvatar';

const COMMON_BANKS = [
  'BBVA',
  'Santander',
  'CaixaBank',
  'Revolut',
  'ING',
  'Sabadell',
  'N26',
  'Openbank',
];

export const SourceAccountManager: React.FC = () => {
  const sources = useFinanceStore((state) => state.sources);
  const transactions = useFinanceStore((state) => state.transactions);
  const addSource = useFinanceStore((state) => state.addSource);
  const updateSource = useFinanceStore((state) => state.updateSource);
  const deleteSource = useFinanceStore((state) => state.deleteSource);
  const reorderSources = useFinanceStore((state) => state.reorderSources);

  const sortedSources = [...sources].sort((a, b) => a.orderIndex - b.orderIndex);

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceAccount | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<SourceType>('bank');
  const [formInstitution, setFormInstitution] = useState('');
  const [formInitialBalance, setFormInitialBalance] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion confirmation state
  const [deletingSource, setDeletingSource] = useState<SourceAccount | null>(null);

  // Open modal for Adding new source
  const handleOpenAdd = () => {
    setEditingSource(null);
    setFormName('');
    setFormType('bank');
    setFormInstitution('BBVA');
    setFormInitialBalance('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing existing source
  const handleOpenEdit = (source: SourceAccount) => {
    setEditingSource(source);
    setFormName(source.name);
    setFormType(source.type);
    setFormInstitution(source.institution || (source.type === 'bank' ? 'Banco' : 'Efectivo'));
    setFormInitialBalance(source.initialBalance !== undefined ? source.initialBalance.toString() : '0');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Save (Add or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('El nombre de la fuente es obligatorio.');
      return;
    }

    const parsedBalance = parseFloat(formInitialBalance.replace(',', '.'));
    const initialBalanceNum = isNaN(parsedBalance) ? 0 : parsedBalance;

    if (editingSource) {
      updateSource(editingSource.id, {
        name: formName.trim(),
        type: formType,
        institution: formType === 'cash' ? 'Efectivo' : formInstitution.trim() || undefined,
        initialBalance: initialBalanceNum,
        color: formType === 'cash' ? '#10b981' : '#6366f1',
      });
    } else {
      addSource({
        name: formName.trim(),
        type: formType,
        institution: formType === 'cash' ? 'Efectivo' : formInstitution.trim() || undefined,
        initialBalance: initialBalanceNum,
        orderIndex: sortedSources.length,
        color: formType === 'cash' ? '#10b981' : '#6366f1',
      });
    }

    setIsModalOpen(false);
    setEditingSource(null);
  };

  // Reorder up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...sortedSources];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    reorderSources(newItems.map((s) => s.id));
  };

  // Reorder down
  const handleMoveDown = (index: number) => {
    if (index >= sortedSources.length - 1) return;
    const newItems = [...sortedSources];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    reorderSources(newItems.map((s) => s.id));
  };

  // Delete source action
  const handleConfirmDelete = () => {
    if (!deletingSource) return;
    deleteSource(deletingSource.id);
    setDeletingSource(null);
  };

  return (
    <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Landmark className="h-3.5 w-3.5 text-indigo-400" />
          <span>Mis Fuentes</span>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Añadir Fuente</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Gestiona los orígenes de tu dinero. El orden aquí definido determina el carrusel de balance y los selectores.
      </p>

      {/* Sources List */}
      <div className="flex flex-col gap-2 mt-1">
        {sortedSources.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-2xl">
            No tienes fuentes configuradas. Añade tu primera cuenta.
          </div>
        ) : (
          sortedSources.map((source, index) => {
            const balanceInfo = computeSourceBalance(source, transactions);

            return (
              <div
                key={source.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.06] light:bg-white/90 hover:bg-white/[0.1] light:hover:bg-white border border-white/12 light:border-slate-200 shadow-sm transition-all group"
              >
                {/* Left: Reorder priority buttons (High visibility Liquid Glass capsules) */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`p-1.5 rounded-lg border transition-all ${
                      index === 0
                        ? 'opacity-20 cursor-not-allowed border-transparent text-slate-600 light:text-slate-400'
                        : 'bg-white/[0.08] light:bg-slate-100 hover:bg-white/[0.18] light:hover:bg-slate-200 border-white/15 light:border-slate-300 text-slate-200 light:text-slate-700 hover:text-white light:hover:text-indigo-600 shadow-sm cursor-pointer active:scale-90'
                    }`}
                    title="Mover arriba en prioridad"
                    aria-label={`Mover ${source.name} arriba`}
                  >
                    <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sortedSources.length - 1}
                    className={`p-1.5 rounded-lg border transition-all ${
                      index === sortedSources.length - 1
                        ? 'opacity-20 cursor-not-allowed border-transparent text-slate-600 light:text-slate-400'
                        : 'bg-white/[0.08] light:bg-slate-100 hover:bg-white/[0.18] light:hover:bg-slate-200 border-white/15 light:border-slate-300 text-slate-200 light:text-slate-700 hover:text-white light:hover:text-indigo-600 shadow-sm cursor-pointer active:scale-90'
                    }`}
                    title="Mover abajo en prioridad"
                    aria-label={`Mover ${source.name} abajo`}
                  >
                    <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Middle: Icon & Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <SourceAvatar source={source} size="sm" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white light:text-slate-900 truncate">
                      {source.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 light:text-slate-500 mt-0.5 truncate">
                      <span className="truncate">Saldo: <strong className="text-white light:text-slate-800 font-semibold">{formatCurrency(balanceInfo.netBalance)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(source)}
                    className="p-2 rounded-xl bg-white/[0.06] light:bg-slate-100 hover:bg-white/[0.16] light:hover:bg-slate-200 text-slate-200 light:text-slate-700 hover:text-white light:hover:text-slate-900 border border-white/12 light:border-slate-300 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Editar fuente"
                    aria-label={`Editar ${source.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSource(source)}
                    disabled={sortedSources.length <= 1}
                    className={`p-2 rounded-xl border transition-all ${
                      sortedSources.length <= 1
                        ? 'opacity-20 cursor-not-allowed border-transparent text-slate-600 light:text-slate-400'
                        : 'bg-rose-500/20 light:bg-rose-50 hover:bg-rose-500/30 light:hover:bg-rose-100 text-rose-400 light:text-rose-600 border-rose-500/40 light:border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] light:shadow-sm cursor-pointer active:scale-95'
                    }`}
                    title={
                      sortedSources.length <= 1
                        ? 'Debes mantener al menos una cuenta activa'
                        : 'Eliminar fuente'
                    }
                    aria-label={`Eliminar ${source.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: Añadir o Editar Fuente (Liquid Glass Portal)            */}
      {/* ============================================================== */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-white my-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-indigo-400" />
                  <span>{editingSource ? 'Editar Fuente' : 'Nueva Fuente'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveForm} className="flex flex-col gap-3.5">
                {/* Type Switcher */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('bank');
                      if (formInstitution === 'Efectivo') setFormInstitution('BBVA');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      formType === 'bank'
                        ? 'bg-indigo-500/25 border-indigo-400 text-white'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Landmark className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Banco</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('cash');
                      if (!formName || formName === 'Cuenta Nómina') setFormName('Billetera');
                      setFormInstitution('Efectivo');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      formType === 'cash'
                        ? 'bg-emerald-500/25 border-emerald-400 text-white'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Efectivo</span>
                  </button>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Nombre de la Cuenta</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Nómina Santander, Ahorros, Billetera..."
                    className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Institution */}
                {formType === 'bank' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-300">Banco / Entidad</label>
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      placeholder="Ej. BBVA, Santander, Revolut..."
                      className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {COMMON_BANKS.slice(0, 4).map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setFormInstitution(bank)}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[10px] text-slate-400 hover:text-white cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Initial Balance */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Balance Inicial (€)</label>
                  <input
                    type="number"
                    step="any"
                    value={formInitialBalance}
                    onChange={(e) => setFormInitialBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-[10px] text-slate-500">
                    Saldo base a partir del cual se computan los movimientos.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    {editingSource ? 'Guardar Cambios' : 'Crear Fuente'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================== */}
      {/* CONFIRMATION MODAL: Eliminar Fuente (Portal)                   */}
      {/* ============================================================== */}
      {deletingSource &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-rose-500/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-3.5 text-white my-auto">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Eliminar {deletingSource.name}</h4>
                  <p className="text-[11px] text-slate-400">Esta acción no se puede deshacer.</p>
                </div>
              </div>

              {/* Check transaction count */}
              {(() => {
                const txLinked = transactions.filter((t) => t.sourceId === deletingSource.id).length;
                if (txLinked > 0) {
                  return (
                    <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Esta cuenta tiene <strong>{txLinked} transacciones</strong> vinculadas. Si la eliminas, dichas transacciones conservarán su importe en el historial pero dejarán de estar asignadas a esta fuente.
                      </span>
                    </div>
                  );
                }
                return (
                  <p className="text-xs text-slate-300">
                    ¿Seguro que deseas eliminar la fuente <strong>{deletingSource.name}</strong>?
                  </p>
                );
              })()}

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setDeletingSource(null)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
