import { DEFAULT_SETTINGS, type DiceLabSettings, type DicePreset, type RollResult } from '../domain/types';

const KEYS = {
  history: 'dicelab.history.v1',
  presets: 'dicelab.presets.v1',
  settings: 'dicelab.settings.v1',
  onboarded: 'dicelab.onboarded.v1',
} as const;

export const BUILTIN_PRESETS: DicePreset[] = [
  preset('builtin-d20', 'D20 check', '1d20', 'A standard tabletop check.'),
  preset('builtin-advantage', 'Advantage', '2d20kh1', 'Roll two d20 and keep the highest.'),
  preset('builtin-disadvantage', 'Disadvantage', '2d20kl1', 'Roll two d20 and keep the lowest.'),
  preset('builtin-ability', 'Ability score', '4d6kh3', 'Classic roll-four-drop-lowest equivalent.'),
  preset('builtin-fireball', 'Fireball', '8d6', 'A familiar multi-die damage roll.'),
  preset('builtin-percentile', 'Percentile', '1d100', 'A d100 percentile roll.'),
];

export function loadHistory(): RollResult[] {
  const parsed = readJson<unknown>(KEYS.history, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isRollResult);
}

export function saveHistory(history: RollResult[], limit: number): void {
  const safeLimit = Number.isSafeInteger(limit) ? Math.min(Math.max(limit, 10), 5_000) : DEFAULT_SETTINGS.historyLimit;
  writeJson(KEYS.history, history.slice(0, safeLimit));
}

export function loadPresets(): DicePreset[] {
  const parsed = readJson<unknown>(KEYS.presets, []);
  const custom = Array.isArray(parsed) ? parsed.filter(isPreset) : [];
  return [...BUILTIN_PRESETS, ...custom];
}

export function saveCustomPresets(presets: DicePreset[]): void {
  writeJson(KEYS.presets, presets.filter((item) => !item.id.startsWith('builtin-')));
}

export function loadSettings(): DiceLabSettings {
  const parsed = readJson<Partial<DiceLabSettings>>(KEYS.settings, {});
  return {
    ...DEFAULT_SETTINGS,
    ...(parsed && typeof parsed === 'object' ? parsed : {}),
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

function isRollResult(value: unknown): value is RollResult {
  if (!value || typeof value !== 'object') return false;
  const roll = value as Partial<RollResult>;
  return (
    typeof roll.id === 'string' &&
    typeof roll.expression === 'string' &&
    typeof roll.total === 'number' &&
    Array.isArray(roll.dice) &&
    typeof roll.rolledAt === 'string' &&
    (roll.mode === 'secure' || roll.mode === 'seeded')
  );
}

function isPreset(value: unknown): value is DicePreset {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<DicePreset>;
  return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.expression === 'string';
}
