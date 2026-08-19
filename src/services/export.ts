import { selectKeptIndices } from '../domain/engine';
import { parseDiceExpression } from '../domain/parser';
import { DEFAULT_SETTINGS, type DicePreset, type DiceLabSettings, type RollResult } from '../domain/types';
import { copy } from '../i18n';

const MAX_BACKUP_BYTES = 5_000_000;
const MAX_BACKUP_HISTORY = 5_000;
const MAX_BACKUP_PRESETS = 500;
const MAX_SEED_LENGTH = 120;

export interface DiceLabBackup {
  schemaVersion: 1;
  exportedAt: string;
  history: RollResult[];
  presets: DicePreset[];
  settings: DiceLabSettings;
}

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

export function historyToJson(history: RollResult[]): string {
  return `${JSON.stringify(history, null, 2)}\n`;
}

export function historyToCsv(history: RollResult[]): string {
  const rows = [
    ['id', 'rolled_at', 'expression', 'total', 'modifier', 'mode', 'seed', 'dice'],
    ...history.map((roll) => [
      roll.id,
      roll.rolledAt,
      roll.expression,
      String(roll.total),
      String(roll.modifier),
      roll.mode,
      protectSpreadsheetText(roll.seed ?? ''),
      roll.dice.map((die) => `${die.value}${die.kept ? '' : ' (dropped)'}`).join(' | '),
    ]),
  ];
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

export function createBackup(
  history: RollResult[],
  presets: DicePreset[],
  settings: DiceLabSettings,
): DiceLabBackup {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    history,
    presets: presets.filter((preset) => !preset.id.startsWith('builtin-')),
    settings,
  };
}

export function backupToJson(backup: DiceLabBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function parseBackupJson(contents: string): DiceLabBackup {
  if (new Blob([contents]).size > MAX_BACKUP_BYTES) {
    throw new BackupValidationError(copy.errors.backupTooLarge);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new BackupValidationError(copy.errors.invalidBackupJson);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new BackupValidationError(copy.errors.invalidBackupRoot);
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) {
    throw new BackupValidationError(copy.errors.unsupportedBackupSchema);
  }

  const history = candidate.history;
  const presets = candidate.presets;
  if (!Array.isArray(history) || history.length > MAX_BACKUP_HISTORY) {
    throw new BackupValidationError(copy.errors.backupHistoryTooLarge(MAX_BACKUP_HISTORY));
  }
  if (!Array.isArray(presets) || presets.length > MAX_BACKUP_PRESETS) {
    throw new BackupValidationError(copy.errors.backupPresetsTooLarge(MAX_BACKUP_PRESETS));
  }
  if (!history.every(isRollResult)) {
    throw new BackupValidationError(copy.errors.invalidBackupRoll);
  }
  if (!presets.every(isPreset)) {
    throw new BackupValidationError(copy.errors.invalidBackupPreset);
  }

  const settings = normalizeSettings(candidate.settings);
  return {
    schemaVersion: 1,
    exportedAt: isValidIsoDate(candidate.exportedAt) ? candidate.exportedAt : new Date().toISOString(),
    history,
    presets: presets.filter((preset) => !preset.id.startsWith('builtin-')),
    settings,
  };
}

export function downloadText(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizeSettings(value: unknown): DiceLabSettings {
  if (!value || typeof value !== 'object') {
    throw new BackupValidationError(copy.errors.invalidBackupSettings);
  }
  const settings = value as Record<string, unknown>;
  const theme = settings.theme;
  const randomMode = settings.randomMode;
  if (theme !== 'system' && theme !== 'light' && theme !== 'dark') {
    throw new BackupValidationError(copy.errors.invalidBackupTheme);
  }
  if (randomMode !== 'secure' && randomMode !== 'seeded') {
    throw new BackupValidationError(copy.errors.invalidBackupRandomMode);
  }
  const historyLimit =
    typeof settings.historyLimit === 'number' && Number.isSafeInteger(settings.historyLimit)
      ? Math.min(5_000, Math.max(10, settings.historyLimit))
      : DEFAULT_SETTINGS.historyLimit;
  return {
    theme,
    reducedMotion:
      typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    animations: typeof settings.animations === 'boolean' ? settings.animations : DEFAULT_SETTINGS.animations,
    randomMode,
    seed: typeof settings.seed === 'string' ? settings.seed.slice(0, MAX_SEED_LENGTH) : DEFAULT_SETTINGS.seed,
    historyLimit,
  };
}

function isRollResult(value: unknown): value is RollResult {
  if (!value || typeof value !== 'object') return false;
  const roll = value as Partial<RollResult>;
  if (
    typeof roll.id !== 'string' ||
    roll.id.length < 1 ||
    roll.id.length > 200 ||
    typeof roll.expression !== 'string' ||
    typeof roll.total !== 'number' ||
    !Number.isFinite(roll.total) ||
    typeof roll.modifier !== 'number' ||
    !Number.isSafeInteger(roll.modifier) ||
    !Array.isArray(roll.dice) ||
    roll.dice.length > 1_000 ||
    !isValidIsoDate(roll.rolledAt) ||
    (roll.mode !== 'secure' && roll.mode !== 'seeded') ||
    (roll.seed !== undefined && (typeof roll.seed !== 'string' || roll.seed.length > MAX_SEED_LENGTH))
  ) {
    return false;
  }

  let expression;
  try {
    expression = parseDiceExpression(roll.expression);
  } catch {
    return false;
  }
  if (roll.expression !== expression.normalized || roll.modifier !== expression.modifier) return false;
  if (roll.dice.length !== expression.count) return false;

  const indices = new Set<number>();
  const values: number[] = [];
  for (const die of roll.dice) {
    if (
      !die ||
      typeof die !== 'object' ||
      typeof die.value !== 'number' ||
      !Number.isSafeInteger(die.value) ||
      die.value < 1 ||
      die.value > expression.sides ||
      typeof die.kept !== 'boolean' ||
      typeof die.index !== 'number' ||
      !Number.isSafeInteger(die.index) ||
      die.index < 0 ||
      die.index >= expression.count ||
      indices.has(die.index)
    ) {
      return false;
    }
    indices.add(die.index);
    values[die.index] = die.value;
  }

  const expectedKept = selectKeptIndices(values, expression);
  for (const die of roll.dice) {
    if (die.kept !== expectedKept.has(die.index)) return false;
  }
  const expectedTotal = roll.dice.reduce((sum, die) => sum + (die.kept ? die.value : 0), expression.modifier);
  return roll.total === expectedTotal;
}

function isPreset(value: unknown): value is DicePreset {
  if (!value || typeof value !== 'object') return false;
  const preset = value as Partial<DicePreset>;
  if (
    typeof preset.id !== 'string' ||
    preset.id.length < 1 ||
    preset.id.length > 200 ||
    typeof preset.name !== 'string' ||
    preset.name.trim().length < 1 ||
    preset.name.length > 80 ||
    typeof preset.expression !== 'string' ||
    !isValidIsoDate(preset.createdAt) ||
    (preset.description !== undefined && (typeof preset.description !== 'string' || preset.description.length > 240))
  ) {
    return false;
  }
  try {
    return parseDiceExpression(preset.expression).normalized === preset.expression;
  } catch {
    return false;
  }
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function protectSpreadsheetText(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}
