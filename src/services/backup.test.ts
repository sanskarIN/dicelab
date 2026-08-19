import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type RollResult } from '../domain/types';
import {
  BackupValidationError,
  type BackupValidationErrorCode,
  backupToJson,
  createBackup,
  parseBackupJson,
} from './export';

const roll: RollResult = {
  id: 'roll-restore',
  expression: '1d20+2',
  total: 14,
  dice: [{ value: 12, kept: true, index: 0 }],
  modifier: 2,
  mode: 'secure',
  rolledAt: '2026-08-19T00:00:00.000Z',
};

function backupWith(historyEntry: unknown): string {
  return JSON.stringify({
    schemaVersion: 1,
    exportedAt: '2026-08-19T00:00:00.000Z',
    history: [historyEntry],
    presets: [],
    settings: DEFAULT_SETTINGS,
  });
}

function expectBackupCode(contents: string, code: BackupValidationErrorCode): BackupValidationError {
  try {
    parseBackupJson(contents);
    throw new Error(`expected backup to fail with ${code}`);
  } catch (cause) {
    expect(cause).toBeInstanceOf(BackupValidationError);
    expect((cause as BackupValidationError).code).toBe(code);
    return cause as BackupValidationError;
  }
}

describe('DiceLab backups', () => {
  it('round trips a valid backup', () => {
    const original = createBackup([roll], [], DEFAULT_SETTINGS);
    const restored = parseBackupJson(backupToJson(original));
    expect(restored.history).toEqual([roll]);
    expect(restored.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('refuses to serialize a backup larger than the restore size limit', () => {
    const oversized = createBackup(
      [],
      [
        {
          id: 'oversized-preset',
          name: 'Oversized backup regression',
          expression: '1d6',
          description: 'x'.repeat(5_000_000),
          createdAt: '2026-08-19T00:00:00.000Z',
        },
      ],
      DEFAULT_SETTINGS,
    );

    try {
      backupToJson(oversized);
      throw new Error('expected oversized backup serialization to fail');
    } catch (cause) {
      expect(cause).toBeInstanceOf(BackupValidationError);
      expect((cause as BackupValidationError).code).toBe('backup-too-large');
      expect((cause as BackupValidationError).context.limit).toBe(5_000_000);
    }
  });

  it('round trips the Hindi locale preference', () => {
    const settings = { ...DEFAULT_SETTINGS, locale: 'hi' as const };
    const restored = parseBackupJson(backupToJson(createBackup([], [], settings)));
    expect(restored.settings.locale).toBe('hi');
  });

  it('keeps schema-v1 backups without locale compatible by defaulting to English', () => {
    const { locale: _locale, ...legacySettings } = DEFAULT_SETTINGS;
    const restored = parseBackupJson(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-08-19T00:00:00.000Z',
        history: [],
        presets: [],
        settings: legacySettings,
      }),
    );
    expect(restored.settings.locale).toBe('en');
  });

  it('falls back to English when a backup contains an unsupported locale', () => {
    const restored = parseBackupJson(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-08-19T00:00:00.000Z',
        history: [],
        presets: [],
        settings: { ...DEFAULT_SETTINGS, locale: 'xx' },
      }),
    );
    expect(restored.settings.locale).toBe('en');
  });

  it('round trips a seeded roll created from the maximum-length user seed', () => {
    const userSeed = 's'.repeat(120);
    const seededRoll: RollResult = {
      ...roll,
      mode: 'seeded',
      seed: `${userSeed}:4999`,
    };
    const settings = { ...DEFAULT_SETTINGS, randomMode: 'seeded' as const, seed: userSeed };
    const restored = parseBackupJson(backupToJson(createBackup([seededRoll], [], settings)));
    expect(restored.history).toEqual([seededRoll]);
    expect(restored.settings.seed).toBe(userSeed);
  });

  it('normalizes animations off when restored settings request reduced motion', () => {
    const restored = parseBackupJson(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-08-19T00:00:00.000Z',
        history: [],
        presets: [],
        settings: { ...DEFAULT_SETTINGS, reducedMotion: true, animations: true },
      }),
    );
    expect(restored.settings.reducedMotion).toBe(true);
    expect(restored.settings.animations).toBe(false);
  });

  it('rejects unsupported schemas with a stable code', () => {
    expectBackupCode('{"schemaVersion":99,"history":[],"presets":[],"settings":{}}', 'unsupported-schema');
  });

  it('rejects malformed export timestamps with a stable code', () => {
    expectBackupCode(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: 'yesterday',
        history: [],
        presets: [],
        settings: DEFAULT_SETTINGS,
      }),
      'invalid-export-timestamp',
    );
  });

  it('rejects malformed roll expressions in imported history', () => {
    expectBackupCode(backupWith({ ...roll, expression: 'not-dice' }), 'invalid-history-entry');
  });

  it('rejects die values outside the expression sides', () => {
    expectBackupCode(
      backupWith({ ...roll, dice: [{ value: 21, kept: true, index: 0 }], total: 23 }),
      'invalid-history-entry',
    );
  });

  it('rejects totals that do not match kept dice and modifier', () => {
    expectBackupCode(backupWith({ ...roll, total: 999 }), 'invalid-history-entry');
  });

  it('rejects duplicate die indices', () => {
    const duplicated = {
      ...roll,
      expression: '2d20+2',
      total: 26,
      dice: [
        { value: 12, kept: true, index: 0 },
        { value: 12, kept: true, index: 0 },
      ],
    };
    expectBackupCode(backupWith(duplicated), 'invalid-history-entry');
  });

  it('rejects duplicate roll ids', () => {
    const duplicateHistory = JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-08-19T00:00:00.000Z',
      history: [roll, { ...roll }],
      presets: [],
      settings: DEFAULT_SETTINGS,
    });
    expectBackupCode(duplicateHistory, 'duplicate-roll-ids');
  });

  it('rejects duplicate custom preset ids', () => {
    const preset = {
      id: 'preset-1',
      name: 'Initiative',
      expression: '1d20+3',
      createdAt: '2026-08-19T00:00:00.000Z',
    };
    const duplicatePresets = JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-08-19T00:00:00.000Z',
      history: [],
      presets: [preset, { ...preset }],
      settings: DEFAULT_SETTINGS,
    });
    expectBackupCode(duplicatePresets, 'duplicate-preset-ids');
  });

  it('rejects incorrect keep/drop state', () => {
    const invalidSelection = {
      ...roll,
      expression: '2d20kh1+2',
      total: 26,
      dice: [
        { value: 12, kept: true, index: 0 },
        { value: 12, kept: true, index: 1 },
      ],
    };
    expectBackupCode(backupWith(invalidSelection), 'invalid-history-entry');
  });

  it('requires a seed for deterministic imported rolls', () => {
    expectBackupCode(backupWith({ ...roll, mode: 'seeded' }), 'invalid-history-entry');
  });

  it('rejects non-canonical timestamps', () => {
    expectBackupCode(backupWith({ ...roll, rolledAt: '19 August 2026' }), 'invalid-history-entry');
  });

  it('exposes immutable size context for localized limit messages', () => {
    const oversizedHistory = Array.from({ length: 5_001 }, (_, index) => ({ ...roll, id: `roll-${index}` }));
    const error = expectBackupCode(
      JSON.stringify({
        schemaVersion: 1,
        history: oversizedHistory,
        presets: [],
        settings: DEFAULT_SETTINGS,
      }),
      'invalid-history-shape',
    );
    expect(error.context.limit).toBe(5_000);
    expect(Object.isFrozen(error.context)).toBe(true);
  });
});
