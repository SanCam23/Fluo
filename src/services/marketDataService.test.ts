import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchAssets,
  fetchCurrentPrice,
  batchUpdateMarketQuotes,
  getQuoteFromCache,
  clearMarketQuotesCache,
} from './marketDataService';

describe('Market Data Service - Semantic Search', () => {
  it('should find assets by benchmark index name (e.g. "S&P 500")', async () => {
    const results = await searchAssets('S&P 500');
    expect(results.length).toBeGreaterThan(0);
    const hasVusa = results.some((r) => r.ticker === 'VUSA' || r.identifier === 'IE00B3XXRP09');
    const hasVoo = results.some((r) => r.ticker === 'VOO');
    expect(hasVusa || hasVoo).toBe(true);
  });

  it('should find assets by European index (e.g. "MSCI Europe")', async () => {
    const results = await searchAssets('MSCI Europe');
    expect(results.length).toBeGreaterThan(0);
    const hasEurope = results.some((r) => r.ticker === 'IMEU' || r.name.includes('MSCI Europe'));
    expect(hasEurope).toBe(true);
  });

  it('should find company by common brand name (e.g. "Apple" or "Santander")', async () => {
    const appleResults = await searchAssets('Apple');
    expect(appleResults.length).toBeGreaterThan(0);
    expect(appleResults[0].ticker).toBe('AAPL');

    const santanderResults = await searchAssets('Santander');
    expect(santanderResults.length).toBeGreaterThan(0);
    expect(santanderResults[0].identifier).toBe('SAN.MC');
  });

  it('should find asset by exact ISIN code (e.g. "IE00B4L5Y983")', async () => {
    const isinResults = await searchAssets('IE00B4L5Y983');
    expect(isinResults.length).toBeGreaterThan(0);
    expect(isinResults[0].isin).toBe('IE00B4L5Y983');
    expect(isinResults[0].ticker).toBe('SWDA');
  });

  it('should find cryptocurrency by symbol or name (e.g. "BTC" or "Bitcoin")', async () => {
    const btcResults = await searchAssets('BTC');
    expect(btcResults.length).toBeGreaterThan(0);
    expect(btcResults[0].identifier).toBe('BTC');
  });

  it('should provide a custom symbol option for unknown queries', async () => {
    const customResults = await searchAssets('XYZCORP');
    expect(customResults.length).toBeGreaterThan(0);
    const custom = customResults.find((r) => r.isCustom);
    expect(custom).toBeDefined();
    expect(custom?.identifier).toBe('XYZCORP');
  });
});

describe('Market Data Service - Live Quotes & Cache Resilience', () => {
  beforeEach(() => {
    clearMarketQuotesCache();
  });

  it('should fetch price and store quote in cache', async () => {
    const quote = await fetchCurrentPrice('AAPL');
    expect(quote.identifier).toBe('AAPL');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.currency).toBe('USD');
    expect(quote.lastUpdated).toBeDefined();

    // Verify it was saved to cache
    const cached = getQuoteFromCache('AAPL');
    expect(cached).toBeDefined();
    expect(cached?.identifier).toBe('AAPL');
    expect(cached?.price).toBe(quote.price);
  });

  it('should support batch updates for multiple assets', async () => {
    const batch = await batchUpdateMarketQuotes(['AAPL', 'BTC', 'IE00BK5BQT80']);
    expect(batch['AAPL']).toBeDefined();
    expect(batch['BTC']).toBeDefined();
    expect(batch['IE00BK5BQT80']).toBeDefined();

    expect(batch['AAPL'].price).toBeGreaterThan(0);
    expect(batch['BTC'].price).toBeGreaterThan(0);
  });
});
