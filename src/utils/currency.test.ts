import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatAxisCurrency,
} from './currency';

describe('Utilidades de Formato Monetario y Ejes (currency.ts)', () => {
  it('formatea correctamente divisas estándar en euros (formatCurrency)', () => {
    const res = formatCurrency(1250.5);
    expect(res).toContain('1250,50');
    expect(res).toContain('€');
  });

  it('formatea divisas compactas (formatCompactCurrency)', () => {
    const compact = formatCompactCurrency(5000);
    expect(compact).toContain('€');
  });

  it('formatea porcentajes con signo explícito (formatPercentage)', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%');
    expect(formatPercentage(-3.1)).toBe('-3.10%');
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(5.25, false)).toBe('5.25%');
  });

  describe('Formateo Compacto para Ejes de Gráficos (formatAxisCurrency)', () => {
    it('formatea importes pequeños sin sufijos', () => {
      expect(formatAxisCurrency(0)).toBe('0€');
      expect(formatAxisCurrency(50)).toBe('50€');
      expect(formatAxisCurrency(850)).toBe('850€');
    });

    it('formatea miles en formato k€ con coma decimal cuando procede', () => {
      expect(formatAxisCurrency(1200)).toBe('1,2k€');
      expect(formatAxisCurrency(3500)).toBe('3,5k€');
      expect(formatAxisCurrency(10000)).toBe('10k€');
      expect(formatAxisCurrency(63850)).toBe('64k€');
      expect(formatAxisCurrency(125400)).toBe('125k€');
    });

    it('formatea millones en formato M€', () => {
      expect(formatAxisCurrency(1000000)).toBe('1M€');
      expect(formatAxisCurrency(2500000)).toBe('2,5M€');
    });

    it('gestiona importes negativos conservando el signo', () => {
      expect(formatAxisCurrency(-500)).toBe('-500€');
      expect(formatAxisCurrency(-1200)).toBe('-1,2k€');
      expect(formatAxisCurrency(-15000)).toBe('-15k€');
    });

    it('resiste valores no válidos o NaN retornando 0€', () => {
      expect(formatAxisCurrency(NaN)).toBe('0€');
      expect(formatAxisCurrency(undefined as any)).toBe('0€');
    });
  });
});
