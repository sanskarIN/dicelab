import { describe, expect, it } from 'vitest';
import { rollExpression } from './engine';
import { SeededRandomSource, type RandomSource } from './random';

class QueueRandom implements RandomSource {
  constructor(private readonly values: number[]) {}

  nextInt(maxExclusive: number): number {
    const next = this.values.shift();
    if (next === undefined || next < 0 || next >= maxExclusive) throw new Error('Invalid queued random value.');
    return next;
  }
}

describe('dice engine', () => {
  it('keeps the highest requested dice and applies a modifier', () => {
    const result = rollExpression('4d6kh3+2', {
      random: new QueueRandom([0, 5, 3, 1]),
      mode: 'seeded',
      seed: 'test',
      id: 'roll-1',
      now: new Date('2026-08-19T00:00:00.000Z'),
    });

    expect(result.total).toBe(14);
    expect(result.dice.map((die) => [die.value, die.kept])).toEqual([
      [1, false],
      [6, true],
      [4, true],
      [2, true],
    ]);
  });

  it('produces reproducible seeded sequences', () => {
    const first = new SeededRandomSource('same-seed');
    const second = new SeededRandomSource('same-seed');
    expect(Array.from({ length: 20 }, () => first.nextInt(100))).toEqual(
      Array.from({ length: 20 }, () => second.nextInt(100)),
    );
  });

  it('keeps generated values within the requested range', () => {
    const random = new SeededRandomSource('range-check');
    const values = Array.from({ length: 1_000 }, () => random.nextInt(37));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(37);
  });
});
