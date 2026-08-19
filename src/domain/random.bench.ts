import { bench, describe } from 'vitest';
import { SecureRandomSource, SeededRandomSource } from './random';

const SAMPLE_SIZE = 1_000;

describe('random sources', () => {
  bench('generate 1,000 seeded d20 values', () => {
    const source = new SeededRandomSource('benchmark-seed');
    for (let index = 0; index < SAMPLE_SIZE; index += 1) source.nextInt(20);
  });

  bench('generate 1,000 secure d20 values', () => {
    const source = new SecureRandomSource();
    for (let index = 0; index < SAMPLE_SIZE; index += 1) source.nextInt(20);
  });
});
