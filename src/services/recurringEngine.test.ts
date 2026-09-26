import { describe, it, expect } from 'vitest';
import {
  computeNextDueDate,
  processDueRecurrences,
  getDaysInMonth,
  calculateFirstNextDueDate,
} from './recurringEngine';
import type { RecurrenceRule, Transaction } from '../types/finance';

describe('Recurring Engine - computeNextDueDate & Date Clamping', () => {
  it('should advance weekly rule by 7 days', () => {
    const startDate = '2026-09-01T10:00:00.000Z';
    const nextDate = computeNextDueDate(startDate, {
      frequency: 'weekly',
    });

    const expected = new Date('2026-09-08T10:00:00.000Z').toISOString();
    expect(nextDate).toBe(expected);
  });

  it('should adjust to specific dayOfWeek for weekly rules (e.g. Wednesday = 3)', () => {
    // 2026-09-01 is a Tuesday (getDay() = 2)
    const startDate = '2026-09-01T10:00:00.000Z';
    const nextDate = computeNextDueDate(startDate, {
      frequency: 'weekly',
      dayOfWeek: 3, // Wednesday
    });

    const d = new Date(nextDate);
    // 2026-09-08 is Tuesday, +1 day to Wednesday = 2026-09-09
    expect(d.getUTCDay()).toBe(3);
  });

  it('should advance monthly rule by exactly one month', () => {
    const startDate = '2026-04-15T12:00:00.000Z';
    const nextDate = computeNextDueDate(startDate, {
      frequency: 'monthly',
      dayOfMonth: 15,
    });

    const d = new Date(nextDate);
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(4); // May (0-indexed: 4)
    expect(d.getUTCDate()).toBe(15);
  });

  it('should correctly clamp end-of-month dates (day 31 in February)', () => {
    // January 31, 2026 -> February 2026 has 28 days
    const jan31 = '2026-01-31T09:00:00.000Z';
    const febDate = computeNextDueDate(jan31, {
      frequency: 'monthly',
      dayOfMonth: 31,
    });

    const d = new Date(febDate);
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(1); // February
    expect(d.getUTCDate()).toBe(28); // Clamped to 28 days!
  });

  it('should correctly clamp day 31 in April to day 30', () => {
    const march31 = '2026-03-31T09:00:00.000Z';
    const aprilDate = computeNextDueDate(march31, {
      frequency: 'monthly',
      dayOfMonth: 31,
    });

    const d = new Date(aprilDate);
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(3); // April
    expect(d.getUTCDate()).toBe(30); // Clamped to 30!
  });

  it('verifies days in month helper for leap years', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap year)
    expect(getDaysInMonth(2026, 1)).toBe(28); // Feb 2026 (non-leap year)
  });
});

