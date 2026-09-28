import { describe, it, expect } from 'vitest';
import {
  normalizeDecimalInput,
  parsePositiveNumber,
  calculateSharesFromTotal,
  calculateTotalFromShares,
  calculateAverageBuyPrice,
  isValidMarketPrice,
  validateInvestmentEntry,
} from './investmentValidation';

// ---------------------------------------------------------------------------
// normalizeDecimalInput
// ---------------------------------------------------------------------------
describe('normalizeDecimalInput', () => {
  it('converts comma to dot for Spanish keyboards', () => {
    expect(normalizeDecimalInput('12,50')).toBe('12.50');
  });

  it('trims whitespace', () => {
    expect(normalizeDecimalInput('  100.25  ')).toBe('100.25');
  });

  it('returns empty string for null / undefined', () => {
    expect(normalizeDecimalInput(null)).toBe('');
    expect(normalizeDecimalInput(undefined)).toBe('');
  });

  it('handles integer strings without modification', () => {
    expect(normalizeDecimalInput('500')).toBe('500');
  });
});

// ---------------------------------------------------------------------------
// parsePositiveNumber
// ---------------------------------------------------------------------------
describe('parsePositiveNumber', () => {
  it('parses valid decimal strings', () => {
    expect(parsePositiveNumber('124.50')).toBe(124.5);
  });

  it('normalizes comma separators before parsing', () => {
    expect(parsePositiveNumber('99,99')).toBe(99.99);
  });

  it('returns null for zero', () => {
    expect(parsePositiveNumber('0')).toBeNull();
  });

  it('returns null for negative numbers', () => {
    expect(parsePositiveNumber('-10')).toBeNull();
  });

  it('returns null for NaN / Infinity / empty', () => {
    expect(parsePositiveNumber('abc')).toBeNull();
    expect(parsePositiveNumber('Infinity')).toBeNull();
    expect(parsePositiveNumber('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateSharesFromTotal
// ---------------------------------------------------------------------------
describe('calculateSharesFromTotal', () => {
  it('calculates fractional shares from amount and price', () => {
    const shares = calculateSharesFromTotal(500, 485.2);
    expect(shares).not.toBeNull();
    // 500 / 485.2 ≈ 1.030503
    expect(shares).toBeCloseTo(1.030503, 5);
  });

  it('handles whole number results', () => {
    expect(calculateSharesFromTotal(1000, 100)).toBe(10);
  });

  it('rounds to 6 decimal places', () => {
    const result = calculateSharesFromTotal(100, 3);
    // 100 / 3 = 33.333333...
    expect(result).toBe(33.333333);
  });

  it('returns null when totalAmount is <= 0', () => {
    expect(calculateSharesFromTotal(0, 100)).toBeNull();
    expect(calculateSharesFromTotal(-50, 100)).toBeNull();
  });

  it('returns null when unitPrice is <= 0', () => {
    expect(calculateSharesFromTotal(500, 0)).toBeNull();
    expect(calculateSharesFromTotal(500, -10)).toBeNull();
  });

  it('returns null for NaN / Infinity inputs', () => {
    expect(calculateSharesFromTotal(NaN, 100)).toBeNull();
    expect(calculateSharesFromTotal(500, Infinity)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateTotalFromShares
// ---------------------------------------------------------------------------
describe('calculateTotalFromShares', () => {
  it('calculates total from shares and price', () => {
    expect(calculateTotalFromShares(10, 50)).toBe(500);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateTotalFromShares(3, 33.333)).toBe(100);
  });

  it('returns null for invalid inputs', () => {
    expect(calculateTotalFromShares(0, 50)).toBeNull();
    expect(calculateTotalFromShares(10, -5)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateAverageBuyPrice
// ---------------------------------------------------------------------------
describe('calculateAverageBuyPrice', () => {
  it('derives average price from total and shares', () => {
    expect(calculateAverageBuyPrice(1000, 10)).toBe(100);
  });

  it('rounds to 4 decimal places', () => {
    const result = calculateAverageBuyPrice(100, 3);
    // 100 / 3 ≈ 33.3333
    expect(result).toBe(33.3333);
  });

  it('returns null for invalid inputs', () => {
    expect(calculateAverageBuyPrice(0, 10)).toBeNull();
    expect(calculateAverageBuyPrice(1000, 0)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isValidMarketPrice
// ---------------------------------------------------------------------------
describe('isValidMarketPrice', () => {
  it('accepts positive finite numbers', () => {
    expect(isValidMarketPrice(485.2)).toBe(true);
    expect(isValidMarketPrice(0.0001)).toBe(true);
  });

  it('rejects zero', () => {
    expect(isValidMarketPrice(0)).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isValidMarketPrice(-42)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidMarketPrice(NaN)).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(isValidMarketPrice(Infinity)).toBe(false);
    expect(isValidMarketPrice(-Infinity)).toBe(false);
  });

  it('rejects null / undefined / strings', () => {
    expect(isValidMarketPrice(null)).toBe(false);
    expect(isValidMarketPrice(undefined)).toBe(false);
    expect(isValidMarketPrice('485.2')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateInvestmentEntry (integration)
// ---------------------------------------------------------------------------
describe('validateInvestmentEntry', () => {
  it('validates a fully correct entry', () => {
    const result = validateInvestmentEntry({
      identifier: 'VUSA',
      assetName: 'Vanguard S&P 500',
      sharesRaw: '10',
      averageBuyPriceRaw: '50',
      totalInvestedRaw: '500',
      currentPriceRaw: '55',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.shares).toBe(10);
    expect(result.averageBuyPrice).toBe(50);
  });

  it('rejects missing identifier', () => {
    const result = validateInvestmentEntry({
      identifier: '',
      assetName: 'Apple',
      sharesRaw: '2',
      averageBuyPriceRaw: '150',
      totalInvestedRaw: '',
      currentPriceRaw: '170',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('identificador'))).toBe(true);
  });

  it('rejects negative shares', () => {
    const result = validateInvestmentEntry({
      identifier: 'AAPL',
      assetName: 'Apple',
      sharesRaw: '-5',
      averageBuyPriceRaw: '150',
      totalInvestedRaw: '',
      currentPriceRaw: '170',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('títulos'))).toBe(true);
  });

  it('normalises comma decimals in shares', () => {
    const result = validateInvestmentEntry({
      identifier: 'BTC',
      assetName: 'Bitcoin',
      sharesRaw: '0,045',
      averageBuyPriceRaw: '60000',
      totalInvestedRaw: '',
      currentPriceRaw: '62000',
    });
    expect(result.isValid).toBe(true);
    expect(result.shares).toBeCloseTo(0.045, 4);
  });
});
