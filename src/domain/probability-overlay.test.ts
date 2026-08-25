import { describe, expect, it } from 'vitest';
import { calculateProbability } from './probability';
import { alignProbabilityDistributions } from './probability-overlay';

describe('alignProbabilityDistributions', () => {
  it('aligns the union of totals and preserves exact per-total probabilities', () => {
    const overlay = alignProbabilityDistributions(calculateProbability('1d4'), calculateProbability('1d2'));

    expect(overlay.points).toEqual([
      { total: 1, leftProbability: 0.25, rightProbability: 0.5, probabilityDelta: -0.25 },
      { total: 2, leftProbability: 0.25, rightProbability: 0.5, probabilityDelta: -0.25 },
      { total: 3, leftProbability: 0.25, rightProbability: 0, probabilityDelta: 0.25 },
      { total: 4, leftProbability: 0.25, rightProbability: 0, probabilityDelta: 0.25 },
    ]);
    expect(overlay.maximumProbability).toBe(0.5);
    expect(overlay.maximumAbsoluteDelta).toBe(0.25);
  });

  it('reports zero deltas for identical distributions', () => {
    const distribution = calculateProbability('2d6');
    const overlay = alignProbabilityDistributions(distribution, distribution);

    expect(overlay.points).toHaveLength(distribution.points.length);
    expect(overlay.points.every((point) => point.probabilityDelta === 0)).toBe(true);
    expect(overlay.maximumProbability).toBeCloseTo(1 / 6);
    expect(overlay.maximumAbsoluteDelta).toBe(0);
  });

  it('keeps non-overlapping shifted totals instead of dropping either side', () => {
    const overlay = alignProbabilityDistributions(calculateProbability('1d2'), calculateProbability('1d2+10'));

    expect(overlay.points.map((point) => point.total)).toEqual([1, 2, 11, 12]);
    expect(overlay.points[0]).toMatchObject({ leftProbability: 0.5, rightProbability: 0 });
    expect(overlay.points[3]).toMatchObject({ leftProbability: 0, rightProbability: 0.5 });
  });
});
