import { isCanonicalIsoDate, isPersistedPreset, isPersistedRollResult } from '../domain/persistence';
import { DEFAULT_SETTINGS, type DiceLabSettings, type DicePreset, type RollResult } from '../domain/types';
import { isTauriRuntime } from './runtime';

const MAX_BACKUP_BYTES = 5_000_000;
const MAX_BACKUP_HISTORY = 5_000;
const MAX_BACKUP_PRESETS = 500;

type BackupFileSource = Pick<File, 'size'> & Partial<Pick<File, 'text'>>;

export type TextExportFormat = 'csv' | 'json';

export interface DiceLabBackup {
  schemaVersion: 1;
  exportedAt: string;
  history: RollResult[];
  presets: DicePreset[];
  settings: DiceLabSettings;
}

export type BackupValidationErrorCode =
  | 'backup-too-large'
  | 'invalid-json'
  | 'invalid-root'
  | 'unsupported-schema'
  | 'invalid-history-shape'
  | 'invalid-presets-shape'
  | 'invalid-history-entry'
  | 'invalid-preset'
  | 'duplicate-roll-ids'
  | 'duplicate-preset-ids'
  | 'invalid-export-timestamp'
  | 'invalid-settings'
  | 'invalid-theme'
  | 'invalid-random-mode';

export interface BackupValidationErrorContext {
  limit?: number;
}

export class BackupValidationError extends Error {
  readonly code: BackupValidationErrorCode;
  readonly context: Readonly<BackupValidationErrorContext>;

