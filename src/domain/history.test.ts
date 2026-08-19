import { describe, expect, it } from 'vitest';
import type { RollResult } from './types';
import { filterRollHistory } from './history';

const history: RollResult[] = [
  roll('a', '1d20', 17),
  roll('b', '4d6kh3', 13),
  roll('c', '2d20kl1', 4),
];

describe('filterRollHistory', () => {
  it('returns a copy for an empty or whitespace-only query', () => {
    const filtered = filterRollHistory(history, '   ');
    expect(filtered).toEqual(history);
    expect(filtered).not.toBe(history);
  });

  it('matches expressions case-insensitively', () => {
    expect(filterRollHistory(history, 'KH3')).toEqual([history[1]]);
  });

  it('matches textual total fragments', () => {
    expect(filterRollHistory(history, '1')).toEqual([history[0], history[1]]);
    expect(filterRollHistory(history, '17')).toEqual([history[0]]);
  });

  it('trims query whitespace and preserves history order', () => {
    expect(filterRollHistory(history, '  d20  ')).toEqual([history[0], history[2]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterRollHistory(history, 'not-present')).toEqual([]);
  });
});

function roll(id: string, expression: string, total: number): RollResult {
  return {
    id,
    expression,
    total,
    dice: [{ value: Math.max(1, Math.min(total, 20)), kept: true, index: 0 }],
    modifier: 0,
    mode: 'secure',
    rolledAt: '2026-08-19T00:00:00.000Z',
  };
}
