import { DEFAULT_SETTINGS, type DiceLabSettings, type DicePreset, type RollResult } from '../domain/types';
import { copy } from '../i18n';
import { isValidPreset, isValidRollResult } from './export';

const KEYS = {
  history: 'dicelab.history.v1',
  presets: 'dicelab.presets.v1',
  settings: 'dicelab.settings.v1',
  onboarded: 'dicelab.onboarded.v1',
} as const;

export const BUILTIN_PRESETS: DicePreset[] = [
  preset('builtin-d20', copy.presets.d20Name, '1d20', copy.presets.d20Description),
  preset('builtin-advantage', copy.presets.advantageName, '2d20kh1', copy.presets.advantageDescription),
  preset(
    'builtin-disadvantage',
    copy.presets.disadvantageName,
    '2d20kl1',
    copy.presets.disadvantageDescription,
  ),
  preset('builtin-ability', copy.presets.abilityName, '4d6kh3', copy.presets.abilityDescription),
  preset('builtin-fireball', copy.presets.fireballName, '8d6', copy.presets.fireballDescription),
  preset('builtin-percentile', copy.presets.percentileName, '1d100', copy.presets.percentileDescription),
];

export function loadHistory(): RollResult[] {
  const parsed = readJson<unknown>(KEYS.history, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isValidRollResult).slice(0, 5_000);
}

export function saveHistory(history: RollResult[], limit: number): void {
  const safeLimit = Number.isSafeInteger(limit)
    ? Math.min(Math.max(limit, 10), 5_000)
    : DEFAULT_SETTINGS.historyLimit;
  writeJson(KEYS.history, history.slice(0, safeLimit));
}

export function loadPresets(): DicePreset[] {
  const parsed = readJson<unknown>(KEYS.presets, []);
  const custom = Array.isArray(parsed)
    ? parsed.filter(isValidPreset).filter((item) => !item.id.startsWith('builtin-')).slice(0, 500)
    : [];
  return [...BUILTIN_PRESETS, ...custom];
}

export function saveCustomPresets(presets: DicePreset[]): void {
  writeJson(
    KEYS.presets,
    presets.filter((item) => !item.id.startsWith('builtin-')).slice(0, 500),
  );
}

export function loadSettings(): DiceLabSettings {
  const parsed = readJson<unknown>(KEYS.settings, {});
  if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
  const candidate = parsed as Record<string, unknown>;
  const theme =
    candidate.theme === 'light' || candidate.theme === 'dark' || candidate.theme === 'system'
      ? candidate.theme
      : DEFAULT_SETTINGS.theme;
  const randomMode =
    candidate.randomMode === 'secure' || candidate.randomMode === 'seeded'
      ? candidate.randomMode
      : DEFAULT_SETTINGS.randomMode;
  const historyLimit =
    typeof candidate.historyLimit === 'number' && Number.isSafeInteger(candidate.historyLimit)
      ? Math.min(5_000, Math.max(10, candidate.historyLimit))
      : DEFAULT_SETTINGS.historyLimit;

  return {
    theme,
    randomMode,
    reducedMotion:
      typeof candidate.reducedMotion === 'boolean' ? candidate.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    animations: typeof candidate.animations === 'boolean' ? candidate.animations : DEFAULT_SETTINGS.animations,
    seed: typeof candidate.seed === 'string' ? candidate.seed.slice(0, 120) : DEFAULT_SETTINGS.seed,
    historyLimit,
  };
}

export function saveSettings(settings: DiceLabSettings): void {
  writeJson(KEYS.settings, settings);
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(KEYS.onboarded) === 'true';
  } catch {
    return false;
  }
}

export function completeOnboarding(): void {
  try {
    localStorage.setItem(KEYS.onboarded, 'true');
  } catch {
    // The app remains usable when storage is unavailable.
  }
}

export function clearDiceLabData(): void {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore blocked storage; callers refresh their in-memory state separately.
  }
}

function preset(id: string, name: string, expression: string, description: string): DicePreset {
  return { id, name, expression, description, createdAt: '2026-08-19T00:00:00.000Z' };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or privacy settings should not break rolling dice.
  }
}
