/**
 * investmentValidation.ts
 *
 * Strict runtime validation and calculation utilities for investment entries.
 * All functions are pure and deterministic for easy unit testing.
 */

// ---------------------------------------------------------------------------
// 1. Input Normalisation
// ---------------------------------------------------------------------------

/**
 * Normalise a user-typed numeric string:
 *   - Replaces comma decimal separators with dots (Spanish keyboards)
 *   - Strips leading/trailing whitespace
 *   - Returns the cleaned string (empty if null/undefined)
 */
export function normalizeDecimalInput(raw: string | null | undefined): string {
  if (raw == null) return '';
  return raw.toString().trim().replace(',', '.');
}

/**
 * Parse a user input string into a finite, positive number.
 * Returns `null` when the value is not a valid positive finite number.
 */
export function parsePositiveNumber(raw: string | null | undefined): number | null {
  const cleaned = normalizeDecimalInput(raw);
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0 || Number.isNaN(num)) return null;
  return num;
}

// ---------------------------------------------------------------------------
// 2. Share / Amount Calculations
// ---------------------------------------------------------------------------

/** Maximum fractional precision for share quantities (6 decimal places). */
const SHARE_PRECISION = 6;

/**
 * Calculate the number of shares from a total investment amount and a
 * unit price, rounding to SHARE_PRECISION decimal places.
 *
 * Returns `null` if either input is invalid (non-positive / non-finite).
 */
export function calculateSharesFromTotal(
  totalAmount: number,
  unitPrice: number
): number | null {
  if (
    !Number.isFinite(totalAmount) || totalAmount <= 0 ||
    !Number.isFinite(unitPrice) || unitPrice <= 0
  ) {
    return null;
  }
  const shares = totalAmount / unitPrice;
  return parseFloat(shares.toFixed(SHARE_PRECISION));
}

/**
 * Calculate the total investment amount from shares and a unit price.
 * Returns `null` if either input is invalid.
 */
export function calculateTotalFromShares(
  shares: number,
  unitPrice: number
): number | null {
  if (
    !Number.isFinite(shares) || shares <= 0 ||
    !Number.isFinite(unitPrice) || unitPrice <= 0
  ) {
    return null;
  }
  return parseFloat((shares * unitPrice).toFixed(2));
}

/**
 * Derive the average buy price from total amount and shares.
 * Returns `null` if either input is invalid.
 */
export function calculateAverageBuyPrice(
  totalAmount: number,
  shares: number
): number | null {
  if (
    !Number.isFinite(totalAmount) || totalAmount <= 0 ||
    !Number.isFinite(shares) || shares <= 0
  ) {
    return null;
  }
  return parseFloat((totalAmount / shares).toFixed(4));
}

// ---------------------------------------------------------------------------
// 3. Market Quote Validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the given price is a valid market quote:
 * a finite number strictly greater than zero.
 */
export function isValidMarketPrice(price: unknown): price is number {
  return (
    typeof price === 'number' &&
    Number.isFinite(price) &&
    !Number.isNaN(price) &&
    price > 0
  );
}

// ---------------------------------------------------------------------------
// 4. Full Investment Entry Validation
// ---------------------------------------------------------------------------

export interface InvestmentValidationResult {
  isValid: boolean;
  errors: string[];
  /** Normalised shares (> 0, finite) */
  shares: number | null;
  /** Normalised average buy price (> 0, finite) */
  averageBuyPrice: number | null;
  /** Normalised total invested (> 0, finite) */
  totalInvested: number | null;
  /** Normalised current market price (> 0, finite) */
  currentPrice: number | null;
}

/**
 * Validate the full set of investment entry fields.
 * Returns normalised numbers or a list of user-facing error messages.
 */
export function validateInvestmentEntry(fields: {
  identifier: string;
  assetName: string;
  sharesRaw: string;
  averageBuyPriceRaw: string;
  totalInvestedRaw: string;
  currentPriceRaw: string;
}): InvestmentValidationResult {
  const errors: string[] = [];

  if (!fields.identifier.trim()) errors.push('El identificador del activo es obligatorio.');
  if (!fields.assetName.trim()) errors.push('El nombre del activo es obligatorio.');

  const shares = parsePositiveNumber(fields.sharesRaw);
  if (shares === null) errors.push('La cantidad de títulos debe ser un número positivo.');

  const avgPrice = parsePositiveNumber(fields.averageBuyPriceRaw);
  if (avgPrice === null) errors.push('El precio medio de compra debe ser un número positivo.');

  const total = parsePositiveNumber(fields.totalInvestedRaw);
  // totalInvested is optional if shares+price are set; we only validate if provided
  if (fields.totalInvestedRaw.trim() && total === null) {
    errors.push('El importe total desembolsado no es un número válido.');
  }

  const curPrice = parsePositiveNumber(fields.currentPriceRaw);
  // currentPrice can be empty if quote fetch failed; we just note it

  return {
    isValid: errors.length === 0,
    errors,
    shares,
    averageBuyPrice: avgPrice,
    totalInvested: total,
    currentPrice: curPrice,
  };
}
