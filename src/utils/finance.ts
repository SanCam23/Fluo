/**
 * Core Financial Utilities - Barrel Re-export
 * Modularized into:
 * - financialCalculations: Source balances, Cash flow, Savings metrics, Savings evolution.
 * - investmentMatching: Concept parsing, Asset index matching, Asset reconciliations.
 * - brokerAnalytics: Broker detection (isInvestmentSource), Holdings ranking, Allocation, Progression series.
 */

export * from './financialCalculations';
export * from './investmentMatching';
export * from './brokerAnalytics';
