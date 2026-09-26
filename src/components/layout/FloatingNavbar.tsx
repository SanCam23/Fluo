import { Home, BarChart3, TrendingUp, Plus } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FloatingNavbarProps {
  onOpenAddModal: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenAddModal }) => {
  const activeTab = useFinanceStore((state) => state.activeTab);
  const setActiveTab = useFinanceStore((state) => state.setActiveTab);

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-50 gpu-layer transform-gpu">
      {/* Subsurface soft atmospheric aura underneath the dock */}
      <div className="pointer-events-none absolute -bottom-1 inset-x-12 h-4 bg-indigo-500/10 blur-xl rounded-full" />

      {/* Main Liquid Glass Dock Container with Symmetrical 4-Slot Distribution */}
      <nav
        aria-label="Navegación principal"
        className="relative overflow-hidden rounded-full p-1.5 grid grid-cols-4 items-stretch gap-1.5 transition-all duration-300
          bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-150
          border border-white/10 hover:border-white/20
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_16px_36px_-8px_rgba(0,0,0,0.45)]"
      >
        {/* Specular hairline top reflection simulating curved glass rim */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Ambient interior refraction sheen */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent" />

        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'home'
              ? 'text-white bg-white/12 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.25)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        {/* Tab 2: Estadísticas */}
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'stats'
              ? 'text-white bg-white/12 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.25)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-[10px] tracking-tight">Estadísticas</span>
        </button>

        {/* Tab 3: Inversiones */}
        <button
          type="button"
          onClick={() => setActiveTab('invest')}
          className={`relative z-10 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'invest'
              ? 'text-white bg-white/12 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.25)] font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent font-medium'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-[10px] tracking-tight">Inversiones</span>
        </button>

        {/* Tab 4: (+) Action Button (Prominent icon, no text label) */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="relative z-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer active:scale-90
            bg-gradient-to-tr from-indigo-500/90 via-indigo-600/90 to-emerald-500/80 text-white
            shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)]
            border border-white/25 hover:brightness-110"
          aria-label="Registrar nueva transacción o inversión"
        >
          {/* Specular curved glint on button apex */}
          <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <Plus className="h-6 w-6 stroke-[2.5] drop-shadow-sm" />
        </button>
      </nav>
    </div>
  );
};
