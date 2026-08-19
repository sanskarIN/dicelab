import { parseDiceExpression } from '../domain/parser';
import { DEFAULT_SETTINGS, type DicePreset, type DiceLabSettings, type RollResult } from '../domain/types';

const MAX_BACKUP_BYTES = 5_000_000;
const MAX_BACKUP_HISTORY = 5_000;
const MAX_BACKUP_PRESETS = 500;

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
      roll.seed ?? '',
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
    throw new BackupValidationError('Backup is larger than the supported 5 MB limit.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new BackupValidationError('Backup is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') throw new BackupValidationError('Backup root must be an object.');

  const candidate = parsed as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) throw new BackupValidationError('Unsupported DiceLab backup schema version.');
  if (!Array.isArray(candidate.history) || candidate.history.length > MAX_BACKUP_HISTORY) {
    throw new BackupValidationError(`Backup history must contain at most ${MAX_BACKUP_HISTORY.toLocaleString('en-US')} rolls.`);
  }
  if (!Array.isArray(candidate.presets) || candidate.presets.length > MAX_BACKUP_PRESETS) {
    throw new BackupValidationError(`Backup presets must contain at most ${MAX_BACKUP_PRESETS.toLocaleString('en-US')} items.`);
  }
  if (!candidate.history.every(isRollResult)) throw new BackupValidationError('Backup contains an invalid roll history entry.');
  if (!candidate.presets.every(isPreset)) throw new BackupValidationError('Backup contains an invalid preset.');

  const settings = normalizeSettings(candidate.settings);
  return {
    schemaVersion: 1,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : new Date().toISOString(),
    history: candidate.history,
    presets: candidate.presets.filter((preset) => !preset.id.startsWith('builtin-')),
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
  if (!value || typeof value !== 'object') throw new BackupValidationError('Backup settings are missing or invalid.');
  const settings = value as Record<string, unknown>;
  const theme = settings.theme;
  const randomMode = settings.randomMode;
  if (theme !== 'system' && theme !== 'light' && theme !== 'dark') throw new BackupValidationError('Backup theme is invalid.');
  if (randomMode !== 'secure' && randomMode !== 'seeded') throw new BackupValidationError('Backup random mode is invalid.');
  const historyLimit = typeof settings.historyLimit === 'number' && Number.isSafeInteger(settings.historyLimit)
    ? Math.min(5_000, Math.max(10, settings.historyLimit))
    : DEFAULT_SETTINGS.historyLimit;
  return {
    theme,
    reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    animations: typeof settings.animations === 'boolean' ? settings.animations : DEFAULT_SETTINGS.animations,
    randomMode,
    seed: typeof settings.seed === 'string' ? settings.seed.slice(0, 120) : DEFAULT_SETTINGS.seed,
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
    !Number.isSafeInteger(roll.total) ||
    typeof roll.modifier !== 'number' ||
    !Number.isSafeInteger(roll.modifier) ||
    !Array.isArray(roll.dice) ||
    roll.dice.length > 1_000 ||
    typeof roll.rolledAt !== 'string' ||
    !isIsoDate(roll.rolledAt) ||
    (roll.mode !== 'secure' && roll.mode !== 'seeded') ||
    (roll.seed !== undefined && (typeof roll.seed !== 'string' || roll.seed.length > 120)) ||
    (roll.mode === 'seeded' && typeof roll.seed !== 'string')
  ) return false;

  let parsed;
  try {
    parsed = parseDiceExpression(roll.expression);
  } catch {
    return false;
  }
  if (roll.modifier !== parsed.modifier || roll.dice.length !== parsed.count) return false;

  const seenIndices = new Set<number>();
  for (const die of roll.dice) {
    if (
      !die ||
      typeof die !== 'object' ||
      typeof die.value !== 'number' ||
      !Number.isSafeInteger(die.value) ||
      die.value < 1 ||
      die.value > parsed.sides ||
      typeof die.kept !== 'boolean' ||
      typeof die.index !== 'number' ||
      !Number.isSafeInteger(die.index) ||
      die.index < 0 ||
      die.index >= parsed.count ||
      seenIndices.has(die.index)
    ) return false;
    seenIndices.add(die.index);
  }

  const expectedKept = parsed.selection
    ? parsed.selection.kind.startsWith('keep')
      ? parsed.selection.count
      : parsed.count - parsed.selection.count
    : parsed.count;
  if (roll.dice.filter((die) => die.kept).length !== expectedKept) return false;

  const computedTotal = roll.dice.reduce((sum, die) => sum + (die.kept ? die.value : 0), parsed.modifier);
  return computedTotal === roll.total;
}

function isPreset(value: unknown): value is DicePreset {
  if (!value || typeof value !== 'object') return false;
  const preset = value as Partial<DicePreset>;
  if (
    typeof preset.id !== 'string' ||
    preset.id.length > 200 ||
    typeof preset.name !== 'string' ||
    preset.name.length < 1 ||
    preset.name.length > 80 ||
    typeof preset.expression !== 'string' ||
    typeof preset.createdAt !== 'string' ||
    !isIsoDate(preset.createdAt) ||
    (preset.description !== undefined && (typeof preset.description !== 'string' || preset.description.length > 240))
  ) return false;
  try {
    parseDiceExpression(preset.expression);
    return true;
  } catch {
    return false;
  }
}

function isIsoDate(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function csvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (!/[",\r\n]/.test(safeValue)) return safeValue;
  return `"${safeValue.replaceAll('"', '""')}"`;
}
