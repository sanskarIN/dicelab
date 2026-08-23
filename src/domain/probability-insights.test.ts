import { describe, expect, it } from 'vitest';
import { calculateProbability } from './probability';
import {
  getQuantileTotal,
  getThresholdProbabilities,
  summarizeProbabilityDistribution,
} from './probability-insights';

describe('probability insights', () => {
  it('summarizes the exact 2d6 distribution', () => {
    const distribution = calculateProbability('2d6');
    const insights = summarizeProbabilityDistribution(distribution);

    expect(insights.median).toBe(7);
    expect(insights.modes).toEqual([7]);
    expect(insights.variance).toBeCloseTo(35 / 6, 12);
    expect(insights.standardDeviation).toBeCloseTo(Math.sqrt(35 / 6), 12);
  });

  it('preserves tied modes for a uniform die', () => {
    const insights = summarizeProbabilityDistribution(calculateProbability('1d6'));
    expect(insights.modes).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('calculates exact threshold probabilities', () => {
    const probabilities = getThresholdProbabilities(calculateProbability('2d6'), 7);

    expect(probabilities.exactly).toBeCloseTo(6 / 36, 12);
    expect(probabilities.atMost).toBeCloseTo(21 / 36, 12);
    expect(probabilities.atLeast).toBeCloseTo(21 / 36, 12);
  });

  it('handles thresholds outside the distribution range', () => {
    const distribution = calculateProbability('1d6');

    expect(getThresholdProbabilities(distribution, 0)).toEqual({ exactly: 0, atMost: 0, atLeast: 1 });
    expect(getThresholdProbabilities(distribution, 7)).toEqual({ exactly: 0, atMost: 1, atLeast: 0 });
  });

  it('returns lower exact quantiles from ordered totals', () => {
    const distribution = calculateProbability('2d6');

    expect(getQuantileTotal(distribution, 0)).toBe(2);
    expect(getQuantileTotal(distribution, 0.25)).toBe(5);
    expect(getQuantileTotal(distribution, 0.5)).toBe(7);
    expect(getQuantileTotal(distribution, 0.75)).toBe(9);
    expect(getQuantileTotal(distribution, 1)).toBe(12);
  });

  it('rejects invalid quantiles', () => {
    const distribution = calculateProbability('1d6');

    expect(() => getQuantileTotal(distribution, -0.01)).toThrow(RangeError);
    expect(() => getQuantileTotal(distribution, 1.01)).toThrow(RangeError);
    expect(() => getQuantileTotal(distribution, Number.NaN)).toThrow(RangeError);
  });
});
