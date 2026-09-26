import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // 2. Check if running on iOS (Safari WebKit)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If dismissed recently, don't show prompt immediately
    const dismissedTime = localStorage.getItem('fluo_pwa_prompt_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 1000 * 60 * 60 * 24 * 7) {
      // Dismissed within 7 days
      return;
    }

    // 3. Listen for Chromium/Android 'beforeinstallprompt' event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show iOS guide after a short delay
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isIosDevice && !checkStandalone) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('fluo_pwa_prompt_dismissed', String(Date.now()));
    } catch {
      // Ignore
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        {/* Specular Top Glint */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cerrar aviso de instalación"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
            <img
              src="/icon-192.jpg"
              alt="Fluo App"
              className="h-full w-full rounded-[10px] object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Instalar Fluo en tu móvil</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                PWA
              </span>
            </h4>

            {isIOS ? (
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Toca <Share className="inline h-3 w-3 text-indigo-400 mx-0.5" /> y luego{' '}
                <strong className="text-white font-medium inline-flex items-center gap-0.5">
                  <PlusSquare className="inline h-3 w-3" /> Añadir a la pantalla de inicio
                </strong>{' '}
                para usar Fluo como app nativa.
              </p>
            ) : (
              <p className="text-[11px] text-slate-300 mt-0.5">
                Acceso ultra-rápido, pantalla completa y soporte offline continuo.
              </p>
            )}

            {!isIOS && deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Instalar Aplicación</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
