import type { ReactNode } from 'react';
import type { PillarType } from '../../types/finance';

interface MobileContainerProps {
  children: ReactNode;
  activePillar?: PillarType | 'all';
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children, activePillar = 'all' }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] light:bg-[#F1F5F9] text-white light:text-slate-900 flex justify-center overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-500">
      {/* Soft ambient background light orbs (feather-light and ultra-diffuse) */}
      <div
        className={`fixed top-[-10%] left-[-15%] h-[380px] w-[380px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ${
          activePillar === 'income'
            ? 'bg-emerald-500/12 light:bg-emerald-400/20'
            : activePillar === 'expense'
            ? 'bg-rose-500/10 light:bg-rose-400/20'
            : activePillar === 'invest'
            ? 'bg-indigo-500/14 light:bg-indigo-400/20'
            : 'bg-emerald-500/[0.07] light:bg-indigo-400/15'
        }`}
      />
      <div
        className={`fixed top-[30%] right-[-20%] h-[360px] w-[360px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 ${
          activePillar === 'invest'
            ? 'bg-indigo-500/12 light:bg-indigo-400/20'
            : activePillar === 'income'
            ? 'bg-indigo-500/[0.06] light:bg-indigo-400/15'
            : activePillar === 'expense'
            ? 'bg-rose-500/[0.06] light:bg-rose-400/15'
            : 'bg-indigo-500/[0.08] light:bg-emerald-400/15'
        }`}
      />
      <div
        className={`fixed bottom-[-10%] left-[10%] h-[350px] w-[350px] rounded-full blur-[150px] pointer-events-none transition-all duration-700 ${
          activePillar === 'expense'
            ? 'bg-rose-500/12 light:bg-rose-400/20'
            : activePillar === 'income'
            ? 'bg-emerald-500/[0.06] light:bg-emerald-400/15'
            : activePillar === 'invest'
            ? 'bg-indigo-500/[0.06] light:bg-indigo-400/15'
            : 'bg-rose-500/[0.07] light:bg-rose-400/15'
        }`}
      />

      {/* Gentle top-only atmospheric spotlight (subtle whisper of light) */}
      <div
        className={`fixed top-0 inset-x-0 h-64 pointer-events-none transition-all duration-700 bg-gradient-to-b ${
          activePillar === 'income'
            ? 'from-emerald-500/[0.04] light:from-emerald-500/[0.08] to-transparent opacity-100'
            : activePillar === 'expense'
            ? 'from-rose-500/[0.04] light:from-rose-500/[0.08] to-transparent opacity-100'
            : activePillar === 'invest'
            ? 'from-indigo-500/[0.05] light:from-indigo-500/[0.08] to-transparent opacity-100'
            : 'opacity-0'
        }`}
      />

      {/* Mobile viewport restriction frame with iOS safe area compliance */}
      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(7rem,calc(env(safe-area-inset-bottom)+5.5rem))]">
        {children}
      </div>
    </div>
  );
};
