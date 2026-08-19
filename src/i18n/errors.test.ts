import { describe, expect, it } from 'vitest';
import { parseDiceExpression } from '../domain/parser';
import { calculateProbability } from '../domain/probability';
import { DEFAULT_SETTINGS } from '../domain/types';
import { parseBackupJson } from '../services/export';
import { formatBackupError, formatDomainError } from './errors';

describe('formatDomainError', () => {
  it.each([
    ['not-dice', 'Use an expression such as 2d6+3, 4d6kh3, or 1d20.'],
    ['0d6', 'Dice count must be between 1 and 1000.'],
    ['1d1', 'Sides must be between 2 and 1,000,000.'],
    ['2d6kh3', 'Keep count cannot exceed the number of dice.'],
    ['2d6dl2', 'Drop count must leave at least one die.'],
  ])('maps parser errors for %s', (expression, expected) => {
    let cause: unknown;
    try {
      parseDiceExpression(expression);
    } catch (error) {
      cause = error;
    }
    expect(formatDomainError(cause, 'fallback')).toBe(expected);
  });

  it('maps probability complexity errors without relying on exception prose', () => {
    let cause: unknown;
    try {
      calculateProbability('20d20kh10');
    } catch (error) {
      cause = error;
    }
    expect(formatDomainError(cause, 'fallback')).toBe(
      'Exact keep/drop calculation is limited to 2,000,000 raw outcomes.',
    );
  });

  it('returns the supplied localized fallback for unknown errors', () => {
    expect(formatDomainError(new Error('implementation detail'), 'Localized fallback')).toBe('Localized fallback');
    expect(formatDomainError('native rejection', 'Localized fallback')).toBe('Localized fallback');
  });
});

describe('formatBackupError', () => {
  it.each([
    ['not-json', 'Backup is not valid JSON.'],
    ['null', 'Backup root must be an object.'],
    [
      JSON.stringify({ schemaVersion: 99, history: [], presets: [], settings: DEFAULT_SETTINGS }),
      'Unsupported DiceLab backup schema version.',
    ],
  ])('maps backup validation failures without relying on exception prose', (contents, expected) => {
    let cause: unknown;
    try {
      parseBackupJson(contents);
    } catch (error) {
      cause = error;
    }
    expect(formatBackupError(cause, 'fallback')).toBe(expected);
  });

  it('returns the supplied localized fallback for non-backup failures', () => {
    expect(formatBackupError(new Error('implementation detail'), 'Localized backup fallback')).toBe(
      'Localized backup fallback',
    );
  });
});
