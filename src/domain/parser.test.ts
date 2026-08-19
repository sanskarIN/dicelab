import { describe, expect, it } from 'vitest';
import { DiceExpressionError, parseDiceExpression } from './parser';

describe('parseDiceExpression', () => {
  it('normalizes standard expressions', () => {
    expect(parseDiceExpression(' 2d6 + 3 ')).toMatchObject({
      count: 2,
      sides: 6,
      modifier: 3,
      normalized: '2d6+3',
    });
  });

  it('supports omitted count and custom sides', () => {
    expect(parseDiceExpression('d37').normalized).toBe('1d37');
  });

  it('parses keep and drop operations', () => {
    expect(parseDiceExpression('4d6kh3').selection).toEqual({ kind: 'keep-highest', count: 3 });
    expect(parseDiceExpression('5d10dl2').selection).toEqual({ kind: 'drop-lowest', count: 2 });
  });

  it.each(['0d6', '1001d6', '1d1', '2d6kh3', '2d6dl2', 'dice'])('rejects invalid expression %s', (expression) => {
    expect(() => parseDiceExpression(expression)).toThrow(DiceExpressionError);
  });

  it('keeps generated normalized expressions idempotent', () => {
    const selectionCodes = ['kh', 'kl', 'dh', 'dl'] as const;
    for (let sample = 1; sample <= 500; sample += 1) {
      const count = (sample % 30) + 1;
      const sides = ((sample * 17) % 99) + 2;
      const modifier = ((sample * 7919) % 2001) - 1000;
      const code = selectionCodes[sample % selectionCodes.length];
      const isKeep = code === 'kh' || code === 'kl';
      const maxSelection = isKeep ? count : Math.max(0, count - 1);
      const selectionCount = maxSelection === 0 ? 0 : (sample % maxSelection) + 1;
      const selection = selectionCount ? `${code}${selectionCount}` : '';
      const modifierText = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`;
      const input = `${count}d${sides}${selection}${modifierText}`;

      const first = parseDiceExpression(input);
      const second = parseDiceExpression(first.normalized);
      expect(second).toEqual(first);
    }
  });

  it('normalizes case and modifier whitespace without changing meaning', () => {
    const variants = ['4D6KH3 + 2', '4d6kh3+2', '  4d6Kh3 +   2  '];
    const parsed = variants.map((variant) => parseDiceExpression(variant));
    expect(parsed.map((item) => item.normalized)).toEqual(['4d6kh3+2', '4d6kh3+2', '4d6kh3+2']);
    expect(parsed[1]).toEqual(parsed[0]);
    expect(parsed[2]).toEqual(parsed[0]);
  });
});
