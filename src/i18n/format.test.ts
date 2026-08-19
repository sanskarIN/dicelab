import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from './index';
import { formatDecimal, formatFixedDecimal, formatInteger, getIntlLocale } from './format';

afterEach(() => setLocale('en'));

describe('locale-aware formatting', () => {
  it('maps supported DiceLab locales to explicit Intl locales', () => {
    expect(getIntlLocale('en')).toBe('en-US');
    expect(getIntlLocale('hi')).toBe('hi-IN');
  });

  it('uses the active locale for integer grouping', () => {
    setLocale('en');
    expect(formatInteger(123456)).toBe('123,456');

    setLocale('hi');
    expect(formatInteger(123456)).toBe('1,23,456');
  });

  it('formats bounded decimals without depending on global browser locale', () => {
    expect(formatDecimal(12.34567, 2, 'en')).toBe('12.35');
    expect(formatFixedDecimal(12.5, 3, 'en')).toBe('12.500');
  });
});
