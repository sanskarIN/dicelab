import { describe, expect, it } from 'vitest';
import { getMessages, messages, type SupportedLocale } from './index';

describe('message catalogs', () => {
  it('uses English as the default locale', () => {
    expect(messages).toBe(getMessages('en'));
    expect(messages.common.appName).toBe('DiceLab');
  });

  it('keeps English dynamic message helpers deterministic', () => {
    expect(messages.history.distinctTotals(3)).toBe('3 distinct totals');
    expect(messages.history.histogramTitle(7, 6, 16.666)).toBe('7: 6 rolls (16.7%)');
    expect(messages.probability.truncated(180, 240)).toBe(
      'Showing the first 180 of 240 totals to keep the interface responsive.',
    );
  });

  it('exposes the reviewed Hindi catalog through the locale boundary', () => {
    const locale: SupportedLocale = 'hi';
    const hindi = getMessages(locale);

    expect(hindi.settings.heading).toBe('सेटिंग्स');
    expect(hindi.navigation.history).toBe('इतिहास');
    expect(hindi.roll.roll).toBe('रोल करें');
  });

  it('keeps Hindi dynamic helpers callable with localized number formatting', () => {
    const hindi = getMessages('hi');

    expect(hindi.history.distinctTotals(3)).toBe('3 अलग कुल');
    expect(hindi.domainErrors.diceCountRange(1, 1000)).toBe('पासों की संख्या 1 से 1000 के बीच होनी चाहिए।');
    expect(hindi.history.histogramTitle(7, 6, 16.666)).toBe('7: 6 रोल (16.7%)');
  });
});
