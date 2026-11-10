import { describe, it, expect } from 'vitest';
import { computeSwipeOffset } from './useSwipeGesture';

describe('useSwipeGesture - computeSwipeOffset calculation', () => {
  it('should return exact diffX when within maxDistance bounds', () => {
    expect(computeSwipeOffset(0, 110, 0.35)).toBe(0);
    expect(computeSwipeOffset(50, 110, 0.35)).toBe(50);
    expect(computeSwipeOffset(-60, 110, 0.35)).toBe(-60);
    expect(computeSwipeOffset(110, 110, 0.35)).toBe(110);
    expect(computeSwipeOffset(-110, 110, 0.35)).toBe(-110);
  });

  it('should apply elastic resistance when swiping right beyond maxDistance', () => {
    // 110 + (130 - 110) * 0.35 = 110 + 7 = 117
    const result = computeSwipeOffset(130, 110, 0.35);
    expect(result).toBeCloseTo(117, 2);

    // 110 + (210 - 110) * 0.35 = 110 + 35 = 145
    expect(computeSwipeOffset(210, 110, 0.35)).toBeCloseTo(145, 2);
  });

  it('should apply elastic resistance when swiping left beyond -maxDistance', () => {
    // -110 + (-130 + 110) * 0.35 = -110 - 7 = -117
    const result = computeSwipeOffset(-130, 110, 0.35);
    expect(result).toBeCloseTo(-117, 2);

    // -110 + (-210 + 110) * 0.35 = -110 - 35 = -145
    expect(computeSwipeOffset(-210, 110, 0.35)).toBeCloseTo(-145, 2);
  });
});
