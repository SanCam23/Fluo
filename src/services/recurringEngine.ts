/**
 * Recurring Transactions Engine
 * Handles granular periodicity calculations, date clamping, catch-up executions,
 * and automated transaction generation.
 */

import type { RecurrenceRule, Transaction } from '../types/finance';

/**
 * Calculates the last day of a given month
 */
export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

/**
 * Computes the next due date for a recurrence rule based on its current due date and configuration
 */
export function computeNextDueDate(currentDueDateStr: string, rule: Pick<RecurrenceRule, 'frequency' | 'dayOfMonth' | 'dayOfWeek'>): string {
  const current = new Date(currentDueDateStr);
  const year = current.getFullYear();
  const month = current.getMonth();
  const day = current.getDate();

  switch (rule.frequency) {
    case 'weekly': {
      const next = new Date(current);
      next.setDate(day + 7);

      // If specific dayOfWeek is set (1 = Monday, ..., 7 = Sunday)
      if (rule.dayOfWeek) {
        const jsDay = rule.dayOfWeek === 7 ? 0 : rule.dayOfWeek;
        const currentJsDay = next.getDay();
        const diff = (jsDay - currentJsDay + 7) % 7;
        if (diff !== 0) {
          next.setDate(next.getDate() + diff);
        }
      }
      return next.toISOString();
    }

    case 'biweekly': {
      const next = new Date(current);
      next.setDate(day + 14);
      return next.toISOString();
    }

    case 'monthly': {
      const targetMonth = month + 1;
      const targetYear = year + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;

      // Handle day of month clamping (e.g., day 31 in Feb -> 28/29)
      const configuredDay = rule.dayOfMonth || day;
      const maxDaysInTargetMonth = getDaysInMonth(targetYear, normalizedMonth);
      const clampedDay = Math.min(configuredDay, maxDaysInTargetMonth);

      const next = new Date(targetYear, normalizedMonth, clampedDay, current.getHours(), current.getMinutes(), current.getSeconds());
      return next.toISOString();
    }

    case 'yearly': {
      const targetYear = year + 1;
      const maxDaysInTargetMonth = getDaysInMonth(targetYear, month);
      const clampedDay = Math.min(day, maxDaysInTargetMonth);

      const next = new Date(targetYear, month, clampedDay, current.getHours(), current.getMinutes(), current.getSeconds());
      return next.toISOString();
    }

    default:
      return current.toISOString();
  }
}

/**
 * Calculates the first upcoming nextDueDate when creating a new recurring rule
 */
export function calculateFirstNextDueDate(
  baseDate: Date,
  rule: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    startDate?: string;
  }
): string {
  const start = rule.startDate ? new Date(rule.startDate) : baseDate;
  const ref = start.getTime() > baseDate.getTime() ? start : baseDate;
  const year = ref.getFullYear();
  const month = ref.getMonth();

  switch (rule.frequency) {
    case 'weekly': {
      const next = new Date(ref);
      if (rule.dayOfWeek) {
        const jsTargetDay = rule.dayOfWeek === 7 ? 0 : rule.dayOfWeek;
        const currentJsDay = ref.getDay();
        let diff = (jsTargetDay - currentJsDay + 7) % 7;
        if (diff === 0) diff = 7;
        next.setDate(ref.getDate() + diff);
      } else {
        next.setDate(ref.getDate() + 7);
      }
      return next.toISOString();
    }

    case 'biweekly': {
      const next = new Date(ref);
      next.setDate(ref.getDate() + 14);
      return next.toISOString();
    }

    case 'monthly': {
      const targetDay = rule.dayOfMonth || ref.getDate();
      let targetMonth = month;
      let targetYear = year;

      if (ref.getDate() >= targetDay) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }
      const maxDays = getDaysInMonth(targetYear, targetMonth);
      const clampedDay = Math.min(targetDay, maxDays);
      const next = new Date(targetYear, targetMonth, clampedDay, 12, 0, 0);
      return next.toISOString();
    }

    case 'yearly': {
      const targetYear = year + 1;
      const maxDays = getDaysInMonth(targetYear, month);
      const clampedDay = Math.min(ref.getDate(), maxDays);
      const next = new Date(targetYear, month, clampedDay, 12, 0, 0);
      return next.toISOString();
    }
  }
}

export interface RecurrenceProcessingResult {
  generatedTransactions: Transaction[];
  updatedRules: RecurrenceRule[];
}

/**
 * Processes all active recurrent rules up to asOfDate.
 * If multiple execution periods have elapsed (e.g. app wasn't opened for 3 months),
 * generates all historical catch-up transactions and updates nextDueDate.
 */
export function processDueRecurrences(
  rules: RecurrenceRule[],
  existingTransactions: Transaction[],
  asOfDate: Date = new Date()
): RecurrenceProcessingResult {
  const asOfTime = asOfDate.getTime();
  const generatedTransactions: Transaction[] = [];

  // Build a set of existing recurrence transaction signatures to prevent duplicates
  // Signature: `${recurrenceId}_${date.substring(0, 10)}`
  const existingSignatures = new Set<string>();
  existingTransactions.forEach((tx) => {
    if (tx.recurrenceId && tx.date) {
      existingSignatures.add(`${tx.recurrenceId}_${tx.date.substring(0, 10)}`);
    }
  });

  const updatedRules = rules.map((rule) => {
    if (!rule.isActive || rule.autoCharge === false) {
      return rule;
    }

    let nextDue = new Date(rule.nextDueDate);
    const ruleEndDate = rule.endDate ? new Date(rule.endDate) : null;
    let iterations = 0;
    const MAX_CATCHUP_ITERATIONS = 52; // Safeguard against infinite loops

    while (nextDue.getTime() <= asOfTime && iterations < MAX_CATCHUP_ITERATIONS) {
      iterations++;

      // Check if rule reached its end date
      if (ruleEndDate && nextDue.getTime() > ruleEndDate.getTime()) {
        return {
          ...rule,
          isActive: false,
        };
      }

      const dateStr = nextDue.toISOString();
      const dateKey = `${rule.id}_${dateStr.substring(0, 10)}`;

      if (!existingSignatures.has(dateKey)) {
        const newTx: Transaction = {
          id: `tx-rec-${rule.id}-${nextDue.getTime()}`,
          amount: rule.amount,
          pillar: rule.pillar,
          categoryId: rule.categoryId,
          brandId: rule.brandId,
          concept: rule.title,
          date: dateStr,
          isRecurring: true,
          isRecurringGenerated: true,
          recurrenceId: rule.id,
          createdAt: nextDue.getTime(),
        };

        generatedTransactions.push(newTx);
        existingSignatures.add(dateKey);
      }

      // Calculate next due date
      const nextDueStr = computeNextDueDate(dateStr, rule);
      nextDue = new Date(nextDueStr);
    }

    // Check if after catch-up it surpasses end date
    const shouldDeactivate = ruleEndDate && nextDue.getTime() > ruleEndDate.getTime();

    return {
      ...rule,
      nextDueDate: nextDue.toISOString(),
      lastProcessedDate: asOfDate.toISOString(),
      isActive: shouldDeactivate ? false : rule.isActive,
    };
  });

  return {
    generatedTransactions,
    updatedRules,
  };
}
