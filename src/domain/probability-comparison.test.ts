import { describe, expect, it } from 'vitest';
import { calculateProbability } from './probability';
import { compareProbabilityDistributions } from './probability-comparison';

describe('probability distribution comparison', () => {
  it('is symmetric for identical distributions', () => {
    const distribution = calculateProbability('1d20');
    const comparison = compareProbabilityDistributions(distribution, distribution);

    expect(comparison.leftHigher).toBeCloseTo(0.475, 12);
    expect(comparison.tie).toBeCloseTo(0.05, 12);
    expect(comparison.rightHigher).toBeCloseTo(0.475, 12);
    expect(comparison.expectedDelta).toBeCloseTo(0, 12);
  });

  it('compares differently sized uniform dice', () => {
    const comparison = compareProbabilityDistributions(
      calculateProbability('1d6'),
      calculateProbability('1d4'),
    );

    expect(comparison.leftHigher).toBeCloseTo(7 / 12, 12);
    expect(comparison.tie).toBeCloseTo(1 / 6, 12);
    expect(comparison.rightHigher).toBeCloseTo(1 / 4, 12);
    expect(comparison.expectedDelta).toBeCloseTo(1, 12);
  });

  it('handles non-overlapping distributions without floating artifacts', () => {
    const comparison = compareProbabilityDistributions(
      calculateProbability('1d6+20'),
      calculateProbability('1d6'),
    );

    expect(comparison.leftHigher).toBe(1);
    expect(comparison.tie).toBe(0);
    expect(comparison.rightHigher).toBe(0);
  });

  it('preserves normalized comparison probability', () => {
    const comparison = compareProbabilityDistributions(
      calculateProbability('4d6kh3'),
      calculateProbability('3d6'),
    );

    expect(comparison.leftHigher + comparison.tie + comparison.rightHigher).toBeCloseTo(1, 12);
  });
});
