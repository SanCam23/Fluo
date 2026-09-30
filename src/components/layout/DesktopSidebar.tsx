import { Home, BarChart3, TrendingUp, Plus, ShieldCheck, Lock, User, Loader2, FastForward } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface DesktopSidebarProps {
  onOpenAddModal: () => void;
  onOpenProfile: () => void;
  onOpenSimulator?: () => void;
  onLockOrSetupPin: () => void;
  hasPin: boolean;
  userEmail?: string | null;
  isDemoMode?: boolean;
  isCloudLoading?: boolean;
  simulatedTimeOffsetDays?: number;
}

const NAV_ITEMS = [
  { id: 'home' as const,   label: 'Inicio',        Icon: Home },
  { id: 'stats' as const,  label: 'Estadísticas',  Icon: BarChart3 },
  { id: 'invest' as const, label: 'Inversiones',   Icon: TrendingUp },
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onOpenAddModal,
  onOpenProfile,
  onOpenSimulator,
  onLockOrSetupPin,
  hasPin,
  userEmail,
  isDemoMode,
  isCloudLoading,
  simulatedTimeOffsetDays = 0,
}) => {
  const activeTab = useFinanceStore((state) => state.activeTab);
  const setActiveTab = useFinanceStore((state) => state.setActiveTab);

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : null;
  const userName = userEmail ? userEmail.split('@')[0] : 'Demo';

  return (
    <aside
      className={`
        hidden lg:flex
        fixed left-0 top-0 h-screen w-64 z-40
        flex-col justify-between
        bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-150
        border-r border-white/10
        transform-gpu
      `}
      aria-label="Barra lateral de navegación"
    >
      {/* Specular top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Soft inner refraction sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

      {/* ── TOP SECTION ── */}
      <div className="relative z-10 flex flex-col gap-8 p-6 pt-8">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <img
            src="/fluo-wordmark.webp"
            alt="Fluo"
            width="194"
            height="84"
            fetchPriority="high"
            className="h-9 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(99,102,241,0.35)] select-none"
          />
          {/* Connection status badge */}
          {isCloudLoading ? (
            <div
              className="ml-auto flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse"
              title="Sincronizando…"
            >
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              <span>Sync</span>
            </div>
          ) : (
            <div
              className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
              title="Conectado de forma segura"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Seguro</span>
            </div>
          )}
        </div>

        {/* Primary "+ Nuevo Movimiento" CTA */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="
            w-full flex items-center justify-center gap-2
            py-2.5 rounded-2xl font-semibold text-sm text-white
            bg-gradient-to-tr from-indigo-500/90 via-indigo-600/90 to-emerald-500/80
            border border-white/20
            shadow-[0_4px_20px_rgba(99,102,241,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)]
            hover:brightness-110 active:scale-[0.98]
            transition-all duration-200 cursor-pointer
          "
          aria-label="Registrar nueva transacción o inversión"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Nuevo Movimiento
        </button>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1" aria-label="Navegación principal">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                  text-sm font-medium text-left w-full
                  transition-all duration-200 cursor-pointer active:scale-[0.98]
                  ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                {label}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div className="relative z-10 flex flex-col gap-3 p-6 pb-8">
        {/* Top divider */}
        <div className="h-px bg-white/10 -mx-1 mb-1" />

        {/* Time simulator (demo only) */}
        {!userEmail && onOpenSimulator && (
          <button
            type="button"
            onClick={onOpenSimulator}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
              border transition-all cursor-pointer
              ${
                simulatedTimeOffsetDays > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              }
            `}
            title="Simulador de Tiempo y Recurrencias"
          >
            <FastForward className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Simular tiempo</span>
            {simulatedTimeOffsetDays > 0 && (
              <span className="ml-auto text-[10px] font-bold text-amber-200">
                +{simulatedTimeOffsetDays}d
              </span>
            )}
          </button>
        )}

        {/* Security / PIN lock button */}
        <button
          type="button"
          onClick={onLockOrSetupPin}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
            border transition-all cursor-pointer
            ${
              hasPin
                ? 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border-indigo-500/25'
            }
          `}
          title={hasPin ? 'Bloquear Fluo ahora' : 'Configurar PIN de seguridad'}
        >
          {hasPin ? (
            <Lock className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          {hasPin ? 'Bloquear ahora' : 'Configurar PIN'}
        </button>

        {/* User mini-card */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="
            flex items-center gap-3 p-3 rounded-2xl w-full text-left
            bg-white/[0.05] hover:bg-white/[0.09]
            border border-white/10 hover:border-white/20
            backdrop-blur-md
            transition-all duration-200 cursor-pointer active:scale-[0.98]
            group
          "
          title={userEmail ? `Cuenta: ${userEmail}` : 'Modo Demo'}
          aria-label="Perfil y Ajustes"
        >
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-800/60 border border-white/15 flex items-center justify-center">
              {userInitial ? (
                <span className="text-base font-black text-white group-hover:text-indigo-200 transition-colors uppercase leading-none">
                  {userInitial}
                </span>
              ) : (
                <User className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors" />
              )}
            </div>
            {/* Status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F19] ${
                userEmail ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {userName}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {isDemoMode && !userEmail ? 'Modo Demo' : (userEmail ?? '')}
            </p>
          </div>

          {/* Caret indicator */}
          <div className="flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors text-xs">
            ›
          </div>
        </button>
      </div>
    </aside>
  );
};
