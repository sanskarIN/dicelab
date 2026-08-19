import { rollExpression } from '../domain/engine';
import { DICE_LIMITS, DiceExpressionError } from '../domain/parser';
import { SecureRandomSource, SeededRandomSource } from '../domain/random';
import type { RandomMode, RollResult } from '../domain/types';
import { copy } from '../i18n';

interface NativeRollResult {
  expression: string;
  total: number;
  dice: RollResult['dice'];
  modifier: number;
}

const nativeErrorMessages: Record<string, () => string> = {
  ERR_INVALID_EXPRESSION: () => copy.errors.invalidExpression,
  ERR_DICE_COUNT: () => copy.errors.diceCount(DICE_LIMITS.maxDice),
  ERR_SIDES: () => copy.errors.sides(DICE_LIMITS.maxSides),
  ERR_MODIFIER: () => copy.errors.modifier(DICE_LIMITS.maxAbsModifier),
  ERR_SELECTION_COUNT: () => copy.errors.selectionAtLeastOne,
  ERR_KEEP_COUNT: () => copy.errors.keepCount,
  ERR_DROP_COUNT: () => copy.errors.dropCount,
  ERR_RANDOM_MODE: () => copy.app.rollFailed,
};

export async function rollDice(
  expression: string,
  mode: RandomMode,
  seed: string,
  sequence: number,
): Promise<RollResult> {
  const effectiveSeed = `${seed}:${sequence}`;
  if (isTauriRuntime()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const native = await invoke<NativeRollResult>('roll_expression', {
        expression,
        mode,
        seed: mode === 'seeded' ? effectiveSeed : null,
      });
      return {
        ...native,
        id: createId(),
        mode,
        seed: mode === 'seeded' ? effectiveSeed : undefined,
        rolledAt: new Date().toISOString(),
      };
    } catch (cause) {
      const code = extractNativeErrorCode(cause);
      throw new DiceExpressionError(nativeErrorMessages[code]?.() ?? copy.app.rollFailed);
    }
  }

  const random = mode === 'secure' ? new SecureRandomSource() : new SeededRandomSource(effectiveSeed);
  return rollExpression(expression, {
    random,
    mode,
    seed: mode === 'seeded' ? effectiveSeed : undefined,
  });
}

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function extractNativeErrorCode(cause: unknown): string {
  if (typeof cause === 'string') return cause;
  if (cause instanceof Error) return cause.message;
  if (cause && typeof cause === 'object' && 'message' in cause) {
    const message = (cause as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
}

function createId(): string {
  return typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
