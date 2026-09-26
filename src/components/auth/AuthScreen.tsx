import React, { useState } from 'react';
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const AuthScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, enterDemoMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, introduce tu correo y contraseña.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Credenciales inválidas. Revisa tu email y contraseña.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('Debes confirmar tu correo electrónico antes de iniciar sesión.');
          } else {
            setErrorMessage(error.message || 'Error al iniciar sesión.');
          }
        }
      } else {
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrorMessage('Ya existe una cuenta con este correo.');
          } else {
            setErrorMessage(error.message || 'Error al crear la cuenta.');
          }
        } else if (data?.user && !data.session) {
          // Supabase email confirmation required
          setSuccessMessage(
            '¡Cuenta creada con éxito! Hemos enviado un correo de confirmación. Por favor, verifica tu bandeja de entrada.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ha ocurrido un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0B0F19] text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Background Ambient Atmospheric Lighting Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-2/3 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* App Logo & Header Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-emerald-400 p-0.5 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            {/* Specular Glint */}
            <div className="pointer-events-none absolute inset-x-3 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#0B0F19]/90 backdrop-blur-md">
              <Wallet className="h-8 w-8 text-emerald-400 stroke-[2.2]" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Fluo
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Smart Financial OS &bull; Liquid Glass
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <AlertCircle className="h-3 w-3" />
              <span>Configuración local de Supabase</span>
            </div>
          )}
        </div>

        {/* Liquid Glass Auth Card */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]">
          {/* Specular Top Hairline */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Mode Switcher Tabs (Liquid Glass Capsule) */}
          <div className="relative mb-6 flex rounded-2xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.3)] border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.3)] border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register Only) */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Confirmar Contraseña
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-2xl bg-white/[0.05] border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Entrar a Fluo</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Crear Mi Cuenta</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Helper Text */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {mode === 'login' ? (
                <>
                  ¿Aún no tienes cuenta?{' '}
                  <span className="font-semibold text-indigo-400">Regístrate</span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <span className="font-semibold text-indigo-400">Inicia sesión</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Mode Bypass (Quick exploration option) */}
        <div className="mt-6">
          <button
            type="button"
            onClick={enterDemoMode}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Explorar en modo Demo (sin cuenta)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
