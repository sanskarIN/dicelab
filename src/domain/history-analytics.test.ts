import { describe, expect, it } from 'vitest';
import type { RollResult } from './types';
import { summarizeHistoryByExpression } from './history-analytics';

function roll(id: string, expression: string, total: number, rolledAt: string): RollResult {
  return {
    id,
    expression,
    total,
    dice: [{ value: Math.max(1, total), kept: true, index: 0 }],
    modifier: 0,
    mode: 'seeded',
    seed: `history-analytics:${id}`,
    rolledAt,
  };
}

describe('history expression analytics', () => {
  it('groups rolls and calculates count, share, mean, range, and latest timestamp', () => {
    const summaries = summarizeHistoryByExpression([
      roll('a', '1d20', 8, '2026-08-24T08:00:00.000Z'),
      roll('b', '2d6', 7, '2026-08-24T08:01:00.000Z'),
      roll('c', '1d20', 18, '2026-08-24T08:02:00.000Z'),
      roll('d', '1d20', 4, '2026-08-24T08:03:00.000Z'),
    ]);

    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toEqual({
      expression: '1d20',
      count: 3,
      percentage: 75,
      mean: 10,
      minimum: 4,
      maximum: 18,
      lastRolledAt: '2026-08-24T08:03:00.000Z',
    });
    expect(summaries[1]).toMatchObject({ expression: '2d6', count: 1, percentage: 25, mean: 7 });
  });

  it('sorts equal-count groups by most recent roll then expression', () => {
    const summaries = summarizeHistoryByExpression([
      roll('a', '1d8', 3, '2026-08-24T08:00:00.000Z'),
      roll('b', '1d6', 4, '2026-08-24T08:02:00.000Z'),
      roll('c', '1d10', 5, '2026-08-24T08:02:00.000Z'),
    ]);

    expect(summaries.map((item) => item.expression)).toEqual(['1d10', '1d6', '1d8']);
  });

  it('returns an empty result for empty history', () => {
    expect(summarizeHistoryByExpression([])).toEqual([]);
  });
});
