import { describe, expect, it } from 'vitest';
import { calculateProbability, ProbabilityComplexityError } from './probability';

describe('calculateProbability', () => {
  it('calculates the classic 2d6 distribution', () => {
    const distribution = calculateProbability('2d6');
    expect(distribution.minimum).toBe(2);
    expect(distribution.maximum).toBe(12);
    expect(distribution.expectedValue).toBeCloseTo(7, 10);
    expect(distribution.points.find((point) => point.total === 7)?.probability).toBeCloseTo(6 / 36, 10);
  });

  it('preserves exact integer ways at the supported numeric boundary', () => {
    const distribution = calculateProbability('20d6');
    const countedOutcomes = distribution.points.reduce((sum, point) => sum + point.ways, 0);
    expect(distribution.totalOutcomes).toBe(3_656_158_440_062_976);
    expect(countedOutcomes).toBe(distribution.totalOutcomes);
    expect(distribution.expectedValue).toBeCloseTo(70, 10);
  });

  it('uses a stable code when exact integer counts would exceed safe precision', () => {
    try {
      calculateProbability('21d6');
      throw new Error('expected probability calculation to reject unsafe outcome count');
    } catch (cause) {
      expect(cause).toBeInstanceOf(ProbabilityComplexityError);
      expect((cause as ProbabilityComplexityError).code).toBe('unsafe-outcome-count');
      expect((cause as ProbabilityComplexityError).context.limit).toBe(Number.MAX_SAFE_INTEGER);
    }
  });

  it('enumerates manageable keep-highest expressions exactly', () => {
    const distribution = calculateProbability('2d20kh1');
    expect(distribution.totalOutcomes).toBe(400);
    expect(distribution.minimum).toBe(1);
    expect(distribution.maximum).toBe(20);
    expect(distribution.points.find((point) => point.total === 20)?.probability).toBeCloseTo(39 / 400, 10);
  });

  it('supports the common 4d6 keep-highest-three distribution', () => {
    const distribution = calculateProbability('4d6kh3');
    expect(distribution.totalOutcomes).toBe(1296);
    expect(distribution.minimum).toBe(3);
    expect(distribution.maximum).toBe(18);
  });

  it('uses a stable code for intractable keep/drop enumeration', () => {
    try {
      calculateProbability('20d20kh10');
      throw new Error('expected probability calculation to reject complex keep/drop expression');
    } catch (cause) {
      expect(cause).toBeInstanceOf(ProbabilityComplexityError);
      expect((cause as ProbabilityComplexityError).code).toBe('keep-drop-too-complex');
      expect((cause as ProbabilityComplexityError).context.limit).toBe(2_000_000);
    }
  });
});
