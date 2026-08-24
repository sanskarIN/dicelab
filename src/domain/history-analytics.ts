import type { RollResult } from './types';

export interface ExpressionHistorySummary {
  expression: string;
  count: number;
  percentage: number;
  mean: number;
  minimum: number;
  maximum: number;
  lastRolledAt: string;
}

interface MutableExpressionSummary {
  expression: string;
  count: number;
  total: number;
  minimum: number;
  maximum: number;
  lastRolledAt: string;
}

export function summarizeHistoryByExpression(history: RollResult[]): ExpressionHistorySummary[] {
  if (!history.length) return [];

  const grouped = new Map<string, MutableExpressionSummary>();
  for (const roll of history) {
    const current = grouped.get(roll.expression);
    if (!current) {
      grouped.set(roll.expression, {
        expression: roll.expression,
        count: 1,
        total: roll.total,
        minimum: roll.total,
        maximum: roll.total,
        lastRolledAt: roll.rolledAt,
      });
      continue;
    }

    current.count += 1;
    current.total += roll.total;
    current.minimum = Math.min(current.minimum, roll.total);
    current.maximum = Math.max(current.maximum, roll.total);
    if (roll.rolledAt > current.lastRolledAt) current.lastRolledAt = roll.rolledAt;
  }

  return [...grouped.values()]
    .map<ExpressionHistorySummary>((summary) => ({
      expression: summary.expression,
      count: summary.count,
      percentage: (summary.count / history.length) * 100,
      mean: summary.total / summary.count,
      minimum: summary.minimum,
      maximum: summary.maximum,
      lastRolledAt: summary.lastRolledAt,
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        right.lastRolledAt.localeCompare(left.lastRolledAt) ||
        left.expression.localeCompare(right.expression),
    );
}
