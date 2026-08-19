import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type DicePreset, type RollResult } from '../domain/types';
import {
  BUILTIN_PRESETS,
  MAX_CUSTOM_PRESETS,
  getBuiltinPresets,
  limitPresetCollection,
  loadHistory,
  loadPresets,
  loadSettings,
  saveCustomPresets,
  saveHistory,
} from './storage';

const HISTORY_KEY = 'dicelab.history.v1';
const PRESETS_KEY = 'dicelab.presets.v1';
const SETTINGS_KEY = 'dicelab.settings.v1';

const validRoll: RollResult = {
  id: 'roll-1',
  expression: '2d6+1',
  total: 8,
  dice: [
    { value: 3, kept: true, index: 0 },
    { value: 4, kept: true, index: 1 },
  ],
  modifier: 1,
  mode: 'seeded',
  seed: 'storage-test:0',
  rolledAt: '2026-08-19T04:00:00.000Z',
};

const customPreset: DicePreset = {
  id: 'custom-1',
  name: 'Custom check',
  expression: '3d8+2',
  description: 'Storage fixture',
  createdAt: '2026-08-19T04:00:00.000Z',
};

function manyCustomPresets(count: number): DicePreset[] {
  return Array.from({ length: count }, (_, index) => ({
    ...customPreset,
    id: `custom-${index}`,
    name: `Custom ${index}`,
  }));
}

describe('local storage recovery', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('falls back to default settings and logs only safe metadata when persisted JSON is malformed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(SETTINGS_KEY, '{not-json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        event: 'storage.read_failed',
        context: { storageArea: 'local', keyClass: 'settings' },
      }),
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain('{not-json');
  });

  it('normalizes unsafe settings and enforces reduced-motion consistency', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        theme: 'neon',
        locale: 'xx',
        reducedMotion: true,
        animations: true,
        randomMode: 'predictable',
        seed: 's'.repeat(200),
        historyLimit: 10_000,
      }),
    );

    expect(loadSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      reducedMotion: true,
      animations: false,
      seed: 's'.repeat(120),
      historyLimit: 5_000,
    });
  });

  it('loads a supported persisted locale', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, locale: 'hi' }));
    expect(loadSettings().locale).toBe('hi');
  });

  it('drops inconsistent rolls and duplicate ids from persisted history', () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        validRoll,
        { ...validRoll },
        { ...validRoll, id: 'broken-total', total: 999 },
        { ...validRoll, id: 'broken-expression', expression: 'not-dice' },
      ]),
    );

    expect(loadHistory()).toEqual([validRoll]);
  });

  it('rejects persisted keep/drop masks that do not match the rolled values', () => {
    const forgedSelection: RollResult = {
      id: 'forged-selection',
      expression: '4d6kh3',
      total: 13,
      dice: [
        { value: 6, kept: true, index: 0 },
        { value: 6, kept: true, index: 1 },
        { value: 1, kept: true, index: 2 },
        { value: 2, kept: false, index: 3 },
      ],
      modifier: 0,
      mode: 'seeded',
      seed: 'storage-test:selection',
      rolledAt: '2026-08-19T04:00:00.000Z',
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([forgedSelection]));

    expect(loadHistory()).toEqual([]);
  });

  it('ignores forged built-in presets and duplicate custom ids', () => {
    localStorage.setItem(
      PRESETS_KEY,
      JSON.stringify([
        customPreset,
        { ...customPreset },
        { ...customPreset, id: 'builtin-d20', name: 'Forged', expression: '1d6' },
        { ...customPreset, id: 'invalid', expression: '1d1' },
      ]),
    );

    const loaded = loadPresets();
    expect(loaded).toHaveLength(BUILTIN_PRESETS.length + 1);
    expect(loaded.slice(0, BUILTIN_PRESETS.length)).toEqual(BUILTIN_PRESETS);
    expect(loaded.at(-1)).toEqual(customPreset);
  });

  it('localizes only built-in presets while retaining custom copy', () => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify([customPreset]));

    const loaded = loadPresets('hi');
    const hindiBuiltins = getBuiltinPresets('hi');
    expect(loaded.slice(0, hindiBuiltins.length)).toEqual(hindiBuiltins);
    expect(loaded.at(-1)).toEqual(customPreset);
    expect(loaded[0].name).toBe('D20 जाँच');
  });

  it('keeps the newest custom presets when the live collection exceeds the backup/storage limit', () => {
    const custom = manyCustomPresets(MAX_CUSTOM_PRESETS + 1);
    const limited = limitPresetCollection([...BUILTIN_PRESETS, ...custom]);
    const retainedCustom = limited.slice(BUILTIN_PRESETS.length);

    expect(limited.slice(0, BUILTIN_PRESETS.length)).toEqual(BUILTIN_PRESETS);
    expect(retainedCustom).toHaveLength(MAX_CUSTOM_PRESETS);
    expect(retainedCustom[0].id).toBe('custom-1');
    expect(retainedCustom.at(-1)?.id).toBe(`custom-${MAX_CUSTOM_PRESETS}`);
  });

  it('persists the same newest-500 custom preset policy used by live state', () => {
    const custom = manyCustomPresets(MAX_CUSTOM_PRESETS + 1);
    saveCustomPresets(custom);

    const persisted = JSON.parse(localStorage.getItem(PRESETS_KEY) ?? '[]') as DicePreset[];
    expect(persisted).toHaveLength(MAX_CUSTOM_PRESETS);
    expect(persisted[0].id).toBe('custom-1');
    expect(persisted.at(-1)?.id).toBe(`custom-${MAX_CUSTOM_PRESETS}`);
  });

  it('sanitizes persisted history and presets before writing them back', () => {
    saveHistory([validRoll, { ...validRoll }], 500);
    saveCustomPresets([customPreset, { ...customPreset }, ...BUILTIN_PRESETS]);

    expect(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')).toEqual([validRoll]);
    expect(JSON.parse(localStorage.getItem(PRESETS_KEY) ?? '[]')).toEqual([customPreset]);
  });

  it('keeps working when storage reads are blocked and does not log thrown details', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('private browser policy detail');
    });

    expect(loadHistory()).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'storage.read_failed',
        context: { storageArea: 'local', keyClass: 'history' },
      }),
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private browser policy detail');
  });
});
