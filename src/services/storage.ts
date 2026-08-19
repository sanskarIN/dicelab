import { isPersistedPreset, isPersistedRollResult } from '../domain/persistence';
import { DEFAULT_SETTINGS, type DiceLabSettings, type DicePreset, type RollResult } from '../domain/types';
import { messages } from '../i18n';

const MAX_HISTORY = 5_000;
const MAX_CUSTOM_PRESETS = 500;

const KEYS = {
  history: 'dicelab.history.v1',
  presets: 'dicelab.presets.v1',
  settings: 'dicelab.settings.v1',
  onboarded: 'dicelab.onboarded.v1',
} as const;

export const BUILTIN_PRESETS: DicePreset[] = [
  preset('builtin-d20', messages.presets.d20Name, '1d20', messages.presets.d20Body),
  preset('builtin-advantage', messages.presets.advantageName, '2d20kh1', messages.presets.advantageBody),
  preset('builtin-disadvantage', messages.presets.disadvantageName, '2d20kl1', messages.presets.disadvantageBody),
  preset('builtin-ability', messages.presets.abilityName, '4d6kh3', messages.presets.abilityBody),
  preset('builtin-fireball', messages.presets.fireballName, '8d6', messages.presets.fireballBody),
  preset('builtin-percentile', messages.presets.percentileName, '1d100', messages.presets.percentileBody),
];

export function loadHistory(): RollResult[] {
  const parsed = readJson<unknown>(KEYS.history, []);
  if (!Array.isArray(parsed)) return [];
  return uniqueById(parsed.slice(0, MAX_HISTORY).filter(isPersistedRollResult));
}

export function saveHistory(history: RollResult[], limit: number): void {
  const safeLimit = Number.isSafeInteger(limit) ? Math.min(Math.max(limit, 10), MAX_HISTORY) : DEFAULT_SETTINGS.historyLimit;
  const safeHistory = uniqueById(history.filter(isPersistedRollResult)).slice(0, safeLimit);
  writeJson(KEYS.history, safeHistory);
}

export function loadPresets(): DicePreset[] {
  const parsed = readJson<unknown>(KEYS.presets, []);
  const custom = Array.isArray(parsed)
    ? uniqueById(
        parsed
          .slice(0, MAX_CUSTOM_PRESETS)
          .filter(isPersistedPreset)
          .filter((item) => !item.id.startsWith('builtin-')),
      )
    : [];
  return [...BUILTIN_PRESETS, ...custom];
}

export function saveCustomPresets(presets: DicePreset[]): void {
  const custom = uniqueById(
    presets.filter(isPersistedPreset).filter((item) => !item.id.startsWith('builtin-')),
  ).slice(0, MAX_CUSTOM_PRESETS);
  writeJson(KEYS.presets, custom);
}

export function loadSettings(): DiceLabSettings {
  const parsed = readJson<unknown>(KEYS.settings, {});
  if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;
  const settings = parsed as Record<string, unknown>;
  const reducedMotion =
    typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : DEFAULT_SETTINGS.reducedMotion;
  return {
    theme:
      settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'system'
        ? settings.theme
        : DEFAULT_SETTINGS.theme,
    reducedMotion,
    animations: reducedMotion
      ? false
      : typeof settings.animations === 'boolean'
        ? settings.animations
        : DEFAULT_SETTINGS.animations,
    randomMode:
      settings.randomMode === 'secure' || settings.randomMode === 'seeded'
        ? settings.randomMode
        : DEFAULT_SETTINGS.randomMode,
    seed: typeof settings.seed === 'string' ? settings.seed.slice(0, 120) : DEFAULT_SETTINGS.seed,
    historyLimit:
      typeof settings.historyLimit === 'number' && Number.isSafeInteger(settings.historyLimit)
        ? Math.min(MAX_HISTORY, Math.max(10, settings.historyLimit))
        : DEFAULT_SETTINGS.historyLimit,
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

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