describe('Recurring Engine - Multi-Month Catch-up & ProcessDueRecurrences', () => {
  it('should generate 3 consecutive transactions if app is opened 3 months later', () => {
    const rule: RecurrenceRule = {
      id: 'rec-netflix',
      title: 'Netflix Premium 4K',
      amount: 17.99,
      pillar: 'expense',
      categoryId: 'cat-subs',
      frequency: 'monthly',
      dayOfMonth: 1,
      startDate: '2026-06-01T08:00:00.000Z',
      nextDueDate: '2026-06-01T08:00:00.000Z',
      isActive: true,
      autoCharge: true,
    };

    // User opens the app on September 5, 2026
    const asOfDate = new Date('2026-09-05T12:00:00.000Z');
    const existingTransactions: Transaction[] = [];

    const result = processDueRecurrences([rule], existingTransactions, asOfDate);

    // Should have generated June 1, July 1, August 1, and September 1
    // (Total 4 execution dates <= September 5)
    expect(result.generatedTransactions.length).toBe(4);

    expect(result.generatedTransactions[0].date.substring(0, 10)).toBe('2026-06-01');
    expect(result.generatedTransactions[1].date.substring(0, 10)).toBe('2026-07-01');
    expect(result.generatedTransactions[2].date.substring(0, 10)).toBe('2026-08-01');
    expect(result.generatedTransactions[3].date.substring(0, 10)).toBe('2026-09-01');

    // All should be marked with flags
    expect(result.generatedTransactions[0].isRecurring).toBe(true);
    expect(result.generatedTransactions[0].isRecurringGenerated).toBe(true);
    expect(result.generatedTransactions[0].recurrenceId).toBe('rec-netflix');

    // Rule's nextDueDate should now be October 1, 2026
    const updatedRule = result.updatedRules[0];
    expect(updatedRule.nextDueDate.substring(0, 10)).toBe('2026-10-01');
    expect(updatedRule.isActive).toBe(true);
  });

  it('should not duplicate already generated transactions', () => {
    const rule: RecurrenceRule = {
      id: 'rec-gym',
      title: 'Cuota Gimnasio Basic-Fit',
      amount: 29.99,
      pillar: 'expense',
      categoryId: 'cat-health',
      frequency: 'monthly',
      dayOfMonth: 1,
      startDate: '2026-08-01T08:00:00.000Z',
      nextDueDate: '2026-08-01T08:00:00.000Z',
      isActive: true,
      autoCharge: true,
    };

    // Transaction for August 1 already exists
    const existingTransactions: Transaction[] = [
      {
        id: 'tx-existing-1',
        amount: 29.99,
        pillar: 'expense',
        categoryId: 'cat-health',
        concept: 'Cuota Gimnasio Basic-Fit',
        date: '2026-08-01T08:00:00.000Z',
        isRecurring: true,
        recurrenceId: 'rec-gym',
        createdAt: Date.now(),
      },
    ];

    // User checks on September 2, 2026
    const asOfDate = new Date('2026-09-02T12:00:00.000Z');
    const result = processDueRecurrences([rule], existingTransactions, asOfDate);

    // Only September 1 should be generated because August 1 already exists
    expect(result.generatedTransactions.length).toBe(1);
    expect(result.generatedTransactions[0].date.substring(0, 10)).toBe('2026-09-01');
  });

  it('should handle weekly recurrence with multiple charges over 4 weeks', () => {
    const rule: RecurrenceRule = {
      id: 'rec-classes',
      title: 'Clase particular semanal',
      amount: 25.00,
      pillar: 'expense',
      categoryId: 'cat-leisure',
      frequency: 'weekly',
      startDate: '2026-09-01T10:00:00.000Z',
      nextDueDate: '2026-09-01T10:00:00.000Z',
      isActive: true,
      autoCharge: true,
    };

    // 25 days later
    const asOfDate = new Date('2026-09-26T10:00:00.000Z');
    const result = processDueRecurrences([rule], [], asOfDate);

    // Sep 1, Sep 8, Sep 15, Sep 22 (4 charges)
    expect(result.generatedTransactions.length).toBe(4);
    expect(result.updatedRules[0].nextDueDate.substring(0, 10)).toBe('2026-09-29');
  });

  it('should automatically deactivate rule after passing endDate', () => {
    const rule: RecurrenceRule = {
      id: 'rec-promo',
      title: 'Promo temporal 2 meses',
      amount: 10.00,
      pillar: 'expense',
      categoryId: 'cat-subs',
      frequency: 'monthly',
      dayOfMonth: 1,
      startDate: '2026-01-01T08:00:00.000Z',
      nextDueDate: '2026-01-01T08:00:00.000Z',
      endDate: '2026-02-15T00:00:00.000Z',
      isActive: true,
      autoCharge: true,
    };

    // User checks on May 2026
    const asOfDate = new Date('2026-05-01T12:00:00.000Z');
    const result = processDueRecurrences([rule], [], asOfDate);

    // Only Jan 1 and Feb 1 generated (within endDate)
    expect(result.generatedTransactions.length).toBe(2);
    // Rule should be marked inactive
    expect(result.updatedRules[0].isActive).toBe(false);
  });
});

describe('Recurring Engine - calculateFirstNextDueDate', () => {
  it('should schedule next month if configured day is today or has passed', () => {
    const baseDate = new Date('2026-09-15T10:00:00.000Z');
    const nextDue = calculateFirstNextDueDate(baseDate, {
      frequency: 'monthly',
      dayOfMonth: 10, // 10th has already passed on the 15th
    });

    const d = new Date(nextDue);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9); // October (0-indexed: 9)
    expect(d.getDate()).toBe(10);
  });

  it('should schedule upcoming day of week for weekly recurrence', () => {
    // 2026-09-26 is Saturday (6). Day 1 is Monday.
    const baseDate = new Date('2026-09-26T12:00:00.000Z');
    const nextDue = calculateFirstNextDueDate(baseDate, {
      frequency: 'weekly',
      dayOfWeek: 1, // Lunes
    });

    const d = new Date(nextDue);
    expect(d.getDay()).toBe(1); // Monday
    expect(d.getDate()).toBe(28); // Sep 28 is Monday
  });
});

