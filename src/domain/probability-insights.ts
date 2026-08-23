import type { ProbabilityDistribution } from './types';

export interface ProbabilityInsights {
  median: number;
  modes: number[];
  variance: number;
  standardDeviation: number;
}

export interface ThresholdProbabilities {
  exactly: number;
  atMost: number;
  atLeast: number;
}

const PROBABILITY_EPSILON = 1e-12;

export function summarizeProbabilityDistribution(distribution: ProbabilityDistribution): ProbabilityInsights {
  let cumulative = 0;
  let median = distribution.minimum;
  let medianResolved = false;
  let variance = 0;
  let highestWays = -1;
  const modes: number[] = [];

  for (const point of distribution.points) {
    cumulative += point.probability;
    if (!medianResolved && cumulative + PROBABILITY_EPSILON >= 0.5) {
      median = point.total;
      medianResolved = true;
    }

    const distance = point.total - distribution.expectedValue;
    variance += distance * distance * point.probability;

    if (point.ways > highestWays) {
      highestWays = point.ways;
      modes.length = 0;
      modes.push(point.total);
    } else if (point.ways === highestWays) {
      modes.push(point.total);
    }
  }

  return {
    median,
    modes,
    variance: normalizeProbabilityArtifact(variance),
    standardDeviation: Math.sqrt(Math.max(0, variance)),
  };
}

export function getThresholdProbabilities(
  distribution: ProbabilityDistribution,
  threshold: number,
): ThresholdProbabilities {
  let exactly = 0;
  let atMost = 0;
  let atLeast = 0;

  for (const point of distribution.points) {
    if (point.total === threshold) exactly += point.probability;
    if (point.total <= threshold) atMost += point.probability;
    if (point.total >= threshold) atLeast += point.probability;
  }

  return {
    exactly: clampProbability(exactly),
    atMost: clampProbability(atMost),
    atLeast: clampProbability(atLeast),
  };
}

export function getQuantileTotal(distribution: ProbabilityDistribution, quantile: number): number {
  if (!Number.isFinite(quantile) || quantile < 0 || quantile > 1) {
    throw new RangeError('Quantile must be a finite number between 0 and 1.');
  }

  if (quantile === 0) return distribution.minimum;

  let cumulative = 0;
  for (const point of distribution.points) {
    cumulative += point.probability;
    if (cumulative + PROBABILITY_EPSILON >= quantile) return point.total;
  }

  return distribution.maximum;
}

function clampProbability(value: number): number {
  if (value <= PROBABILITY_EPSILON) return 0;
  if (value >= 1 - PROBABILITY_EPSILON) return 1;
  return value;
}

function normalizeProbabilityArtifact(value: number): number {
  return Math.abs(value) <= PROBABILITY_EPSILON ? 0 : value;
}
