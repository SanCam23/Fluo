import { useState, useEffect, lazy, Suspense } from 'react';
import { FastForward, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore';
import { useAuth } from './context/AuthContext';
import { useSecurityLock } from './hooks/useSecurityLock';
import { useTheme } from './hooks/useTheme';
import { MobileContainer } from './components/layout/MobileContainer';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { HeroBalance } from './components/home/HeroBalance';
import { MetricPillars } from './components/home/MetricPillars';
import { RecurrenceSummaryWidget } from './components/home/RecurrenceSummaryWidget';
import { RecentTransactionsList } from './components/home/RecentTransactionsList';
import { AuthScreen } from './components/auth/AuthScreen';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import type { PillarType, Transaction } from './types/finance';

// Code Splitting: Lazy load heavy analytical charts, secondary views & modals
const AnalyticsView = lazy(() =>
  import('./components/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const InvestmentsView = lazy(() =>
  import('./components/investments/InvestmentsView').then((m) => ({ default: m.InvestmentsView }))
);
const QuickAddTransactionModal = lazy(() =>
  import('./components/forms/QuickAddTransactionModal').then((m) => ({
    default: m.QuickAddTransactionModal,
  }))
);
const TimeSimulatorModal = lazy(() =>
  import('./components/common/TimeSimulatorModal').then((m) => ({ default: m.TimeSimulatorModal }))
);
const SignOutConfirmModal = lazy(() =>
  import('./components/auth/SignOutConfirmModal').then((m) => ({ default: m.SignOutConfirmModal }))
);
const SecurityLockScreen = lazy(() =>
  import('./components/security/SecurityLockScreen').then((m) => ({ default: m.SecurityLockScreen }))
);
const ProfileSettingsModal = lazy(() =>
  import('./components/profile/ProfileSettingsModal').then((m) => ({
    default: m.ProfileSettingsModal,
  }))
);
const InitialSourceModal = lazy(() =>
  import('./components/common/InitialSourceModal').then((m) => ({ default: m.InitialSourceModal }))
);

const ViewSkeletonFallback = () => (
  <div className="flex flex-col gap-4 animate-pulse p-1">
    <div className="h-32 rounded-3xl bg-white/[0.04] border border-white/10" />
    <div className="h-44 rounded-3xl bg-white/[0.04] border border-white/10" />
    <div className="h-32 rounded-3xl bg-white/[0.04] border border-white/10" />
  </div>
);

export default function App() {
  const { user, loading: isAuthLoading, isDemoMode, signOut } = useAuth();
  useTheme();

  const activeTab = useFinanceStore((state) => state.activeTab);
  const simulatedTimeOffsetDays = useFinanceStore((state) => state.simulatedTimeOffsetDays);
  const setUserId = useFinanceStore((state) => state.setUserId);
  const loadCloudData = useFinanceStore((state) => state.loadCloudData);
  const isCloudLoading = useFinanceStore((state) => state.isCloudLoading);
  const hasHydratedFromCloud = useFinanceStore((state) => state.hasHydratedFromCloud);
  const purgeUserData = useFinanceStore((state) => state.purgeUserData);
  const sources = useFinanceStore((state) => state.sources);

  const {
    isLocked,
    hasPin,
    isBiometricsAvailable,
    lockoutSecondsRemaining,
    lockNow,
    setupPin,
    unlockWithPin,
    unlockWithBiometrics,
    resetSecurity,
  } = useSecurityLock();

  const [isConfiguringPin, setIsConfiguringPin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarType | 'all'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Synchronize authenticated user with store and fetch cloud data
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      loadCloudData(user.id);
    } else {
      setUserId(null);
    }
  }, [user?.id, setUserId, loadCloudData]);

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      purgeUserData();
      resetSecurity();
      await signOut();
      setIsSignOutModalOpen(false);
      setIsProfileModalOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 1. Initial Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0B0F19] text-white">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-2xl shadow-indigo-500/30 animate-pulse">
          <img
            src="/icon-192.jpg"
            alt="Fluo"
            className="h-full w-full rounded-[22px] object-cover"
          />
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-300">
          Iniciando Fluo...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Screen (Login / Register with Liquid Glass)
  if (!user && !isDemoMode) {
    return <AuthScreen />;
  }

  // 3. Main Dashboard (Authenticated or Demo Mode)
  return (
    <MobileContainer activePillar={activeTab === 'home' ? selectedPillar : 'all'}>
      {/* Top Mobile Bar */}
      <header className="flex items-center justify-between mb-5 px-1 gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/fluo-wordmark.png"
            alt="Fluo"
            className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(99,102,241,0.35)] select-none"
          />
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cloud Sync indicator */}
          {isCloudLoading && (
            <div
              className="flex items-center gap-1 text-[11px] text-indigo-400 light:text-indigo-600 bg-indigo-500/10 light:bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-500/20 light:border-indigo-200 animate-pulse flex-shrink-0"
              title="Sincronizando con Supabase..."
            >
              <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
              <span className="hidden sm:inline">Sync</span>
            </div>
          )}

          {/* Time & Recurrences Simulator (Only in Demo Mode / Not logged in) */}
          {!user && (
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer backdrop-blur-md flex-shrink-0 ${
                simulatedTimeOffsetDays > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 light:text-amber-800 light:bg-amber-50 light:border-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 light:text-indigo-700 light:bg-indigo-50 light:border-indigo-200 border-indigo-500/30'
              }`}
              title="Simulador de Tiempo y Recurrencias"
            >
              <FastForward className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Simular</span>
              {simulatedTimeOffsetDays > 0 && (
                <span className="text-[10px] font-bold text-amber-200 light:text-amber-900 flex-shrink-0">
                  +{simulatedTimeOffsetDays}d
                </span>
              )}
            </button>
          )}

          {/* Security PIN / App Lock */}
          <button
            type="button"
            onClick={() => {
              if (hasPin) {
                lockNow();
              } else {
                setIsConfiguringPin(true);
              }
            }}
            className={`p-2 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
              hasPin
                ? 'bg-white/[0.08] light:bg-white/90 hover:bg-white/[0.14] hover:light:bg-white text-slate-300 light:text-slate-700 hover:text-white hover:light:text-slate-900 border-white/12 light:border-slate-300/80 shadow-sm'
                : 'bg-indigo-500/15 light:bg-indigo-50 hover:bg-indigo-500/25 text-indigo-300 light:text-indigo-700 border-indigo-500/30 light:border-indigo-200'
            }`}
            title={hasPin ? 'Bloquear Fluo ahora' : 'Configurar PIN de seguridad (4 dígitos)'}
            aria-label={hasPin ? 'Bloquear Fluo' : 'Configurar PIN'}
          >
            {hasPin ? (
              <Lock className="h-3.5 w-3.5 text-slate-300 light:text-slate-700" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 light:text-indigo-600" />
            )}
          </button>

          {/* Floating Liquid Glass Profile Avatar Button */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="relative w-10 h-10 rounded-full bg-slate-800/60 light:bg-white/90 backdrop-blur-xl border border-white/15 light:border-slate-300/80 flex items-center justify-center hover:bg-slate-700/60 hover:light:bg-white transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] light:shadow-[0_2px_8px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] active:scale-95 group"
            title={user ? `Cuenta: ${user.email} (Perfil y Seguridad)` : 'Modo Demostración — Perfil y Ajustes'}
            aria-label="Perfil y Ajustes de Cuenta"
          >
            {user?.email ? (
              <span className="text-base sm:text-lg font-black text-white light:text-indigo-600 group-hover:text-indigo-200 group-hover:light:text-indigo-700 transition-colors uppercase leading-none">
                {user.email.charAt(0)}
              </span>
            ) : (
              <User className="h-5 w-5 text-slate-300 light:text-slate-700 group-hover:text-white group-hover:light:text-indigo-600 transition-colors" />
            )}
            {/* Status dot indicator */}
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F19] light:border-[#F1F5F9] ${
                user
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main View Switcher with Privacy Obfuscation when locked */}
      <main
        className={`flex-1 flex flex-col gap-6 transition-all duration-300 ${
          isLocked ? 'filter blur-2xl pointer-events-none select-none opacity-40' : ''
        }`}
      >
        {activeTab === 'home' && (
          <>
            {/* 1. Hero Net Balance */}
            <HeroBalance selectedPillar={selectedPillar} />

            {/* 2. Three Metric Pillars (Ingresos, Gastos, Cartera) */}
            <MetricPillars
              selectedPillar={selectedPillar}
              onSelectPillar={setSelectedPillar}
            />

            {/* 3. Upcoming Recurrences / Scheduled Cashflow */}
            <RecurrenceSummaryWidget />

            {/* 4. Recent Transactions with Brand Avatars & Filtering */}
            <RecentTransactionsList
              selectedPillar={selectedPillar}
              onSelectPillar={setSelectedPillar}
              onEditTransaction={setEditingTransaction}
            />
          </>
        )}

        {activeTab === 'stats' && (
          <Suspense fallback={<ViewSkeletonFallback />}>
            <AnalyticsView />
          </Suspense>
        )}

        {activeTab === 'invest' && (
          <Suspense fallback={<ViewSkeletonFallback />}>
            <InvestmentsView />
          </Suspense>
        )}
      </main>

      {/* Floating Bottom Glass Navigation Bar */}
      <FloatingNavbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Quick Add / Edit Transaction Modal */}
      {(isAddModalOpen || Boolean(editingTransaction)) && (
        <Suspense fallback={null}>
          <QuickAddTransactionModal
            isOpen={isAddModalOpen || Boolean(editingTransaction)}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingTransaction(null);
            }}
            editingTransaction={editingTransaction}
          />
        </Suspense>
      )}

      {/* Time & Recurrences Simulator Modal (Debug Tool) */}
      {isSimulatorOpen && (
        <Suspense fallback={null}>
          <TimeSimulatorModal
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
          />
        </Suspense>
      )}

      {/* Profile & Account Settings Modal (Liquid Glass) */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <ProfileSettingsModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSignOut={handleConfirmSignOut}
          />
        </Suspense>
      )}

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <Suspense fallback={null}>
          <SignOutConfirmModal
            isOpen={isSignOutModalOpen}
            onClose={() => setIsSignOutModalOpen(false)}
            onConfirm={handleConfirmSignOut}
            userEmail={user?.email}
            isLoggingOut={isLoggingOut}
          />
        </Suspense>
      )}

      {/* Mandatory Initial Source Onboarding Modal (when 0 sources exist) */}
      {Boolean(
        (user || isDemoMode) &&
        !isCloudLoading &&
        sources.length === 0 &&
        (isDemoMode || hasHydratedFromCloud)
      ) && (
        <Suspense fallback={null}>
          <InitialSourceModal isOpen={true} />
        </Suspense>
      )}

      {/* Security Lock Screen & Biometric PIN Vault */}
      {(isLocked || isConfiguringPin) && (
        <Suspense fallback={null}>
          <SecurityLockScreen
            isLocked={isLocked || isConfiguringPin}
            hasPin={hasPin && !isConfiguringPin}
            isBiometricsAvailable={isBiometricsAvailable}
            lockoutSecondsRemaining={lockoutSecondsRemaining}
            onUnlockWithPin={unlockWithPin}
            onUnlockWithBiometrics={unlockWithBiometrics}
            onSetupPin={async (pin) => {
              const success = await setupPin(pin);
              if (success) {
                setIsConfiguringPin(false);
              }
              return success;
            }}
          />
        </Suspense>
      )}

      {/* PWA Smart Install Prompt (Android & iOS Safari Guide) */}
      <PWAInstallPrompt />
    </MobileContainer>
  );
}
