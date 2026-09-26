/**
 * Live / Simulated Price Feed Service for Tickers & ISINs
 * Backward-compatible bridge delegating to marketDataService.ts
 */

import {
  fetchCurrentPrice,
  batchUpdateMarketQuotes,
} from './marketDataService';
import type { MarketQuoteResult } from '../types/finance';

export type QuoteResult = MarketQuoteResult;

export async function fetchLiveQuote(identifier: string): Promise<QuoteResult> {
  return fetchCurrentPrice(identifier);
}

export async function batchUpdateQuotes(
  identifiers: string[]
): Promise<Record<string, QuoteResult>> {
  return batchUpdateMarketQuotes(identifiers);
}
