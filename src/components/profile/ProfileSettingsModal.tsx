import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  LogOut,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSecurityLock } from '../../hooks/useSecurityLock';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useTheme } from '../../hooks/useTheme';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onSignOut,
}) => {
  const { user, updatePassword, deleteUserAccount } = useAuth();
  const purgeUserData = useFinanceStore((state) => state.purgeUserData);
  const { themeMode, setThemeMode } = useTheme();

  const {
    hasPin,
    isBiometricsAvailable,
    isBiometricsEnabled,
    setupPin,
    changePin,
    removePin,
    toggleBiometrics,
    resetSecurity,
  } = useSecurityLock();

  // PIN Management states
  const [pinMode, setPinMode] = useState<'idle' | 'create' | 'change'>('idle');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Password Management states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Danger Zone / Delete Account states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Biometrics toggle state
  const [isTogglingBio, setIsTogglingBio] = useState(false);

  if (!isOpen) return null;

  // Handle Save / Setup PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (pinMode === 'change') {
      if (!/^\d{4}$/.test(currentPinInput)) {
        setPinError('El PIN actual debe tener 4 dígitos.');
        return;
      }
      if (!/^\d{4}$/.test(newPinInput)) {
        setPinError('El nuevo PIN debe tener exactamente 4 dígitos numéricos.');
        return;
      }
      if (newPinInput !== confirmPinInput) {
        setPinError('Los nuevos PINs no coinciden.');
        return;
      }

      const res = await changePin(currentPinInput, newPinInput);
      if (!res.success) {
        setPinError(res.error || 'El PIN actual no es correcto.');
        return;
      }
      setPinSuccess('PIN actualizado correctamente.');
    } else {
      // Create new PIN
      if (!/^\d{4}$/.test(newPinInput)) {
        setPinError('El PIN debe tener exactamente 4 dígitos numéricos.');
        return;
      }
      if (newPinInput !== confirmPinInput) {
        setPinError('Los PINs introducidos no coinciden.');
        return;
      }

      const ok = await setupPin(newPinInput);
      if (!ok) {
        setPinError('Error al guardar el PIN.');
        return;
      }
      setPinSuccess('PIN de 4 dígitos activado con éxito.');
    }

    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinMode('idle');
  };

  const handleRemovePin = () => {
    removePin();
    setPinMode('idle');
    setPinSuccess('PIN desactivado correctamente.');
    setTimeout(() => setPinSuccess(null), 3500);
  };

  // Handle Biometrics Toggle
  const handleToggleBiometrics = async () => {
    if (!isBiometricsAvailable || isTogglingBio) return;
    setIsTogglingBio(true);
    setPinError(null);
    try {
      const nextState = !isBiometricsEnabled;
      const success = await toggleBiometrics(nextState);
      if (success) {
        setPinSuccess(
          nextState ? 'Desbloqueo biométrico activado.' : 'Desbloqueo biométrico desactivado.'
        );
        setTimeout(() => setPinSuccess(null), 3500);
      } else {
        setPinError('No se pudo verificar la autenticación biométrica en el dispositivo.');
      }
    } finally {
      setIsTogglingBio(false);
    }
  };

  // Handle Password Update with Supabase
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message || 'Error al actualizar la contraseña.');
      } else {
        setPasswordSuccess('¡Contraseña actualizada correctamente!');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Error al comunicar con Supabase.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Delete Account (GDPR)
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR') {
      setDeleteError('Escribe exactamente "ELIMINAR" para confirmar.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      await deleteUserAccount();
      purgeUserData();
      resetSecurity();
      onSignOut();
      onClose();
    } catch (err: any) {
      setDeleteError(err?.message || 'Error al eliminar la cuenta. Inténtalo de nuevo.');
      setIsDeletingAccount(false);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-fadeIn">
      {/* Liquid Glass Main Modal Sheet */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col gap-5 text-white">
        {/* Specular Top Hairline */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* 1. Header Row & Close Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-indigo-600/20 to-emerald-500/20 border border-white/20 flex items-center justify-center text-xl font-black text-white shadow-inner">
              {user ? userInitial : <User className="h-6 w-6 text-indigo-300" />}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
                  user
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">
                {user ? user.email : 'Modo Demostración'}
              </span>
              <div className="mt-1">
                {user ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Cuenta Cloud — RLS Activo</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
                    <AlertCircle className="h-3 w-3" />
                    <span>Sesión Local Demo</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Toast Alerts */}
        {pinSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span>{pinSuccess}</span>
          </div>
        )}
        {pinError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300 animate-fadeIn">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{pinError}</span>
          </div>
        )}
        {passwordSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300 animate-fadeIn">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{passwordError}</span>
          </div>
        )}

        {/* 1.5. Appearance & Theme Selection */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Palette className="h-3.5 w-3.5 text-indigo-400" />
              <span>Apariencia / Tema</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              {themeMode === 'system' ? 'Automático' : themeMode === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Personaliza el entorno visual de Fluo. El modo claro utiliza la estética Blanco Perla iOS con cristal refractivo.
          </p>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-slate-900 shadow-md border border-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <Sun className={`h-3.5 w-3.5 ${themeMode === 'light' ? 'text-amber-500' : ''}`} />
              <span>Claro</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-white/15 text-white shadow-md border border-white/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <Moon className={`h-3.5 w-3.5 ${themeMode === 'dark' ? 'text-indigo-400' : ''}`} />
              <span>Oscuro</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'system'
                  ? 'bg-white/15 text-white shadow-md border border-white/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <Monitor className={`h-3.5 w-3.5 ${themeMode === 'system' ? 'text-emerald-400' : ''}`} />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        {/* 2. Security Section (PIN & Biometrics) */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Seguridad y Bóveda</span>
            </div>
            {hasPin && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                PIN Activo
              </span>
            )}
          </div>

          {/* PIN Action or Form */}
          {pinMode === 'idle' ? (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">
                  {hasPin ? 'PIN de 4 dígitos' : 'PIN de acceso'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {hasPin
                    ? 'Protege la app tras 3 minutos de inactividad'
                    : 'Bloquea la pantalla para máxima privacidad'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasPin ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setPinMode('change')}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePin}
                      className="px-2 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
                      title="Desactivar PIN"
                    >
                      Quitar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPinMode('create')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    Activar PIN
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePin} className="flex flex-col gap-2.5 pt-2 border-t border-white/10 animate-fadeIn">
              <span className="text-xs font-semibold text-indigo-300">
                {pinMode === 'change' ? 'Cambiar PIN de seguridad' : 'Crear PIN de 4 dígitos'}
              </span>

              {pinMode === 'change' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-medium">PIN Actual</label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-medium">
                    {pinMode === 'change' ? 'Nuevo PIN (4 dígitos)' : 'PIN (4 dígitos)'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-medium">Confirmar PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                >
                  Guardar PIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinMode('idle');
                    setPinError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Biometrics Toggle Row */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-indigo-300">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">
                  Desbloqueo Biométrico
                </span>
                <span className="text-[10px] text-slate-400">
                  {isBiometricsAvailable
                    ? 'Face ID / Touch ID / Huella dactilar'
                    : 'No disponible en este navegador'}
                </span>
              </div>
            </div>

            {/* iOS-Style Toggle Switch */}
            <button
              type="button"
              disabled={!isBiometricsAvailable || isTogglingBio}
              onClick={handleToggleBiometrics}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                isBiometricsEnabled ? 'bg-indigo-600' : 'bg-white/10'
              }`}
              role="switch"
              aria-checked={isBiometricsEnabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isBiometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Password Management Section (Cloud users only) */}
        {user && (
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                <span>Credenciales de Acceso</span>
              </div>
              {!isChangingPassword && (
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-2.5 pt-2 border-t border-white/10 animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-medium">Nueva Contraseña</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full rounded-xl bg-white/[0.06] border border-white/10 py-1.5 pl-3 pr-8 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-medium">Confirmar Nueva Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <span>Guardar Contraseña</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <span className="text-[11px] text-slate-400">
                Tu contraseña está sincronizada y protegida por Supabase Auth.
              </span>
            )}
          </div>
        )}

        {/* 4. Session & Danger Zone */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
            <span>Cerrar Sesión</span>
          </button>

          {/* Danger Zone (Delete Account) */}
          {user && (
            <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Zona de Peligro</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Eliminar de forma irreversible tu cuenta y todos tus datos financieros de la nube conforme a los derechos GDPR.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar Cuenta Definitivamente</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Delete Account Double-Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 p-6 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-white">¿Eliminar cuenta?</h4>
                <span className="text-[11px] text-rose-300">Acción irreversible</span>
              </div>
            </div>

            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-200 leading-relaxed">
              Esta acción es irreversible y eliminará definitivamente todas tus transacciones, carteras y datos en la nube.
            </div>

            {deleteError && (
              <div className="text-xs text-rose-300 bg-rose-500/15 p-2 rounded-xl border border-rose-500/30">
                {deleteError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-300 font-medium">
                Escribe <strong className="text-rose-400">ELIMINAR</strong> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText('');
                  setDeleteError(null);
                }}
                className="flex-1 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR' ||
                  isDeletingAccount
                }
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-400/30 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar Todo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
