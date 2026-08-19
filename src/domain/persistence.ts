import { selectKeptIndices } from './engine';
import { parseDiceExpression } from './parser';
import type { DicePreset, RollResult } from './types';

export const MAX_STORED_ROLL_SEED_LENGTH = 200;

export function isPersistedRollResult(value: unknown): value is RollResult {
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
    !isCanonicalIsoDate(roll.rolledAt) ||
    (roll.mode !== 'secure' && roll.mode !== 'seeded') ||
    (roll.seed !== undefined && (typeof roll.seed !== 'string' || roll.seed.length > MAX_STORED_ROLL_SEED_LENGTH)) ||
    (roll.mode === 'seeded' && typeof roll.seed !== 'string')
  ) {
    return false;
  }

  let expression: ReturnType<typeof parseDiceExpression>;
  try {
    expression = parseDiceExpression(roll.expression);
  } catch {
    return false;
  }
  if (roll.modifier !== expression.modifier || roll.dice.length !== expression.count) return false;

  const seenIndices = new Set<number>();
  const valuesByIndex = new Array<number>(expression.count);
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
      seenIndices.has(die.index)
    ) {
      return false;
    }
    seenIndices.add(die.index);
    valuesByIndex[die.index] = die.value;
  }

  const expectedKeptIndices = selectKeptIndices(valuesByIndex, expression);
  if (roll.dice.some((die) => die.kept !== expectedKeptIndices.has(die.index))) return false;

  const computedTotal = roll.dice.reduce((sum, die) => sum + (die.kept ? die.value : 0), expression.modifier);
  return computedTotal === roll.total;
}

export function isPersistedPreset(value: unknown): value is DicePreset {
  if (!value || typeof value !== 'object') return false;
  const preset = value as Partial<DicePreset>;
  if (
    typeof preset.id !== 'string' ||
    preset.id.length < 1 ||
    preset.id.length > 200 ||
    typeof preset.name !== 'string' ||
    preset.name.length < 1 ||
    preset.name.length > 80 ||
    typeof preset.expression !== 'string' ||
    typeof preset.createdAt !== 'string' ||
    !isCanonicalIsoDate(preset.createdAt) ||
    (preset.description !== undefined && (typeof preset.description !== 'string' || preset.description.length > 240))
  ) {
    return false;
  }
  try {
    parseDiceExpression(preset.expression);
    return true;
  } catch {
    return false;
  }
}

export function isCanonicalIsoDate(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}
