import { describe, expect, it } from 'vitest';
import type { RollResult } from './types';
import { summarizeRolls } from './statistics';

function roll(total: number, id: string): RollResult {
  return {
    id,
    expression: '1d20',
    total,
    dice: [{ value: total, kept: true, index: 0 }],
    modifier: 0,
    mode: 'secure',
    rolledAt: '2026-08-19T00:00:00.000Z',
  };
}

describe('summarizeRolls', () => {
  it('returns explicit empty-state statistics', () => {
    expect(summarizeRolls([])).toEqual({
      count: 0,
      minimum: null,
      maximum: null,
      mean: null,
      median: null,
      frequencies: [],
    });
  });

  it('computes min, max, mean, and odd median without mutating history order', () => {
    const history = [roll(20, 'high'), roll(1, 'low'), roll(9, 'middle')];
    const summary = summarizeRolls(history);

    expect(summary).toMatchObject({ count: 3, minimum: 1, maximum: 20, mean: 10, median: 9 });
    expect(history.map((entry) => entry.id)).toEqual(['high', 'low', 'middle']);
  });

  it('averages the two middle values for an even-sized history', () => {
    expect(summarizeRolls([roll(2, 'a'), roll(4, 'b'), roll(8, 'c'), roll(10, 'd')]).median).toBe(6);
  });

  it('reports sorted frequencies and percentages', () => {
    const frequencies = summarizeRolls([roll(6, 'a'), roll(2, 'b'), roll(6, 'c'), roll(2, 'd')]).frequencies;
    expect(frequencies).toEqual([
      { total: 2, count: 2, percentage: 50 },
      { total: 6, count: 2, percentage: 50 },
    ]);
  });
});
