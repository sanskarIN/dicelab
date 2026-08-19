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
    const invalid = {
      schemaVersion: 1,
      exportedAt: '2026-08-19T00:00:00.000Z',
      history: [{ ...roll, expression: 'not-dice' }],
      presets: [],
      settings: DEFAULT_SETTINGS,
    };
    expect(() => parseBackupJson(JSON.stringify(invalid))).toThrow(BackupValidationError);
  });

  it('rejects totals that do not match imported dice and modifiers', () => {
    const invalid = createBackup([{ ...roll, total: 999 }], [], DEFAULT_SETTINGS);
    expect(() => parseBackupJson(backupToJson(invalid))).toThrow(BackupValidationError);
  });

  it('rejects die values outside the expression side range', () => {
    const invalid = createBackup(
      [{ ...roll, total: 25, dice: [{ value: 23, kept: true, index: 0 }] }],
      [],
      DEFAULT_SETTINGS,
    );
    expect(() => parseBackupJson(backupToJson(invalid))).toThrow(BackupValidationError);
  });

  it('rejects inconsistent keep and drop flags', () => {
    const keepRoll: RollResult = {
      ...roll,
      expression: '2d20kh1',
      modifier: 0,
      total: 10,
      dice: [
        { value: 10, kept: false, index: 0 },
        { value: 2, kept: true, index: 1 },
      ],
    };
    const invalid = createBackup([keepRoll], [], DEFAULT_SETTINGS);
    expect(() => parseBackupJson(backupToJson(invalid))).toThrow(BackupValidationError);
  });
});
