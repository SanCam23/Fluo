import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Fingerprint, Delete, CheckCircle2, AlertCircle } from 'lucide-react';

interface SecurityLockScreenProps {
  isLocked: boolean;
  hasPin: boolean;
  isBiometricsAvailable: boolean;
  lockoutSecondsRemaining?: number;
  onUnlockWithPin: (pin: string) => Promise<boolean>;
  onUnlockWithBiometrics: () => Promise<boolean>;
  onSetupPin: (pin: string) => Promise<boolean>;
  onClose?: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({
  isLocked,
  hasPin,
  isBiometricsAvailable,
  lockoutSecondsRemaining = 0,
  onUnlockWithPin,
  onUnlockWithBiometrics,
  onSetupPin,
}) => {
  const [pin, setPin] = useState<string>('');
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [tempFirstPin, setTempFirstPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Auto-lanzar biometría si está disponible al bloquearse
  useEffect(() => {
    if (isLocked && hasPin && isBiometricsAvailable) {
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLocked, hasPin, isBiometricsAvailable]);

  // Si no está bloqueado ni en modo setup, no renderizar
  if (!isLocked && hasPin) {
    return null;
  }

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPin('');
    }, 600);
  };

  const handleDigitPress = async (digit: string) => {
    if (pin.length >= 4 || isVerifying || isSuccess || lockoutSecondsRemaining > 0) return;

    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage(null);

    // Cuando se completan los 4 dígitos
    if (nextPin.length === 4) {
      setIsVerifying(true);

      if (hasPin) {
        // Validación de desbloqueo
        const valid = await onUnlockWithPin(nextPin);
        setIsVerifying(false);
        if (valid) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setPin('');
          }, 350);
        } else {
          triggerShake('PIN incorrecto. Inténtalo de nuevo.');
        }
      } else {
        // Flujo de creación de PIN
        setIsVerifying(false);
        if (setupStep === 'create') {
          setTempFirstPin(nextPin);
          setSetupStep('confirm');
          setPin('');
        } else {
          if (nextPin === tempFirstPin) {
            const created = await onSetupPin(nextPin);
            if (created) {
              setIsSuccess(true);
              setTimeout(() => {
                setIsSuccess(false);
                setPin('');
                setSetupStep('create');
                setTempFirstPin('');
              }, 400);
            } else {
              triggerShake('Error al guardar el PIN.');
            }
          } else {
            triggerShake('Los PIN no coinciden. Empieza de nuevo.');
            setSetupStep('create');
            setTempFirstPin('');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isVerifying) {
      setPin((prev) => prev.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const handleBiometricAuth = async () => {
    if (isVerifying || !isBiometricsAvailable) return;
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const success = await onUnlockWithBiometrics();
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPin('');
        }, 350);
      } else {
        setErrorMessage('Usa tu PIN de 4 dígitos.');
      }
    } catch {
      setErrorMessage('Autenticación biométrica no completada.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-3xl animate-fadeIn select-none gpu-layer transform-gpu">
      {/* Background Ambient Spheres */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Liquid Glass Main Vault Card */}
      <div
        className={`relative w-full max-w-xs overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-transform duration-200 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Top Specular Glint */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Security Vault Icon */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${
              isSuccess
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-7 w-7 animate-bounce" />
            ) : hasPin ? (
              <Lock className="h-6 w-6 stroke-[2.2]" />
            ) : (
              <ShieldCheck className="h-7 w-7 stroke-[2.2]" />
            )}
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            {isSuccess
              ? 'Desbloqueado'
              : hasPin
              ? 'Fluo Protegido'
              : setupStep === 'create'
              ? 'Crear PIN de Seguridad'
              : 'Confirma tu PIN'}
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
            {isSuccess
              ? 'Accediendo a tu panel financiero...'
              : hasPin
              ? 'Introduce tu PIN de 4 dígitos o usa biometría'
              : setupStep === 'create'
              ? 'Elige un código de 4 dígitos para proteger tu balance'
              : 'Introduce el mismo PIN de nuevo'}
          </p>

          {/* 4-Digit Glass Indicators */}
          <div className="flex items-center justify-center gap-3.5 my-5">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`transition-all duration-200 rounded-full ${
                    isFilled
                      ? isSuccess
                        ? 'w-4 h-4 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-110'
                        : 'w-4 h-4 bg-gradient-to-tr from-indigo-500 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.7)] scale-110'
                      : 'w-3.5 h-3.5 border border-white/30 bg-white/5'
                  }`}
                />
              );
            })}
          </div>

          {/* Lockout Countdown or Error Message */}
          {lockoutSecondsRemaining > 0 ? (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Demasiados intentos. Espera {lockoutSecondsRemaining}s</span>
            </div>
          ) : errorMessage ? (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}
        </div>

        {/* Translucent Keypad (3x4 grid) */}
        <div className="grid grid-cols-3 gap-2.5 mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              disabled={isVerifying || isSuccess || lockoutSecondsRemaining > 0}
              className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/10 text-lg font-bold text-white transition-all flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-40"
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row: Biometrics / Space, 0, Backspace */}
          <div className="flex items-center justify-center">
            {hasPin && isBiometricsAvailable ? (
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isVerifying || isSuccess || lockoutSecondsRemaining > 0}
                title="Desbloquear con Face ID / Huella"
                className="h-12 w-full rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 active:scale-95 border border-indigo-500/30 text-indigo-400 transition-all flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-40"
              >
                <Fingerprint className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-12" />
            )}
          </div>

          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            disabled={isVerifying || isSuccess || lockoutSecondsRemaining > 0}
            className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/10 text-lg font-bold text-white transition-all flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-40"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={pin.length === 0 || isVerifying || isSuccess || lockoutSecondsRemaining > 0}
            title="Borrar dígito"
            className="h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Security Notice */}
        <p className="text-[10px] text-center text-slate-500 mt-4 tracking-wide">
          Protección local con cifrado SHA-256 y WebAuthn
        </p>
      </div>
    </div>
  );
};
