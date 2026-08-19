import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../domain/types';
import { loadHistory, loadPresets, loadSettings } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('local persistence recovery', () => {
  it('filters malformed roll history entries', () => {
    localStorage.setItem(
      'dicelab.history.v1',
      JSON.stringify([
        {
          id: 'forged',
          expression: '1d6',
          total: 999,
          dice: [{ value: 6, kept: true, index: 0 }],
          modifier: 0,
          mode: 'secure',
          rolledAt: '2026-08-19T00:00:00.000Z',
        },
      ]),
    );

    expect(loadHistory()).toEqual([]);
  });

  it('filters malformed custom presets while preserving built-ins', () => {
    localStorage.setItem(
      'dicelab.presets.v1',
      JSON.stringify([{ id: 'custom-bad', name: 'Bad', expression: 'not-dice', createdAt: 'invalid-date' }]),
    );

    const presets = loadPresets();
    expect(presets.length).toBeGreaterThan(0);
    expect(presets.some((preset) => preset.id === 'custom-bad')).toBe(false);
  });

  it('normalizes invalid persisted settings to safe defaults', () => {
    localStorage.setItem(
      'dicelab.settings.v1',
      JSON.stringify({
        theme: 'neon',
        randomMode: 'predictable',
        historyLimit: 999_999,
        seed: 'x'.repeat(500),
        reducedMotion: 'yes',
        animations: 1,
      }),
    );

    expect(loadSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      historyLimit: 5_000,
      seed: 'x'.repeat(120),
    });
  });
});
