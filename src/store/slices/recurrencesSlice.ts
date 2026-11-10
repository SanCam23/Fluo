import type { RecurrenceRule } from '../../types/finance';
import type { RecurrencesSlice, StoreSet, StoreGet } from '../types';
import { processDueRecurrences } from '../../services/recurringEngine';
import { sortTransactionsDesc } from '../../utils/dates';

export const DEMO_RECURRENCE_IDS = new Set(['rec-001', 'rec-002', 'rec-003', 'rec-004', 'rec-005']);

export const createRecurrencesSlice = (set: StoreSet, get: StoreGet): RecurrencesSlice => ({
  addRecurrence: (ruleData) => {
    const newRule: RecurrenceRule = {
      ...ruleData,
      id: ruleData.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isActive: true,
      autoCharge: ruleData.autoCharge !== false,
    };
    set((state) => ({
      recurrences: [...state.recurrences, newRule],
    }));
  },

  deleteRecurrence: (id) => {
    set((state) => ({
      recurrences: state.recurrences.filter((r) => r.id !== id),
    }));
  },

  toggleRecurrence: (id) => {
    set((state) => ({
      recurrences: state.recurrences.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ),
    }));
  },

  triggerRecurrencesCheck: (asOfDate) => {
    const { recurrences, transactions, simulatedTimeOffsetDays } = get();

    // Self-healing: Purge any orphaned recurrence rules that have 0 transactions in the ledger
    // (Cleans up recurrences where the initial transaction was deleted prior to this update)
    const healedRecurrences = recurrences.filter((rule) => {
      if (DEMO_RECURRENCE_IDS.has(rule.id)) {
        return true;
      }
      const hasMatchingTx = transactions.some(
        (t) =>
          t.recurrenceId === rule.id ||
          (t.pillar === rule.pillar &&
            t.amount === rule.amount &&
            t.concept.toLowerCase() === rule.title.toLowerCase())
      );
      return hasMatchingTx;
    });

    const targetDate = asOfDate || new Date(Date.now() + simulatedTimeOffsetDays * 86400000);
    const { generatedTransactions, updatedRules } = processDueRecurrences(
      healedRecurrences,
      transactions,
      targetDate
    );

    if (generatedTransactions.length > 0) {
      set((state) => ({
        transactions: sortTransactionsDesc([...generatedTransactions, ...state.transactions]),
        recurrences: updatedRules,
      }));
    } else {
      set({ recurrences: updatedRules });
    }

    return generatedTransactions.length;
  },

  simulateTimeAdvance: (days) => {
    const currentOffset = get().simulatedTimeOffsetDays;
    const newOffset = currentOffset + days;
    const targetDate = new Date(Date.now() + newOffset * 86400000);
    set({ simulatedTimeOffsetDays: newOffset });
    const count = get().triggerRecurrencesCheck(targetDate);
    return {
      generatedCount: count,
      simulatedDate: targetDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  },

  resetSimulatedTime: () => {
    set({ simulatedTimeOffsetDays: 0 });
  },
});

