import { describe, expect, it } from 'vitest';
import { getMessages, messages, type SupportedLocale } from './index';

describe('message catalogs', () => {
  it('uses English as the default locale', () => {
    expect(messages).toBe(getMessages('en'));
    expect(messages.common.appName).toBe('DiceLab');
  });

  it('keeps dynamic message helpers deterministic', () => {
    expect(messages.history.distinctTotals(3)).toBe('3 distinct totals');
    expect(messages.history.histogramTitle(7, 6, 16.666)).toBe('7: 6 rolls (16.7%)');
    expect(messages.probability.truncated(180, 240)).toBe(
      'Showing the first 180 of 240 totals to keep the interface responsive.',
    );
  });

  it('exposes only declared locale identifiers', () => {
    const locale: SupportedLocale = 'en';
    expect(getMessages(locale).settings.heading).toBe('Settings');
  });
});
