import { useState, useEffect } from 'react';
import { Wallet, FastForward, LogOut, LogIn, Loader2, Cloud } from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore';
import { useAuth } from './context/AuthContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { HeroBalance } from './components/home/HeroBalance';
import { MetricPillars } from './components/home/MetricPillars';
import { RecurrenceSummaryWidget } from './components/home/RecurrenceSummaryWidget';
import { RecentTransactionsList } from './components/home/RecentTransactionsList';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { QuickAddTransactionModal } from './components/forms/QuickAddTransactionModal';
import { TimeSimulatorModal } from './components/common/TimeSimulatorModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { SignOutConfirmModal } from './components/auth/SignOutConfirmModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import type { PillarType } from './types/finance';

export default function App() {
  const { user, loading: isAuthLoading, isDemoMode, signOut, exitDemoMode } = useAuth();

  const activeTab = useFinanceStore((state) => state.activeTab);
  const simulatedTimeOffsetDays = useFinanceStore((state) => state.simulatedTimeOffsetDays);
  const setUserId = useFinanceStore((state) => state.setUserId);
  const loadCloudData = useFinanceStore((state) => state.loadCloudData);
  const isCloudLoading = useFinanceStore((state) => state.isCloudLoading);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarType | 'all'>('all');

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
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#0B0F19]/90 backdrop-blur-md">
            <Wallet className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-300">
          Iniciando Fluo OS...
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
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0B0F19]/90 backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Fluo
              </h1>
              {user && (
                <div
                  className="flex items-center text-indigo-400/80"
                  title="Sincronizado con Supabase Cloud"
                >
                  <Cloud className="h-3 w-3" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Financial OS</p>
          </div>
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

      {/* Main View Switcher */}
      <main className="flex-1 flex flex-col gap-6">
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
            />
          </>
        )}

        {activeTab === 'stats' && <AnalyticsView />}

        {activeTab === 'invest' && <InvestmentsView />}
      </main>

      {/* Floating Bottom Glass Navigation Bar */}
      <FloatingNavbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Quick Add Transaction Modal */}
      <QuickAddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Time & Recurrences Simulator Modal (Debug Tool) */}
      <TimeSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        userEmail={user?.email}
        isLoggingOut={isLoggingOut}
      />

      {/* PWA Smart Install Prompt (Android & iOS Safari Guide) */}
      <PWAInstallPrompt />
    </MobileContainer>
  );
}
