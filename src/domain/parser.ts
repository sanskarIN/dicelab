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

export type DiceExpressionErrorCode =
  | 'invalid-format'
  | 'dice-count-out-of-range'
  | 'side-count-out-of-range'
  | 'modifier-out-of-range'
  | 'selection-count-too-small'
  | 'keep-count-exceeds-dice'
  | 'drop-count-removes-all';

export interface DiceExpressionErrorContext {
  min?: number;
  max?: number;
}

export class DiceExpressionError extends Error {
  readonly code: DiceExpressionErrorCode;
  readonly context: Readonly<DiceExpressionErrorContext>;

  constructor(code: DiceExpressionErrorCode, message: string, context: DiceExpressionErrorContext = {}) {
    super(message);
    this.name = 'DiceExpressionError';
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

export function parseDiceExpression(input: string): DiceExpression {
  const match = EXPRESSION_PATTERN.exec(input);
  if (!match) {
    throw new DiceExpressionError('invalid-format', 'Use an expression such as 2d6+3, 4d6kh3, or 1d20.');
  }

  const [, rawCount, rawSides, rawSelection, rawSelectionCount, rawModifier] = match;
  const count = rawCount ? Number.parseInt(rawCount, 10) : 1;
  const sides = Number.parseInt(rawSides, 10);
  const modifier = rawModifier ? Number.parseInt(rawModifier.replace(/\s+/g, ''), 10) : 0;

  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_DICE) {
    throw new DiceExpressionError(
      'dice-count-out-of-range',
      `Dice count must be between 1 and ${MAX_DICE}.`,
      { min: 1, max: MAX_DICE },
    );
  }
  if (!Number.isSafeInteger(sides) || sides < 2 || sides > MAX_SIDES) {
    throw new DiceExpressionError(
      'side-count-out-of-range',
      `Sides must be between 2 and ${MAX_SIDES.toLocaleString('en-US')}.`,
      { min: 2, max: MAX_SIDES },
    );
  }
  if (!Number.isSafeInteger(modifier) || Math.abs(modifier) > MAX_ABS_MODIFIER) {
    throw new DiceExpressionError(
      'modifier-out-of-range',
      `Modifier magnitude must not exceed ${MAX_ABS_MODIFIER.toLocaleString('en-US')}.`,
      { max: MAX_ABS_MODIFIER },
    );
  }

  let selection: DiceSelection | undefined;
  if (rawSelection && rawSelectionCount) {
    const selectionCount = Number.parseInt(rawSelectionCount, 10);
    if (!Number.isSafeInteger(selectionCount) || selectionCount < 1) {
      throw new DiceExpressionError(
        'selection-count-too-small',
        'Keep/drop count must be at least 1.',
        { min: 1 },
      );
    }

    const kind = selectionKinds[rawSelection.toLowerCase()];
    const isKeep = kind === 'keep-highest' || kind === 'keep-lowest';
    if (isKeep && selectionCount > count) {
      throw new DiceExpressionError(
        'keep-count-exceeds-dice',
        'Keep count cannot exceed the number of dice.',
        { max: count },
      );
    }
    if (!isKeep && selectionCount >= count) {
      throw new DiceExpressionError(
        'drop-count-removes-all',
        'Drop count must leave at least one die.',
        { max: count - 1 },
      );
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
  const modifier = expression.modifier === 0 ? '' : expression.modifier > 0 ? `+${expression.modifier}` : `${expression.modifier}`;
  return `${expression.count}d${expression.sides}${selection}${modifier}`;
}
