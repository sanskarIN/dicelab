import type { ProbabilityDistribution } from './types';

export interface ProbabilityComparison {
  leftHigher: number;
  tie: number;
  rightHigher: number;
  expectedDelta: number;
}

const PROBABILITY_EPSILON = 1e-12;

export function compareProbabilityDistributions(
  left: ProbabilityDistribution,
  right: ProbabilityDistribution,
): ProbabilityComparison {
  let rightIndex = 0;
  let rightBelow = 0;
  let leftHigher = 0;
  let tie = 0;

  for (const leftPoint of left.points) {
    while (rightIndex < right.points.length && right.points[rightIndex].total < leftPoint.total) {
      rightBelow += right.points[rightIndex].probability;
      rightIndex += 1;
    }

    let equalProbability = 0;
    let equalIndex = rightIndex;
    while (equalIndex < right.points.length && right.points[equalIndex].total === leftPoint.total) {
      equalProbability += right.points[equalIndex].probability;
      equalIndex += 1;
    }

    leftHigher += leftPoint.probability * rightBelow;
    tie += leftPoint.probability * equalProbability;
  }

  leftHigher = clampProbability(leftHigher);
  tie = clampProbability(tie);
  const rightHigher = clampProbability(1 - leftHigher - tie);

  return {
    leftHigher,
    tie,
    rightHigher,
    expectedDelta: left.expectedValue - right.expectedValue,
  };
}

function clampProbability(value: number): number {
  if (value <= PROBABILITY_EPSILON) return 0;
  if (value >= 1 - PROBABILITY_EPSILON) return 1;
  return value;
}
