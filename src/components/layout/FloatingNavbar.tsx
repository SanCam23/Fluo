import React from 'react';
import { Home, PieChart, TrendingUp, Plus } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FloatingNavbarProps {
  onOpenAddModal: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenAddModal }) => {
  const activeTab = useFinanceStore((state) => state.activeTab);
  const setActiveTab = useFinanceStore((state) => state.setActiveTab);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/20 rounded-full p-2 shadow-2xl shadow-black/80 flex items-center justify-between z-50 transition-all duration-300"
    >
      {/* Upper subtle glass shine */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Tab: Inicio */}
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'home'
            ? 'text-white bg-white/10 font-medium'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px]">Inicio</span>
      </button>

      {/* Tab: Estadísticas */}
      <button
        type="button"
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'stats'
            ? 'text-white bg-white/10 font-medium'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <PieChart className="h-5 w-5" />
        <span className="text-[10px]">Métricas</span>
      </button>

      {/* Tab: Inversiones */}
      <button
        type="button"
        onClick={() => setActiveTab('invest')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'invest'
            ? 'text-white bg-white/10 font-medium'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="h-5 w-5" />
        <span className="text-[10px]">Cartera</span>
      </button>

      {/* Action CTA: Añadir (+) */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="ml-1 h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white shadow-lg shadow-indigo-600/30 border border-white/30 active:scale-90 hover:brightness-110 transition-all duration-200 cursor-pointer"
        aria-label="Registrar nueva transacción"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>
    </nav>
  );
};
