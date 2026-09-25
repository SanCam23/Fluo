import type { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] text-white flex justify-center overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background light orbs (vital for Liquid Glass refraction effect) */}
      <div className="fixed top-[-10%] left-[-15%] h-[380px] w-[380px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-20%] h-[360px] w-[360px] rounded-full bg-indigo-500/20 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[10%] h-[350px] w-[350px] rounded-full bg-rose-500/15 blur-[120px] pointer-events-none" />

      {/* Mobile viewport restriction frame */}
      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col px-4 pt-6 pb-28">
        {children}
      </div>
    </div>
  );
};
