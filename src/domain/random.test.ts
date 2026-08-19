import { describe, expect, it } from 'vitest';
import { SeededRandomSource, hashSeed } from './random';

describe('SeededRandomSource', () => {
  it('replays the same sequence for the same seed', () => {
    const first = new SeededRandomSource('dicelab-seed');
    const second = new SeededRandomSource('dicelab-seed');
    const firstSequence = Array.from({ length: 12 }, () => first.nextInt(100));
    const secondSequence = Array.from({ length: 12 }, () => second.nextInt(100));
    expect(firstSequence).toEqual(secondSequence);
  });

  it('stays within the requested exclusive upper bound', () => {
    const source = new SeededRandomSource('bounds');
    const values = Array.from({ length: 500 }, () => source.nextInt(6));
    expect(values.every((value) => Number.isInteger(value) && value >= 0 && value < 6)).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid maxExclusive %s', (value) => {
    expect(() => new SeededRandomSource('invalid').nextInt(value)).toThrow(RangeError);
  });
});

describe('hashSeed', () => {
  it('is deterministic and sensitive to seed text', () => {
    expect(hashSeed('alpha')).toBe(hashSeed('alpha'));
    expect(hashSeed('alpha')).not.toBe(hashSeed('beta'));
  });

  it('supports unicode seed input', () => {
    expect(Number.isSafeInteger(hashSeed('DiceLab 🎲'))).toBe(true);
  });
});
