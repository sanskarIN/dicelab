import { parseDiceExpression } from './parser';
import type { RandomSource } from './random';
import type { DiceExpression, DieRoll, RandomMode, RollResult } from './types';

export interface RollOptions {
  random: RandomSource;
  mode: RandomMode;
  seed?: string;
  now?: Date;
  id?: string;
}

export function rollExpression(input: string, options: RollOptions): RollResult {
  return rollParsedExpression(parseDiceExpression(input), options);
}

export function rollParsedExpression(expression: DiceExpression, options: RollOptions): RollResult {
  const rawValues = Array.from({ length: expression.count }, () => options.random.nextInt(expression.sides) + 1);
  const keptIndices = selectKeptIndices(rawValues, expression);
  const dice: DieRoll[] = rawValues.map((value, index) => ({ value, index, kept: keptIndices.has(index) }));
  const subtotal = dice.reduce((sum, die) => sum + (die.kept ? die.value : 0), 0);

  return {
    id: options.id ?? createId(),
    expression: expression.normalized,
    total: subtotal + expression.modifier,
    dice,
    modifier: expression.modifier,
    mode: options.mode,
    seed: options.mode === 'seeded' ? options.seed : undefined,
    rolledAt: (options.now ?? new Date()).toISOString(),
  };
}

export function selectKeptIndices(values: number[], expression: DiceExpression): Set<number> {
  const all = new Set(values.map((_, index) => index));
  if (!expression.selection) return all;

  const ranked = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);
  const { kind, count } = expression.selection;

  if (kind === 'keep-lowest') return new Set(ranked.slice(0, count).map(({ index }) => index));
  if (kind === 'keep-highest') return new Set(ranked.slice(-count).map(({ index }) => index));
  if (kind === 'drop-lowest') {
    const dropped = new Set(ranked.slice(0, count).map(({ index }) => index));
    return new Set([...all].filter((index) => !dropped.has(index)));
  }

  const dropped = new Set(ranked.slice(-count).map(({ index }) => index));
  return new Set([...all].filter((index) => !dropped.has(index)));
}

function createId(): string {
  return typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
