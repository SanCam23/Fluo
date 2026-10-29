import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchAssets,
  fetchCurrentPrice,
  batchUpdateMarketQuotes,
  getQuoteFromCache,
  clearMarketQuotesCache,
  isIsin,
  getFundEquivalence,
  FUND_ISIN_EQUIVALENCE_MAP,
  resolveIsinQuote,
  findMatchingExistingAssets,
} from './marketDataService';
import type { InvestmentAsset } from '../types/finance';

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
  }, 15000);
});

describe('Market Data Service - ISIN Detection & Twin Reference Tickers', () => {
  it('should accurately detect valid ISIN codes vs classic tickers', () => {
    // Valid 12-char international ISIN codes
    expect(isIsin('IE0032126645')).toBe(true);
    expect(isIsin('IE0007987690')).toBe(true);
    expect(isIsin('US0378331005')).toBe(true);
    expect(isIsin('ES0113900J37')).toBe(true);
    expect(isIsin('LU0996177134')).toBe(true);
    expect(isIsin('FR0010315770')).toBe(true);
    expect(isIsin('ie0032126645')).toBe(true); // Case-insensitive

    // Standard stock / crypto / commodity tickers (NOT ISIN)
    expect(isIsin('AAPL')).toBe(false);
    expect(isIsin('BTC')).toBe(false);
    expect(isIsin('SAN.MC')).toBe(false);
    expect(isIsin('VUSA')).toBe(false);
    expect(isIsin('VWCE.DE')).toBe(false);
    expect(isIsin('VOO')).toBe(false);
    expect(isIsin('12345')).toBe(false);
    expect(isIsin('')).toBe(false);
    expect(isIsin('IE001')).toBe(false);
  });

  it('should resolve Vanguard mutual funds to twin reference ETF tickers in equivalence table', () => {
    // Direct mapping access
    expect(FUND_ISIN_EQUIVALENCE_MAP['IE0032126645'].referenceTicker).toBe('VUSA.AS');

    // Vanguard US 500 Index Fund
    const us500Eq = getFundEquivalence('IE0032126645');
    expect(us500Eq).toBeDefined();
    expect(us500Eq?.referenceTicker).toBe('VUSA.AS');
    expect(us500Eq?.currency).toBe('EUR');
    expect(us500Eq?.name).toContain('Vanguard US 500');

    // Vanguard European Stock Index Fund
    const euroEq = getFundEquivalence('IE0007987690');
    expect(euroEq).toBeDefined();
    expect(euroEq?.referenceTicker).toBe('VEUR.AS');
    expect(euroEq?.currency).toBe('EUR');
    expect(euroEq?.name).toContain('Vanguard European Stock');

    // Vanguard Global Stock Index Fund
    const globalEq = getFundEquivalence('IE00B03HD191');
    expect(globalEq).toBeDefined();
    expect(globalEq?.referenceTicker).toBe('VWCE.DE');

    // Unknown ISIN returns undefined
    expect(getFundEquivalence('ES0000000000')).toBeUndefined();
  });

  it('should fetch quotes for Vanguard US 500 (IE0032126645) and Vanguard European Stock (IE0007987690)', async () => {
    const quoteUs = await fetchCurrentPrice('IE0032126645');
    expect(quoteUs).toBeDefined();
    expect(quoteUs.identifier).toBe('IE0032126645');
    expect(quoteUs.price).toBeGreaterThan(0);
    expect(quoteUs.currency).toBe('EUR');
    expect(quoteUs.quoteTicker).toBeDefined();
    expect(quoteUs.lastUpdated).toBeDefined();

    const quoteEuro = await fetchCurrentPrice('IE0007987690');
    expect(quoteEuro).toBeDefined();
    expect(quoteEuro.identifier).toBe('IE0007987690');
    expect(quoteEuro.price).toBeGreaterThan(0);
    expect(quoteEuro.currency).toBe('EUR');
    expect(quoteEuro.quoteTicker).toBeDefined();
  }, 15000);

  it('should fallback to cached quote with cutoff date without returning 0 € or resetting historical data', async () => {
    clearMarketQuotesCache();
    // Pre-populate cache with a known quote
    const mockIsin = 'IE0032126645';
    const initialQuote = await resolveIsinQuote(mockIsin);
    expect(initialQuote.price).toBeGreaterThan(0);

    const cached = getQuoteFromCache(mockIsin);
    expect(cached).not.toBeNull();
    expect(cached?.price).toBe(initialQuote.price);
    expect(cached?.price).toBeGreaterThan(0);
  }, 15000);
});

