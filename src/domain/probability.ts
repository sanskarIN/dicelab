import { selectKeptIndices } from './engine';
import { parseDiceExpression } from './parser';
import type { DiceExpression, ProbabilityDistribution, ProbabilityPoint } from './types';

const MAX_DP_CELLS = 250_000;
const MAX_ENUMERATED_OUTCOMES = 2_000_000;

export type ProbabilityErrorCode =
  | 'distribution-too-large'
  | 'unsafe-outcome-count'
  | 'keep-drop-too-complex'
  | 'empty-distribution';

export interface ProbabilityErrorContext {
  limit?: number;
}

export class ProbabilityComplexityError extends Error {
  readonly code: ProbabilityErrorCode;
  readonly context: Readonly<ProbabilityErrorContext>;

  constructor(code: ProbabilityErrorCode, message: string, context: ProbabilityErrorContext = {}) {
    super(message);
    this.name = 'ProbabilityComplexityError';
    this.code = code;
    this.context = Object.freeze({ ...context });
  }
}

export function calculateProbability(input: string): ProbabilityDistribution {
  const expression = parseDiceExpression(input);
  return expression.selection ? enumerateSelectionDistribution(expression) : calculateSumDistribution(expression);
}

function calculateSumDistribution(expression: DiceExpression): ProbabilityDistribution {
  if (expression.count * expression.sides > MAX_DP_CELLS) {
    throw new ProbabilityComplexityError(
      'distribution-too-large',
      'This distribution is too large for the interactive exact calculator.',
      { limit: MAX_DP_CELLS },
    );
  }

  const totalOutcomes = Math.pow(expression.sides, expression.count);
  if (!Number.isSafeInteger(totalOutcomes)) {
    throw new ProbabilityComplexityError(
      'unsafe-outcome-count',
      'This expression has too many raw outcomes to preserve exact integer counts safely.',
      { limit: Number.MAX_SAFE_INTEGER },
    );
  }

  let ways = new Float64Array(1);
  ways[0] = 1;
  for (let die = 0; die < expression.count; die += 1) {
    const next = new Float64Array(ways.length + expression.sides);
    for (let subtotal = 0; subtotal < ways.length; subtotal += 1) {
      const subtotalWays = ways[subtotal];
      if (subtotalWays === 0) continue;
      for (let face = 1; face <= expression.sides; face += 1) {
        next[subtotal + face] += subtotalWays;
      }
    }
    ways = next;
  }

  const points: ProbabilityPoint[] = [];
  let expectedValue = 0;
  for (let subtotal = 0; subtotal < ways.length; subtotal += 1) {
    if (ways[subtotal] === 0) continue;
    const total = subtotal + expression.modifier;
    const probability = ways[subtotal] / totalOutcomes;
    points.push({ total, probability, ways: ways[subtotal] });
    expectedValue += total * probability;
  }

  return finishDistribution(expression, points, expectedValue, totalOutcomes);
}

function enumerateSelectionDistribution(expression: DiceExpression): ProbabilityDistribution {
  const totalOutcomes = Math.pow(expression.sides, expression.count);
  if (!Number.isFinite(totalOutcomes) || totalOutcomes > MAX_ENUMERATED_OUTCOMES) {
    throw new ProbabilityComplexityError(
      'keep-drop-too-complex',
      `Exact keep/drop calculation is limited to ${MAX_ENUMERATED_OUTCOMES.toLocaleString('en-US')} raw outcomes.`,
      { limit: MAX_ENUMERATED_OUTCOMES },
    );
  }

  const counts = new Map<number, number>();
  const values = new Array<number>(expression.count).fill(1);

  const visit = (depth: number): void => {
    if (depth === values.length) {
      const kept = selectKeptIndices(values, expression);
      const subtotal = values.reduce((sum, value, index) => sum + (kept.has(index) ? value : 0), 0);
      const total = subtotal + expression.modifier;
      counts.set(total, (counts.get(total) ?? 0) + 1);
      return;
    }
    for (let face = 1; face <= expression.sides; face += 1) {
      values[depth] = face;
      visit(depth + 1);
    }
  };
  visit(0);

  let expectedValue = 0;
  const points = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([total, ways]) => {
      const probability = ways / totalOutcomes;
      expectedValue += total * probability;
      return { total, probability, ways };
    });

  return finishDistribution(expression, points, expectedValue, totalOutcomes);
}

function finishDistribution(
  expression: DiceExpression,
  points: ProbabilityPoint[],
  expectedValue: number,
  totalOutcomes: number,
): ProbabilityDistribution {
  if (points.length === 0) {
    throw new ProbabilityComplexityError('empty-distribution', 'Probability calculation produced no outcomes.');
  }
  return {
    expression: expression.normalized,
    points,
    expectedValue,
    minimum: points[0].total,
    maximum: points[points.length - 1].total,
    exact: true,
    totalOutcomes,
  };
}
