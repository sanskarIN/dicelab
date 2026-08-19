import { bench, describe } from 'vitest';
import { filterRollHistory } from './history';
import type { RollResult } from './types';

const history: RollResult[] = Array.from({ length: 5_000 }, (_, index) => {
  const expression = index % 5 === 0 ? '4d6kh3' : index % 2 === 0 ? '2d20kh1' : '1d20';
  const total = (index % 20) + 1;
  return {
    id: `history-bench-${index}`,
    expression,
    total,
    dice: [{ value: total, kept: true, index: 0 }],
    modifier: 0,
    mode: 'secure',
    rolledAt: '2026-08-19T00:00:00.000Z',
  };
});

describe('history filtering', () => {
  bench('filter 5,000 rolls by expression', () => {
    filterRollHistory(history, 'kh1');
  });

  bench('filter 5,000 rolls by total', () => {
    filterRollHistory(history, '17');
  });

  bench('copy unfiltered 5,000 roll history', () => {
    filterRollHistory(history, '');
  });
});
