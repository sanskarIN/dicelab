import { copy } from '../i18n';
import type { DiceExpression, DiceSelection, SelectionKind } from './types';

const MAX_DICE = 1_000;
const MAX_SIDES = 1_000_000;
const MAX_ABS_MODIFIER = 1_000_000_000;
const EXPRESSION_PATTERN = /^\s*(\d*)d(\d+)(?:(kh|kl|dh|dl)(\d+))?\s*([+-]\s*\d+)?\s*$/i;

const selectionKinds: Record<string, SelectionKind> = {
  kh: 'keep-highest',
  kl: 'keep-lowest',
  dh: 'drop-highest',
  dl: 'drop-lowest',
};

export class DiceExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiceExpressionError';
  }
}

export function parseDiceExpression(input: string): DiceExpression {
  const match = EXPRESSION_PATTERN.exec(input);
  if (!match) {
    throw new DiceExpressionError(copy.errors.invalidExpression);
  }

  const [, rawCount, rawSides, rawSelection, rawSelectionCount, rawModifier] = match;
  const count = rawCount ? Number.parseInt(rawCount, 10) : 1;
  const sides = Number.parseInt(rawSides, 10);
  const modifier = rawModifier ? Number.parseInt(rawModifier.replace(/\s+/g, ''), 10) : 0;

  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_DICE) {
    throw new DiceExpressionError(copy.errors.diceCount(MAX_DICE));
  }
  if (!Number.isSafeInteger(sides) || sides < 2 || sides > MAX_SIDES) {
    throw new DiceExpressionError(copy.errors.sides(MAX_SIDES));
  }
  if (!Number.isSafeInteger(modifier) || Math.abs(modifier) > MAX_ABS_MODIFIER) {
    throw new DiceExpressionError(copy.errors.modifier(MAX_ABS_MODIFIER));
  }

  let selection: DiceSelection | undefined;
  if (rawSelection && rawSelectionCount) {
    const selectionCount = Number.parseInt(rawSelectionCount, 10);
    if (!Number.isSafeInteger(selectionCount) || selectionCount < 1) {
      throw new DiceExpressionError(copy.errors.selectionAtLeastOne);
    }

    const kind = selectionKinds[rawSelection.toLowerCase()];
    const isKeep = kind === 'keep-highest' || kind === 'keep-lowest';
    if ((isKeep && selectionCount > count) || (!isKeep && selectionCount >= count)) {
      throw new DiceExpressionError(isKeep ? copy.errors.keepCount : copy.errors.dropCount);
    }
    selection = { kind, count: selectionCount };
  }

  return {
    count,
    sides,
    modifier,
    selection,
    normalized: formatDiceExpression({ count, sides, modifier, selection }),
  };
}

export function formatDiceExpression(expression: Omit<DiceExpression, 'normalized'>): string {
  const selectionCode: Record<SelectionKind, string> = {
    'keep-highest': 'kh',
    'keep-lowest': 'kl',
    'drop-highest': 'dh',
    'drop-lowest': 'dl',
  };
  const selection = expression.selection
    ? `${selectionCode[expression.selection.kind]}${expression.selection.count}`
    : '';
  const modifier =
    expression.modifier === 0 ? '' : expression.modifier > 0 ? `+${expression.modifier}` : `${expression.modifier}`;
  return `${expression.count}d${expression.sides}${selection}${modifier}`;
}
