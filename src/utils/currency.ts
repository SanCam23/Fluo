/**
 * Formatting utilities for Fluo Finance
 */

export function formatCurrency(amount: number, currency: 'EUR' | 'USD' = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: 'EUR' | 'USD' = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatPercentage(value: number, includeSign: boolean = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Compact financial notation for chart Y-axes (e.g. 500€, 1,2k€, 64k€, 1M€).
 * Prevents text overflow clipping on narrow mobile screens while maintaining high legibility.
 */
export function formatAxisCurrency(amount: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '0€';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',')}M€`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1).replace(/\.0$/, '').replace('.', ',')}k€`;
  }
  return `${sign}${Math.round(abs)}€`;
}
