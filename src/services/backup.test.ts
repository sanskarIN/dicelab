import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type RollResult } from '../domain/types';
import { BackupValidationError, backupToJson, createBackup, parseBackupJson } from './export';

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

describe('DiceLab backups', () => {
  it('round trips a valid backup', () => {
    const original = createBackup([roll], [], DEFAULT_SETTINGS);
    const restored = parseBackupJson(backupToJson(original));
    expect(restored.history).toEqual([roll]);
    expect(restored.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('rejects unsupported schemas', () => {
    expect(() => parseBackupJson('{"schemaVersion":99,"history":[],"presets":[],"settings":{}}')).toThrow(
      BackupValidationError,
    );
  });

  it('rejects malformed roll expressions in imported history', () => {
    expect(() => parseBackupJson(backupWith({ ...roll, expression: 'not-dice' }))).toThrow(BackupValidationError);
  });

  it('rejects die values outside the expression sides', () => {
    expect(() => parseBackupJson(backupWith({ ...roll, dice: [{ value: 21, kept: true, index: 0 }], total: 23 }))).toThrow(
      BackupValidationError,
    );
  });

  it('rejects totals that do not match kept dice and modifier', () => {
    expect(() => parseBackupJson(backupWith({ ...roll, total: 999 }))).toThrow(BackupValidationError);
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
    expect(() => parseBackupJson(backupWith(duplicated))).toThrow(BackupValidationError);
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
    expect(() => parseBackupJson(backupWith(invalidSelection))).toThrow(BackupValidationError);
  });

  it('requires a seed for deterministic imported rolls', () => {
    expect(() => parseBackupJson(backupWith({ ...roll, mode: 'seeded' }))).toThrow(BackupValidationError);
  });

  it('rejects non-canonical timestamps', () => {
    expect(() => parseBackupJson(backupWith({ ...roll, rolledAt: '19 August 2026' }))).toThrow(BackupValidationError);
  });
});