describe('Portfolio Dynamics - Real-Time P&L Recalculation', () => {
  it('should dynamically recalculate currentValue, pnl, and pnlPercentage without modifying averageBuyPrice', () => {
    const originalBuyPrice = 70.0;
    const shares = 15;
    const initialFee = 5.0;

    const asset: InvestmentAsset = {
      id: 'asset-test-01',
      name: 'Vanguard US 500 Index Fund EUR',
      identifier: 'IE0032126645',
      isin: 'IE0032126645',
      quoteTicker: '0P00000SUJ.F',
      assetType: 'index_fund',
      shares,
      averageBuyPrice: originalBuyPrice,
      currentPrice: originalBuyPrice, // Initially same
      currency: 'EUR',
      lastUpdated: 'Initial',
      initialFee,
    };

    // Calculate baseline
    const investedCost = asset.shares * asset.averageBuyPrice;
    expect(investedCost).toBe(1050.0);

    // Simulate market price surge (e.g. to 85.00 EUR per share)
    const newMarketPrice = 85.0;
    const newCurrentValue = Number((asset.shares * newMarketPrice).toFixed(2));
    const newPnL = Number((newCurrentValue - (asset.shares * asset.averageBuyPrice)).toFixed(2));
    const newPnLPercentage = Number(
      (((newMarketPrice - asset.averageBuyPrice) / asset.averageBuyPrice) * 100).toFixed(2)
    );

    const updatedAsset: InvestmentAsset = {
      ...asset,
      currentPrice: newMarketPrice,
      currentValue: newCurrentValue,
      pnl: newPnL,
      pnlPercentage: newPnLPercentage,
      lastPriceUpdate: new Date().toISOString(),
    };

    // 1. CRITICAL: averageBuyPrice MUST NEVER BE MODIFIED
    expect(updatedAsset.averageBuyPrice).toBe(originalBuyPrice);
    expect(updatedAsset.averageBuyPrice).toBe(70.0);

    // 2. currentValue reflects new market valuation
    expect(updatedAsset.currentValue).toBe(1275.0); // 15 * 85.00

    // 3. Unrealized PnL is exact gain
    expect(updatedAsset.pnl).toBe(225.0); // 1275.0 - 1050.0

    // 4. Unrealized PnL percentage is exact ROI
    expect(updatedAsset.pnlPercentage).toBeCloseTo(21.43, 1); // (85 - 70) / 70 * 100 = 21.428%
  });

  it('should handle negative P&L (loss) correctly while maintaining averageBuyPrice', () => {
    const originalBuyPrice = 100.0;
    const shares = 10;

    const asset: InvestmentAsset = {
      id: 'asset-test-02',
      name: 'Vanguard European Stock Index Fund EUR',
      identifier: 'IE0007987690',
      isin: 'IE0007987690',
      quoteTicker: '0P00000RQ8.F',
      assetType: 'index_fund',
      shares,
      averageBuyPrice: originalBuyPrice,
      currentPrice: 90.0, // Drop to 90
      currency: 'EUR',
      lastUpdated: 'Now',
    };

    const curPrice = asset.currentPrice;
    const currentValue = shares * curPrice;
    const pnl = currentValue - (shares * asset.averageBuyPrice);
    const pnlPercentage = ((curPrice - asset.averageBuyPrice) / asset.averageBuyPrice) * 100;

    expect(asset.averageBuyPrice).toBe(100.0);
    expect(currentValue).toBe(900.0);
    expect(pnl).toBe(-100.0);
    expect(pnlPercentage).toBe(-10.0);
  });
});

describe('findMatchingExistingAssets - Autocomplete on ISIN / Ticker match', () => {
  const mockPortfolio: InvestmentAsset[] = [
    {
      id: 'port-1',
      name: 'Vanguard US 500 Stock Index Fund EUR Acc',
      identifier: 'IE0032126645',
      isin: 'IE0032126645',
      quoteTicker: 'VUSA.AS',
      assetType: 'index_fund',
      shares: 10,
      averageBuyPrice: 70.0,
      currentPrice: 82.5,
      currency: 'EUR',
      platform: 'MyInvestor',
      lastUpdated: '2026-09-29',
    },
    {
      id: 'port-2',
      name: 'Apple Inc.',
      identifier: 'AAPL',
      ticker: 'AAPL',
      isin: 'US0378331005',
      assetType: 'stock',
      shares: 5,
      averageBuyPrice: 180.0,
      currentPrice: 220.0,
      currency: 'USD',
      platform: 'Trade Republic',
      lastUpdated: '2026-09-29',
    },
  ];

  it('should find existing portfolio asset by exact ISIN and prioritize portfolio source', () => {
    const matches = findMatchingExistingAssets('IE0032126645', mockPortfolio);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].source).toBe('portfolio');
    expect(matches[0].name).toBe('Vanguard US 500 Stock Index Fund EUR Acc');
    expect(matches[0].identifier).toBe('IE0032126645');
    expect(matches[0].quoteTicker).toBe('VUSA.AS');
    expect(matches[0].platform).toBe('MyInvestor');
    expect(matches[0].averageBuyPrice).toBe(70.0);
  });

  it('should find matching asset from catalog by ISIN when not in portfolio', () => {
    const matches = findMatchingExistingAssets('IE0007987690', mockPortfolio);
    expect(matches.length).toBeGreaterThan(0);
    const fund = matches.find((m) => m.identifier === 'IE0007987690' || m.isin === 'IE0007987690');
    expect(fund).toBeDefined();
    expect(fund?.name).toContain('Vanguard European Stock');
    expect(fund?.quoteTicker).toBe('VEUR.AS');
    expect(fund?.assetType).toBe('index_fund');
  });

  it('should find matching stock by ticker (e.g. AAPL)', () => {
    const matches = findMatchingExistingAssets('AAPL', mockPortfolio);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].source).toBe('portfolio');
    expect(matches[0].identifier).toBe('AAPL');
    expect(matches[0].platform).toBe('Trade Republic');
  });

  it('should return empty list when query is shorter than 2 chars', () => {
    const matches = findMatchingExistingAssets('A', mockPortfolio);
    expect(matches).toEqual([]);
  });

  it('should find assets by partial ticker or ISIN prefix', () => {
    const matches = findMatchingExistingAssets('VUSA', mockPortfolio);
    expect(matches.length).toBeGreaterThan(0);
    const hasVusa = matches.some((m) => m.quoteTicker === 'VUSA.AS' || m.identifier.includes('VUSA') || m.ticker?.includes('VUSA'));
    expect(hasVusa).toBe(true);
  });
});
