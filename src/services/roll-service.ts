import { rollExpression } from '../domain/engine';
import { SecureRandomSource, SeededRandomSource } from '../domain/random';
import type { RandomMode, RollResult } from '../domain/types';

interface NativeRollResult {
  expression: string;
  total: number;
  dice: RollResult['dice'];
  modifier: number;
}

export async function rollDice(
  expression: string,
  mode: RandomMode,
  seed: string,
  sequence: number,
): Promise<RollResult> {
  const effectiveSeed = `${seed}:${sequence}`;
  if (isTauriRuntime()) {
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

function createId(): string {
  return typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
