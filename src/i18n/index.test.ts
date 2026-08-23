import { afterEach, describe, expect, it } from 'vitest';
import { getActiveLocale, getMessages, messages, setLocale, type SupportedLocale } from './index';

afterEach(() => {
  setLocale('en');
});

describe('message catalogs', () => {
  it('uses English as the default locale', () => {
    expect(getActiveLocale()).toBe('en');
    expect(messages).toBe(getMessages('en'));
    expect(messages.common.appName).toBe('DiceLab');
  });

  it('keeps English dynamic message helpers deterministic', () => {
    expect(messages.history.distinctTotals(3)).toBe('3 distinct totals');
    expect(messages.history.histogramTitle(7, 6, 16.666)).toBe('7: 6 rolls (16.7%)');
    expect(messages.probability.truncated(180, 240)).toBe(
      'Showing the first 180 of 240 totals to keep the interface responsive.',
    );
    expect(messages.roll.presetImportSuccess(1)).toBe('Imported 1 preset.');
    expect(messages.roll.presetImportSuccess(3)).toBe('Imported 3 presets.');
    expect(messages.settings.manualUpdates('DiceLab')).toContain('automatic updates are not enabled');
  });

  it('exposes the reviewed Hindi catalog through the locale boundary', () => {
    const locale: SupportedLocale = 'hi';
    const hindi = getMessages(locale);

    expect(hindi.settings.heading).toBe('सेटिंग्स');
    expect(hindi.navigation.history).toBe('इतिहास');
    expect(hindi.roll.roll).toBe('रोल करें');
    expect(hindi.roll.exportPresets).toBe('प्रीसेट निर्यात करें');
    expect(hindi.settings.installedVersion).toBe('इंस्टॉल किया गया संस्करण');
  });

  it('keeps Hindi dynamic helpers callable with localized number formatting', () => {
    const hindi = getMessages('hi');

    expect(hindi.history.distinctTotals(3)).toBe('3 अलग कुल');
    expect(hindi.domainErrors.diceCountRange(1, 1000)).toBe('पासों की संख्या 1 से 1000 के बीच होनी चाहिए।');
    expect(hindi.history.histogramTitle(7, 6, 16.666)).toBe('7: 6 रोल (16.7%)');
    expect(hindi.roll.presetImportSuccess(2)).toBe('2 प्रीसेट आयात किए गए।');
    expect(hindi.settings.manualUpdates('DiceLab')).toContain('स्वचालित अपडेट सक्षम नहीं हैं');
  });

  it('updates both the live catalog and active locale when locale changes', () => {
    setLocale('hi');
    expect(getActiveLocale()).toBe('hi');
    expect(messages.settings.heading).toBe('सेटिंग्स');
    setLocale('en');
    expect(getActiveLocale()).toBe('en');
    expect(messages.settings.heading).toBe('Settings');
  });
});