import { Home, BarChart3, TrendingUp, Plus } from 'lucide-react';
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
      className="fixed bottom-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-950/40 backdrop-blur-2xl border border-white/15 rounded-full p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-300"
    >
      {/* Specular hairline top reflection */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Tab: Inicio */}
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
          activeTab === 'home'
            ? 'text-white bg-white/10 font-semibold shadow-inner'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="h-4 w-4" />
        <span className="text-[10px] tracking-tight">Inicio</span>
      </button>

      {/* Tab: Estadísticas */}
      <button
        type="button"
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
          activeTab === 'stats'
            ? 'text-white bg-white/10 font-semibold shadow-inner'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 className="h-4 w-4" />
        <span className="text-[10px] tracking-tight">Estadísticas</span>
      </button>

      {/* Tab: Inversiones */}
      <button
        type="button"
        onClick={() => setActiveTab('invest')}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
          activeTab === 'invest'
            ? 'text-white bg-white/10 font-semibold shadow-inner'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="h-4 w-4" />
        <span className="text-[10px] tracking-tight">Inversiones</span>
      </button>

      {/* Central / Highlighted Action Button (+) */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="ml-1 h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-emerald-400 text-white shadow-lg shadow-indigo-500/30 border border-white/30 active:scale-95 hover:brightness-110 transition-all duration-200 cursor-pointer"
        aria-label="Registrar nueva transacción o activo"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
      </button>
    </nav>
  );
};
