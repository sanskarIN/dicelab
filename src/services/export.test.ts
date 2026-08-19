import { describe, expect, it } from 'vitest';
import type { RollResult } from '../domain/types';
import { historyToCsv, historyToJson } from './export';

const roll: RollResult = {
  id: 'roll-1',
  expression: '2d6+1',
  total: 9,
  dice: [
    { value: 3, kept: true, index: 0 },
    { value: 5, kept: true, index: 1 },
  ],
  modifier: 1,
  mode: 'seeded',
  seed: 'example,seed',
  rolledAt: '2026-08-19T00:00:00.000Z',
};

describe('history exports', () => {
  it('serializes valid JSON with a trailing newline', () => {
    const output = historyToJson([roll]);
    expect(output.endsWith('\n')).toBe(true);
    expect(JSON.parse(output)).toEqual([roll]);
  });

  it('escapes CSV cells containing commas', () => {
    const output = historyToCsv([roll]);
    expect(output).toContain('"example,seed"');
    expect(output.split('\n')[0]).toBe('id,rolled_at,expression,total,modifier,mode,seed,dice');
  });

  it('neutralizes spreadsheet formulas in user-controlled seed cells', () => {
    const output = historyToCsv([{ ...roll, seed: '=HYPERLINK("https://invalid.example")' }]);
    expect(output).toContain('"\'=HYPERLINK(""https://invalid.example"")"');
  });
});
