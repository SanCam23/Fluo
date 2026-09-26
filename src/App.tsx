import { useState, useEffect, lazy, Suspense } from 'react';
import { FastForward, LogOut, LogIn, Loader2, Cloud, Lock, ShieldCheck } from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore';
import { useAuth } from './context/AuthContext';
import { useSecurityLock } from './hooks/useSecurityLock';
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

const ViewSkeletonFallback = () => (
  <div className="flex flex-col gap-4 animate-pulse p-1">
    <div className="h-32 rounded-3xl bg-white/[0.04] border border-white/10" />
    <div className="h-44 rounded-3xl bg-white/[0.04] border border-white/10" />
    <div className="h-32 rounded-3xl bg-white/[0.04] border border-white/10" />
  </div>
);

export default function App() {
  const { user, loading: isAuthLoading, isDemoMode, signOut, exitDemoMode } = useAuth();

  const activeTab = useFinanceStore((state) => state.activeTab);
  const simulatedTimeOffsetDays = useFinanceStore((state) => state.simulatedTimeOffsetDays);
  const setUserId = useFinanceStore((state) => state.setUserId);
  const loadCloudData = useFinanceStore((state) => state.loadCloudData);
  const isCloudLoading = useFinanceStore((state) => state.isCloudLoading);
  const purgeUserData = useFinanceStore((state) => state.purgeUserData);

  const {
    isLocked,
    hasPin,
    isBiometricsAvailable,
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
      <header className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <img
            src="/fluo-wordmark.png"
            alt="Fluo"
            className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(99,102,241,0.35)] select-none"
          />
          {user && (
            <div
              className="flex items-center text-indigo-400/80 -ml-0.5"
              title="Sincronizado con Supabase Cloud"
            >
              <Cloud className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Cloud Sync indicator */}
          {isCloudLoading && (
            <div
              className="flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse"
              title="Sincronizando con Supabase..."
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Sync</span>
            </div>
          )}

          {/* Time & Recurrences Simulator */}
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer backdrop-blur-md ${
              simulatedTimeOffsetDays > 0
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
            }`}
            title="Simulador de Tiempo y Recurrencias"
          >
            <FastForward className="h-3 w-3" />
            <span>Simular</span>
            {simulatedTimeOffsetDays > 0 && (
              <span className="text-[10px] font-bold text-amber-200">
                +{simulatedTimeOffsetDays}d
              </span>
            )}
          </button>

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
            className={`p-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
              hasPin
                ? 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white border-white/12'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
            }`}
            title={hasPin ? 'Bloquear Fluo ahora' : 'Configurar PIN de seguridad (4 dígitos)'}
            aria-label={hasPin ? 'Bloquear Fluo' : 'Configurar PIN'}
          >
            {hasPin ? (
              <Lock className="h-3.5 w-3.5 text-slate-300" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            )}
          </button>

          {/* User Session / Sign Out or Login Button */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsSignOutModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white text-xs font-medium border border-white/12 transition-all cursor-pointer"
              title={`Conectado como ${user.email}. Pulsa para salir.`}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="max-w-[70px] truncate sm:max-w-[100px]">
                {user.email?.split('@')[0]}
              </span>
              <LogOut className="h-3 w-3 text-slate-400 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={exitDemoMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
              title="Iniciar sesión con tu cuenta"
            >
              <LogIn className="h-3 w-3 text-indigo-400" />
              <span>Acceder</span>
            </button>
          )}
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

      {/* Security Lock Screen & Biometric PIN Vault */}
      {(isLocked || isConfiguringPin) && (
        <Suspense fallback={null}>
          <SecurityLockScreen
            isLocked={isLocked || isConfiguringPin}
            hasPin={hasPin && !isConfiguringPin}
            isBiometricsAvailable={isBiometricsAvailable}
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
