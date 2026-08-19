import { bench, describe } from 'vitest';
import { parseDiceExpression } from './parser';

const expressions = [
  '1d20',
  '2d6+3',
  '4d6kh3',
  '2d20kl1',
  '6d10dh2-1',
  '100d100+250',
  '12d8dl3+17',
];

describe('dice expression parser', () => {
  bench('parse representative expression set', () => {
    for (const expression of expressions) parseDiceExpression(expression);
  });

  bench('parse normalized keep/drop expression', () => {
    parseDiceExpression('20d20kh10+25');
  });
});
