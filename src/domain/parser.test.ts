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
});
