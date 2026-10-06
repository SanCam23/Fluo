import { Home, BarChart3, TrendingUp, Plus } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FloatingNavbarProps {
  onOpenAddModal: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenAddModal }) => {
  const activeTab = useFinanceStore((state) => state.activeTab);
  const setActiveTab = useFinanceStore((state) => state.setActiveTab);

  return (
    <div className="fixed bottom-4 lg:bottom-6 inset-x-4 max-w-sm lg:max-w-xl mx-auto z-50 gpu-layer transform-gpu select-none">
      {/* Subtle chromatic atmosphere underneath the dock (soft, understated candy glow) */}
      <div className="pointer-events-none absolute -bottom-1 inset-x-12 lg:inset-x-20 h-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 light:bg-indigo-500/15 blur-xl rounded-full" />

      {/* Main Transparent Liquid Glass Dock Container with Symmetrical 4-Slot Distribution */}
      <nav
        aria-label="Navegación principal"
        className="relative overflow-hidden rounded-full p-1.5 lg:px-5 lg:py-2 grid grid-cols-4 items-stretch gap-1.5 lg:gap-2.5 transition-all duration-300
          bg-slate-900/55 lg:bg-slate-900/65 light:bg-white/55 backdrop-blur-2xl lg:backdrop-blur-3xl backdrop-saturate-150
          border border-white/15 lg:border-white/20 light:border-white/80 hover:border-white/25
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_16px_36px_-8px_rgba(0,0,0,0.5)]
          light:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(15,23,42,0.12)]"
      >
        {/* Ambient interior refraction sheen covering the full organic curve */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] light:from-white/20 via-transparent to-transparent" />

        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 lg:py-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'home'
              ? 'text-white light:text-indigo-600 bg-white/12 light:bg-white/80 border border-white/20 light:border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.25)] light:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(15,23,42,0.08)] font-bold'
              : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 hover:bg-white/[0.05] lg:hover:bg-white/[0.08] light:hover:bg-white/40 border border-transparent font-medium'
          }`}
        >
          <Home className="h-4 w-4 lg:h-4.5 lg:w-4.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] light:drop-shadow-none" />
          <span className="text-[10px] lg:text-xs tracking-tight">Inicio</span>
        </button>

        {/* Tab 2: Estadísticas */}
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 lg:py-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'stats'
              ? 'text-white light:text-indigo-600 bg-white/12 light:bg-white/80 border border-white/20 light:border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.25)] light:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(15,23,42,0.08)] font-bold'
              : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 hover:bg-white/[0.05] lg:hover:bg-white/[0.08] light:hover:bg-white/40 border border-transparent font-medium'
          }`}
        >
          <BarChart3 className="h-4 w-4 lg:h-4.5 lg:w-4.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] light:drop-shadow-none" />
          <span className="text-[10px] lg:text-xs tracking-tight">Estadísticas</span>
        </button>

        {/* Tab 3: Inversiones */}
        <button
          type="button"
          onClick={() => setActiveTab('invest')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 lg:py-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'invest'
              ? 'text-white light:text-indigo-600 bg-white/12 light:bg-white/80 border border-white/20 light:border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.25)] light:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(15,23,42,0.08)] font-bold'
              : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 hover:bg-white/[0.05] lg:hover:bg-white/[0.08] light:hover:bg-white/40 border border-transparent font-medium'
          }`}
        >
          <TrendingUp className="h-4 w-4 lg:h-4.5 lg:w-4.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] light:drop-shadow-none" />
          <span className="text-[10px] lg:text-xs tracking-tight">Inversiones</span>
        </button>

        {/* Tab 4: (+) Action Button — Refined Candy Glass Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="group relative z-10 flex items-center justify-center py-1.5 lg:py-2 rounded-full transition-all duration-200 cursor-pointer active:scale-95
            bg-gradient-to-tr from-indigo-500/95 via-indigo-600/90 to-emerald-500/80 text-white
            shadow-[0_4px_14px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]
            light:shadow-[0_4px_14px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]
            border border-white/25 light:border-white/40 hover:brightness-110 lg:hover:scale-105"
          aria-label="Registrar nueva transacción o inversión"
        >
          <Plus className="relative z-10 h-6 w-6 stroke-[2.5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </nav>
    </div>
  );
};
