import { describe, expect, it, vi } from 'vitest';
import type { DicePreset } from '../domain/types';
import {
  PresetFileValidationError,
  createPresetFile,
  parsePresetFile,
  parsePresetFileJson,
  presetFileToJson,
  selectNewSharedPresets,
} from './preset-file';

const customPreset: DicePreset = {
  id: 'custom-1',
  name: '  Critical check  ',
  expression: '2D20KH1+5',
  description: 'Shared table setup',
  createdAt: '2026-08-23T00:00:00.000Z',
};

const builtinPreset: DicePreset = {
  id: 'builtin-d20',
  name: 'D20 check',
  expression: '1d20',
  createdAt: '2026-08-19T00:00:00.000Z',
};

describe('shareable preset files', () => {
  it('exports custom presets without local ids or built-ins', () => {
    const file = createPresetFile([builtinPreset, customPreset]);

    expect(file.kind).toBe('dicelab-presets');
    expect(file.schemaVersion).toBe(1);
    expect(file.presets).toEqual([
      {
        name: '  Critical check  ',
        expression: '2d20kh1+5',
        description: 'Shared table setup',
      },
    ]);
    expect(file.presets[0]).not.toHaveProperty('id');
    expect(file.presets[0]).not.toHaveProperty('createdAt');
  });

  it('round-trips and normalizes shared preset input', () => {
    const source = createPresetFile([customPreset]);
    const parsed = parsePresetFileJson(presetFileToJson(source));

    expect(parsed.presets).toEqual([
      {
        name: 'Critical check',
        expression: '2d20kh1+5',
        description: 'Shared table setup',
      },
    ]);
  });

  it('skips shared presets that already exist locally', () => {
    const incoming = [
      { name: 'Critical check', expression: '2D20KH1+5', description: 'Shared table setup' },
      { name: 'Fresh preset', expression: ' 2d6 + 1 ' },
    ];

    expect(selectNewSharedPresets([customPreset], incoming)).toEqual([
      { name: 'Fresh preset', expression: '2d6+1' },
    ]);
  });

  it('deduplicates repeated entries within one shared file', () => {
    const incoming = [
      { name: '  Shared  ', expression: '1D20', description: '  Table setup  ' },
      { name: 'Shared', expression: '1d20', description: 'Table setup' },
    ];

    expect(selectNewSharedPresets([], incoming)).toEqual([
      { name: 'Shared', expression: '1d20', description: 'Table setup' },
    ]);
  });

  it('rejects non-DiceLab JSON and unsupported schemas', () => {
    expect(() =>
      parsePresetFileJson(
        JSON.stringify({ kind: 'other', schemaVersion: 1, exportedAt: '2026-08-23T00:00:00.000Z', presets: [] }),
      ),
    ).toMatchObject({ code: 'invalid-kind' });

    expect(() =>
      parsePresetFileJson(
        JSON.stringify({
          kind: 'dicelab-presets',
          schemaVersion: 2,
          exportedAt: '2026-08-23T00:00:00.000Z',
          presets: [],
        }),
      ),
    ).toMatchObject({ code: 'unsupported-schema' });
  });

  it('rejects malformed preset expressions', () => {
    expect(() =>
      parsePresetFileJson(
        JSON.stringify({
          kind: 'dicelab-presets',
          schemaVersion: 1,
          exportedAt: '2026-08-23T00:00:00.000Z',
          presets: [{ name: 'Broken', expression: 'not-dice' }],
        }),
      ),
    ).toMatchObject({ code: 'invalid-preset' });
  });

  it('rejects oversized files before reading text', async () => {
    const text = vi.fn().mockResolvedValue('{}');

    await expect(parsePresetFile({ size: 1_000_001, text })).rejects.toBeInstanceOf(PresetFileValidationError);
    expect(text).not.toHaveBeenCalled();
  });

  it('rejects invalid export timestamps', () => {
    expect(() =>
      parsePresetFileJson(
        JSON.stringify({
          kind: 'dicelab-presets',
          schemaVersion: 1,
          exportedAt: 'yesterday',
          presets: [],
        }),
      ),
    ).toMatchObject({ code: 'invalid-export-timestamp' });
  });
});