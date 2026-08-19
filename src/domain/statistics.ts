import type { RollResult } from './types';

export interface RollStatistics {
  count: number;
  minimum: number | null;
  maximum: number | null;
  mean: number | null;
  median: number | null;
  frequencies: Array<{ total: number; count: number; percentage: number }>;
}

export function summarizeRolls(history: RollResult[]): RollStatistics {
  if (history.length === 0) {
    return { count: 0, minimum: null, maximum: null, mean: null, median: null, frequencies: [] };
  }

  const totals = history.map((roll) => roll.total).sort((a, b) => a - b);
  const sum = totals.reduce((accumulator, total) => accumulator + total, 0);
  const middle = Math.floor(totals.length / 2);
  const median = totals.length % 2 === 0 ? (totals[middle - 1] + totals[middle]) / 2 : totals[middle];
  const frequencyMap = new Map<number, number>();
  for (const total of totals) frequencyMap.set(total, (frequencyMap.get(total) ?? 0) + 1);

  return {
    count: totals.length,
    minimum: totals[0],
    maximum: totals[totals.length - 1],
    mean: sum / totals.length,
    median,
    frequencies: [...frequencyMap.entries()].map(([total, count]) => ({
      total,
      count,
      percentage: (count / totals.length) * 100,
    })),
  };
}
