import { useState, useEffect, useCallback, useRef } from 'react';

const PIN_STORAGE_KEY = 'fluo_security_pin_hash';
const LOCK_STORAGE_KEY = 'fluo_security_lock_state';
const LAST_ACTIVITY_KEY = 'fluo_last_activity_time';
const BIOMETRICS_KEY = 'fluo_biometrics_credential_id';
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutos de inactividad

/**
 * Calcula el hash SHA-256 criptográficamente seguro de un PIN de 4 dígitos.
 */
export async function hashPin(pin: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback de contingencia en entornos sin Web Crypto API
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      hash = (hash << 5) - hash + pin.charCodeAt(i);
      hash |= 0;
    }
    return `fb-${Math.abs(hash)}`;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`fluo_salt_v1_${pin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function useSecurityLock() {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const hasPin = Boolean(localStorage.getItem(PIN_STORAGE_KEY));
      const wasLocked = localStorage.getItem(LOCK_STORAGE_KEY) === 'true';
      const lastActive = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      const isExpired = lastActive > 0 && Date.now() - lastActive >= IDLE_TIMEOUT_MS;
      return hasPin && (wasLocked || isExpired);
    } catch {
      return false;
    }
  });

  const [hasPin, setHasPin] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(PIN_STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<boolean>(false);
  const idleTimerRef = useRef<number | null>(null);

  const recordActivity = useCallback(() => {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {
      // Ignorar errores en LocalStorage
    }
  }, []);

  // 1. Detectar disponibilidad de autenticación biométrica en el dispositivo (WebAuthn)
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        if (
          typeof window !== 'undefined' &&
          window.PublicKeyCredential &&
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
        ) {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricsAvailable(available);
        } else {
          setIsBiometricsAvailable(false);
        }
      } catch {
        setIsBiometricsAvailable(false);
      }
    };
    checkBiometrics();
  }, []);

  // 2. Función para bloquear la app
  const lockNow = useCallback(() => {
    try {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
      if (storedPin) {
        setIsLocked(true);
        localStorage.setItem(LOCK_STORAGE_KEY, 'true');
      }
    } catch (e) {
      console.warn('[Security] Could not persist lock state:', e);
    }
  }, []);

  // 3. Función para desbloquear la app
  const unlockNow = useCallback(() => {
    setIsLocked(false);
    recordActivity();
    try {
      localStorage.setItem(LOCK_STORAGE_KEY, 'false');
    } catch (e) {
      console.warn('[Security] Could not persist unlock state:', e);
    }
  }, [recordActivity]);

  // 4. Configurar un nuevo PIN de 4 dígitos
  const setupPin = useCallback(async (newPin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(newPin)) return false;
    try {
      const hash = await hashPin(newPin);
      localStorage.setItem(PIN_STORAGE_KEY, hash);
      localStorage.setItem(LOCK_STORAGE_KEY, 'false');
      recordActivity();
      setHasPin(true);
      setIsLocked(false);
      return true;
    } catch (e) {
      console.error('[Security] Failed to setup PIN:', e);
      return false;
    }
  }, [recordActivity]);

  // 5. Validar PIN para desbloquear
  const unlockWithPin = useCallback(async (candidatePin: string): Promise<boolean> => {
    try {
      const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
      if (!storedHash) {
        unlockNow();
        return true;
      }
      const candidateHash = await hashPin(candidatePin);
      if (candidateHash === storedHash) {
        unlockNow();
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Security] Failed to verify PIN:', e);
      return false;
    }
  }, [unlockNow]);

  // 6. Desbloqueo mediante biometría (Face ID / Huella / Touch ID)
  const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Verificamos si ya existe una credencial guardada
      const existingCredId = localStorage.getItem(BIOMETRICS_KEY);

      if (existingCredId) {
        // Intento de autenticación biométrica existente
        const rawId = Uint8Array.from(atob(existingCredId), (c) => c.charCodeAt(0));
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge,
            allowCredentials: [
              {
                id: rawId,
                type: 'public-key',
                transports: ['internal'],
              },
            ],
            userVerification: 'required',
            timeout: 60000,
          },
        });

        if (assertion) {
          unlockNow();
          return true;
        }
      } else {
        // Registro inicial y desbloqueo biométrico
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Fluo Financial OS' },
            user: {
              id: new Uint8Array([1, 2, 3, 4]),
              name: 'usuario@fluo.app',
              displayName: 'Usuario Fluo',
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },  // ES256
              { alg: -257, type: 'public-key' }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
            timeout: 60000,
          },
        }) as PublicKeyCredential | null;

        if (credential) {
          const credIdBase64 = btoa(
            String.fromCharCode(...new Uint8Array(credential.rawId))
          );
          localStorage.setItem(BIOMETRICS_KEY, credIdBase64);
          unlockNow();
          return true;
        }
      }
      return false;
    } catch (err: any) {
      // Si el usuario canceló la biometría o falló, recurre al PIN sin error ruidoso
      console.warn('[Security] Biometric prompt canceled or unavailable:', err?.message || err);
      return false;
    }
  }, [unlockNow]);

  // 7. Resetear temporizador de inactividad ante eventos de usuario
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    recordActivity();
    // Solo iniciar cuenta regresiva si el usuario tiene PIN configurado y no está ya bloqueado
    const pinExists = Boolean(localStorage.getItem(PIN_STORAGE_KEY));
    if (pinExists && !isLocked) {
      idleTimerRef.current = window.setTimeout(() => {
        lockNow();
      }, IDLE_TIMEOUT_MS);
    }
  }, [isLocked, lockNow, recordActivity]);

  // 8. Escuchar eventos de interacción del usuario para inactividad
  useEffect(() => {
    if (!hasPin || isLocked) {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetIdleTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [hasPin, isLocked, resetIdleTimer]);

  // 9. Comprobación inteligente ante cambio de visibilidad / segundo plano
  useEffect(() => {
    const handleVisibilityChange = () => {
      const pinExists = Boolean(localStorage.getItem(PIN_STORAGE_KEY));
      if (!pinExists || isLocked) return;

      if (document.visibilityState === 'hidden') {
        // Registrar timestamp de último uso antes de ir a segundo plano
        recordActivity();
      } else if (document.visibilityState === 'visible') {
        // Al regresar, comprobar si realmente transcurrió el tiempo de inactividad (3 minutos)
        const now = Date.now();
        const lastActive = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || now);
        const elapsed = now - lastActive;

        if (elapsed >= IDLE_TIMEOUT_MS) {
          lockNow();
        } else {
          // Mantener desbloqueado y programar el bloqueo para el tiempo remanente
          const remaining = IDLE_TIMEOUT_MS - elapsed;
          if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
          idleTimerRef.current = window.setTimeout(() => {
            lockNow();
          }, remaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasPin, isLocked, lockNow, recordActivity]);

  // 10. Función para purgar seguridad (en logout)
  const resetSecurity = useCallback(() => {
    setIsLocked(false);
    setHasPin(false);
    try {
      localStorage.removeItem(PIN_STORAGE_KEY);
      localStorage.removeItem(LOCK_STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(BIOMETRICS_KEY);
    } catch {
      // Ignorar errores en LocalStorage
    }
  }, []);

  return {
    isLocked,
    hasPin,
    isBiometricsAvailable,
    lockNow,
    unlockNow,
    setupPin,
    unlockWithPin,
    unlockWithBiometrics,
    resetSecurity,
  };
}
