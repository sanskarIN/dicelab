import { bench, describe } from 'vitest';
import type { RollResult } from './types';
import { summarizeRolls } from './statistics';

const history: RollResult[] = Array.from({ length: 5_000 }, (_, index) => {
  const total = (index % 20) + 1;
  return {
    id: `bench-${index}`,
    expression: '1d20',
    total,
    dice: [{ value: total, kept: true, index: 0 }],
    modifier: 0,
    mode: 'seeded',
    seed: `benchmark:${index}`,
    rolledAt: '2026-08-19T00:00:00.000Z',
  };
});

describe('roll statistics', () => {
  bench('summarize 5,000 retained rolls', () => {
    summarizeRolls(history);
  });
});
