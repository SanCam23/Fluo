import { registerSW } from 'virtual:pwa-register';

/**
 * PWA Live Update Controller
 *
 * Resolves the issue where mobile PWAs (especially iOS WebKit standalone and Android Chrome)
 * remain on stale cached builds after a deployment unless manually reloaded.
 *
 * Features:
 * 1. Immediate registration on boot without waiting for window load.
 * 2. Automatic update check on app foreground / resume (`visibilitychange`).
 * 3. Automatic update check on window focus and network reconnect.
 * 4. Periodic check every 30 minutes while the app remains open.
 * 5. Automatic seamless reload when a new service worker takes control (`controllerchange`).
 */

let isRefreshing = false;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

export function initPWAUpdateService(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Track if this window was already controlled by a service worker.
  // This prevents an unnecessary reload on the user's very first visit.
  let hasController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasController) {
      // First time service worker installation - do not reload.
      hasController = true;
      return;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      // Reload current window with fresh cache-busted assets from the new Service Worker
      window.location.reload();
    }
  });

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Prompt the new service worker to skip waiting and activate immediately
      if (updateSW) {
        updateSW(true);
      }
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return;

      // 1. Check for updates on startup
      registration.update().catch(() => {});

      // 2. Check for updates whenever user unlocks phone or switches back to Fluo
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      // 3. Check for updates when window gains focus
      window.addEventListener('focus', () => {
        registration.update().catch(() => {});
      });

      // 4. Check for updates when internet connection is restored
      window.addEventListener('online', () => {
        registration.update().catch(() => {});
      });

      // 5. Periodic check every 30 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 30 * 60 * 1000);
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration error:', error);
    },
  });
}
