import type { RollResult } from './types';

export function filterRollHistory(history: readonly RollResult[], query: string): RollResult[] {
  const normalized = query.trim().toLocaleLowerCase('en-US');
  if (!normalized) return [...history];

  return history.filter(
    (roll) =>
      roll.expression.toLocaleLowerCase('en-US').includes(normalized) ||
      String(roll.total).includes(normalized),
  );
}
