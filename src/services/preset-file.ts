import { isCanonicalIsoDate } from '../domain/persistence';
import { parseDiceExpression } from '../domain/parser';
import type { DicePreset } from '../domain/types';

const MAX_PRESET_FILE_BYTES = 1_000_000;
const MAX_SHARED_PRESETS = 500;
const MAX_PRESET_NAME_LENGTH = 80;
const MAX_PRESET_DESCRIPTION_LENGTH = 240;

export interface SharedDicePreset {
  name: string;
  expression: string;
  description?: string;
}

export interface DiceLabPresetFile {
  kind: 'dicelab-presets';
  schemaVersion: 1;
  exportedAt: string;
  presets: SharedDicePreset[];
}

export type PresetFileValidationErrorCode =
  | 'preset-file-too-large'
  | 'invalid-json'
  | 'invalid-root'
  | 'invalid-kind'
  | 'unsupported-schema'
  | 'invalid-export-timestamp'
  | 'invalid-presets-shape'
  | 'invalid-preset';

export class PresetFileValidationError extends Error {
  readonly code: PresetFileValidationErrorCode;

  constructor(code: PresetFileValidationErrorCode, message: string) {
    super(message);
    this.name = 'PresetFileValidationError';
    this.code = code;
  }
}

export function createPresetFile(presets: DicePreset[]): DiceLabPresetFile {
  return {
    kind: 'dicelab-presets',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    presets: presets
      .filter((preset) => !preset.id.startsWith('builtin-'))
      .slice(-MAX_SHARED_PRESETS)
      .map((preset) => ({
        name: preset.name,
        expression: parseDiceExpression(preset.expression).normalized,
        ...(preset.description ? { description: preset.description } : {}),
      })),
  };
}

export function presetFileToJson(file: DiceLabPresetFile): string {
  const contents = `${JSON.stringify(file, null, 2)}\n`;
  assertPresetFileSize(contents);
  return contents;
}

export function parsePresetFileJson(contents: string): DiceLabPresetFile {
  assertPresetFileSize(contents);

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new PresetFileValidationError('invalid-json', 'Preset file is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new PresetFileValidationError('invalid-root', 'Preset file root must be an object.');
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.kind !== 'dicelab-presets') {
    throw new PresetFileValidationError('invalid-kind', 'File is not a DiceLab preset file.');
  }
  if (candidate.schemaVersion !== 1) {
    throw new PresetFileValidationError('unsupported-schema', 'Unsupported DiceLab preset schema version.');
  }
  if (typeof candidate.exportedAt !== 'string' || !isCanonicalIsoDate(candidate.exportedAt)) {
    throw new PresetFileValidationError('invalid-export-timestamp', 'Preset export timestamp is invalid.');
  }
  if (!Array.isArray(candidate.presets) || candidate.presets.length > MAX_SHARED_PRESETS) {
    throw new PresetFileValidationError(
      'invalid-presets-shape',
      `Preset file must contain at most ${MAX_SHARED_PRESETS} presets.`,
    );
  }

  const presets = candidate.presets.map(normalizeSharedPreset);
  return {
    kind: 'dicelab-presets',
    schemaVersion: 1,
    exportedAt: candidate.exportedAt,
    presets,
  };
}

export async function parsePresetFile(file: Pick<File, 'size' | 'text'>): Promise<DiceLabPresetFile> {
  if (file.size > MAX_PRESET_FILE_BYTES) throwPresetFileTooLarge();
  return parsePresetFileJson(await file.text());
}

function normalizeSharedPreset(value: unknown): SharedDicePreset {
  if (!value || typeof value !== 'object') throwInvalidPreset();
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== 'string' ||
    candidate.name.trim().length < 1 ||
    candidate.name.trim().length > MAX_PRESET_NAME_LENGTH ||
    typeof candidate.expression !== 'string' ||
    (candidate.description !== undefined &&
      (typeof candidate.description !== 'string' || candidate.description.length > MAX_PRESET_DESCRIPTION_LENGTH))
  ) {
    throwInvalidPreset();
  }

  let normalizedExpression: string;
  try {
    normalizedExpression = parseDiceExpression(candidate.expression).normalized;
  } catch {
    throwInvalidPreset();
  }

  const name = candidate.name.trim();
  const description = typeof candidate.description === 'string' ? candidate.description.trim() : undefined;
  return {
    name,
    expression: normalizedExpression,
    ...(description ? { description } : {}),
  };
}

function assertPresetFileSize(contents: string): void {
  if (new TextEncoder().encode(contents).byteLength > MAX_PRESET_FILE_BYTES) throwPresetFileTooLarge();
}

function throwPresetFileTooLarge(): never {
  throw new PresetFileValidationError('preset-file-too-large', 'Preset file is larger than the supported 1 MB limit.');
}

function throwInvalidPreset(): never {
  throw new PresetFileValidationError('invalid-preset', 'Preset file contains an invalid preset.');
}
