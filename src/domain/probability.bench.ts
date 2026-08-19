import { bench, describe } from 'vitest';
import { calculateProbability } from './probability';

describe('probability calculator', () => {
  bench('ordinary 2d6 distribution', () => {
    calculateProbability('2d6');
  });

  bench('ordinary 10d6 dynamic-programming distribution', () => {
    calculateProbability('10d6+5');
  });

  bench('4d6 keep-highest-three exact enumeration', () => {
    calculateProbability('4d6kh3');
  });

  bench('2d20 advantage exact enumeration', () => {
    calculateProbability('2d20kh1');
  });
});