  constructor(code: BackupValidationErrorCode, message: string, context: BackupValidationErrorContext = {}) {
    super(message);
    this.name = 'BackupValidationError';
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

export function historyToJson(history: RollResult[]): string {
  return `${JSON.stringify(history, null, 2)}\n`;
}

export function historyToCsv(history: RollResult[]): string {
  const header = ['id', 'rolled_at', 'expression', 'total', 'modifier', 'mode', 'seed', 'dice'].join(',');
  const rows = history.map((roll) =>
    [
      csvCell(roll.id, true),
      csvCell(roll.rolledAt),
      csvCell(roll.expression),
      csvCell(String(roll.total)),
      csvCell(String(roll.modifier)),
      csvCell(roll.mode),
      csvCell(roll.seed ?? '', true),
      csvCell(roll.dice.map((die) => `${die.value}${die.kept ? '' : ' (dropped)'}`).join(' | ')),
    ].join(','),
  );
  return `${[header, ...rows].join('\n')}\n`;
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
  const contents = `${JSON.stringify(backup, null, 2)}\n`;
  assertBackupSize(contents);
  return contents;
}

export function parseBackupJson(contents: string): DiceLabBackup {
  assertBackupSize(contents);

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new BackupValidationError('invalid-json', 'Backup is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new BackupValidationError('invalid-root', 'Backup root must be an object.');
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) {
    throw new BackupValidationError('unsupported-schema', 'Unsupported DiceLab backup schema version.');
  }
  if (!Array.isArray(candidate.history) || candidate.history.length > MAX_BACKUP_HISTORY) {
    throw new BackupValidationError(
      'invalid-history-shape',
      `Backup history must contain at most ${MAX_BACKUP_HISTORY.toLocaleString('en-US')} rolls.`,
      { limit: MAX_BACKUP_HISTORY },
    );
  }
  if (!Array.isArray(candidate.presets) || candidate.presets.length > MAX_BACKUP_PRESETS) {
    throw new BackupValidationError(
      'invalid-presets-shape',
      `Backup presets must contain at most ${MAX_BACKUP_PRESETS.toLocaleString('en-US')} items.`,
      { limit: MAX_BACKUP_PRESETS },
    );
  }
  if (!candidate.history.every(isPersistedRollResult)) {
    throw new BackupValidationError('invalid-history-entry', 'Backup contains an invalid roll history entry.');
  }
  if (!candidate.presets.every(isPersistedPreset)) {
    throw new BackupValidationError('invalid-preset', 'Backup contains an invalid preset.');
  }
  if (hasDuplicateIds(candidate.history)) {
    throw new BackupValidationError('duplicate-roll-ids', 'Backup history contains duplicate roll ids.');
  }
  if (hasDuplicateIds(candidate.presets)) {
    throw new BackupValidationError('duplicate-preset-ids', 'Backup presets contain duplicate ids.');
  }
  if (typeof candidate.exportedAt === 'string' && !isCanonicalIsoDate(candidate.exportedAt)) {
    throw new BackupValidationError('invalid-export-timestamp', 'Backup export timestamp is invalid.');
  }

  const settings = normalizeSettings(candidate.settings);
  return {
    schemaVersion: 1,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : new Date().toISOString(),
    history: candidate.history,
    presets: candidate.presets.filter((preset) => !preset.id.startsWith('builtin-')),
    settings,
  };
}

export async function parseBackupFile(file: BackupFileSource): Promise<DiceLabBackup> {
  if (file.size > MAX_BACKUP_BYTES) {
    throwBackupTooLarge();
  }
  return parseBackupJson(await readBackupFileText(file));
}

export async function saveTextExport(
  filename: string,
  contents: string,
  mimeType: string,
  format: TextExportFormat,
): Promise<boolean> {
  if (isTauriRuntime()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<boolean>('save_text_export', { filename, contents, format });
  }
  downloadText(filename, contents, mimeType);
  return true;
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

async function readBackupFileText(file: BackupFileSource): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  if (typeof FileReader !== 'function') {
    throw new Error('Backup file reading is not available in this runtime.');
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Backup file could not be read as text.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Backup file could not be read.'));
    reader.readAsText(file as Blob);
  });
}

function normalizeSettings(value: unknown): DiceLabSettings {
  if (!value || typeof value !== 'object') {
    throw new BackupValidationError('invalid-settings', 'Backup settings are missing or invalid.');
  }
  const settings = value as Record<string, unknown>;
  const theme = settings.theme;
  const randomMode = settings.randomMode;
  if (theme !== 'system' && theme !== 'light' && theme !== 'dark') {
    throw new BackupValidationError('invalid-theme', 'Backup theme is invalid.');
  }
  if (randomMode !== 'secure' && randomMode !== 'seeded') {
    throw new BackupValidationError('invalid-random-mode', 'Backup random mode is invalid.');
  }
  const historyLimit =
    typeof settings.historyLimit === 'number' && Number.isSafeInteger(settings.historyLimit)
      ? Math.min(5_000, Math.max(10, settings.historyLimit))
      : DEFAULT_SETTINGS.historyLimit;
  const reducedMotion =
    typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : DEFAULT_SETTINGS.reducedMotion;
  return {
    theme,
    locale: settings.locale === 'hi' || settings.locale === 'en' ? settings.locale : DEFAULT_SETTINGS.locale,
    reducedMotion,
    animations: reducedMotion
      ? false
      : typeof settings.animations === 'boolean'
        ? settings.animations
        : DEFAULT_SETTINGS.animations,
    randomMode,
    seed: typeof settings.seed === 'string' ? settings.seed.slice(0, 120) : DEFAULT_SETTINGS.seed,
    historyLimit,
  };
}

function assertBackupSize(contents: string): void {
  if (new TextEncoder().encode(contents).byteLength > MAX_BACKUP_BYTES) {
    throwBackupTooLarge();
  }
}

function throwBackupTooLarge(): never {
  throw new BackupValidationError(
    'backup-too-large',
    'Backup is larger than the supported 5 MB limit.',
    { limit: MAX_BACKUP_BYTES },
  );
}

function hasDuplicateIds(items: Array<{ id: string }>): boolean {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) return true;
    ids.add(item.id);
  }
  return false;
}

function csvCell(value: string, neutralizeFormula = false): string {
  const safeValue = neutralizeFormula && /^\s*[=+\-@]/u.test(value) ? `'${value}` : value;
  if (!/[",\r\n]/.test(safeValue)) return safeValue;
  return `"${safeValue.replaceAll('"', '""')}"`;
}
