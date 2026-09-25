import { useState } from 'react';
import { Wallet, Sparkles, RotateCcw } from 'lucide-react';
import { useFinanceStore } from './store/useFinanceStore';
import { MobileContainer } from './components/layout/MobileContainer';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { HeroBalance } from './components/home/HeroBalance';
import { MetricPillars } from './components/home/MetricPillars';
import { RecurrenceSummaryWidget } from './components/home/RecurrenceSummaryWidget';
import { RecentTransactionsList } from './components/home/RecentTransactionsList';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { QuickAddTransactionModal } from './components/forms/QuickAddTransactionModal';
import type { PillarType } from './types/finance';

export default function App() {
  const activeTab = useFinanceStore((state) => state.activeTab);
  const resetToInitialData = useFinanceStore((state) => state.resetToInitialData);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<PillarType | 'all'>('all');

  return (
    <MobileContainer>
      {/* Top Mobile Bar */}
      <header className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0B0F19]/90 backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Fluo
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Financial OS</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToInitialData}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
            title="Restablecer datos de prueba"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Demo</span>
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Liquid Glass</span>
          </div>
        </div>
      </header>

      {/* Main View Switcher */}
      <main className="flex-1 flex flex-col gap-6">
        {activeTab === 'home' && (
          <>
            {/* 1. Hero Net Balance */}
            <HeroBalance />

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
    </MobileContainer>
  );
}
