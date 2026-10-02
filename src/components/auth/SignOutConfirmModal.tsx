import React, { useEffect } from 'react';
import { LogOut, X, Loader2 } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail?: string;
  isLoggingOut: boolean;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isLoggingOut,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoggingOut]);

  if (!isOpen) return null;

  return (
    <div
      onClick={!isLoggingOut ? onClose : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md lg:backdrop-blur-3xl animate-fadeIn gpu-layer transform-gpu"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] gpu-layer transform-gpu"
      >
        {/* Specular Top Glint */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Content */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <LogOut className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            ¿Cerrar Sesión?
          </h3>
          {userEmail && (
            <p className="text-xs text-slate-400 mt-1 truncate max-w-full px-2">
              Conectado como <span className="text-indigo-300 font-medium">{userEmail}</span>
            </p>
          )}
          <p className="text-[11px] text-slate-500 mt-2">
            Tus datos en la nube están protegidos con RLS. Al salir, se purgarán los datos locales de este dispositivo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 border border-white/10 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs font-bold text-white shadow-lg shadow-rose-500/25 border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
