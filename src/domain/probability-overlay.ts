import type { ProbabilityDistribution } from './types';

export interface ProbabilityOverlayPoint {
  total: number;
  leftProbability: number;
  rightProbability: number;
  probabilityDelta: number;
}

export interface ProbabilityOverlay {
  points: ProbabilityOverlayPoint[];
  maximumProbability: number;
  maximumAbsoluteDelta: number;
}

export function alignProbabilityDistributions(
  left: ProbabilityDistribution,
  right: ProbabilityDistribution,
): ProbabilityOverlay {
  const points: ProbabilityOverlayPoint[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  let maximumProbability = 0;
  let maximumAbsoluteDelta = 0;

  while (leftIndex < left.points.length || rightIndex < right.points.length) {
    const leftPoint = left.points[leftIndex];
    const rightPoint = right.points[rightIndex];
    const leftTotal = leftPoint?.total ?? Number.POSITIVE_INFINITY;
    const rightTotal = rightPoint?.total ?? Number.POSITIVE_INFINITY;
    const total = Math.min(leftTotal, rightTotal);

    const leftProbability = leftTotal === total ? leftPoint.probability : 0;
    const rightProbability = rightTotal === total ? rightPoint.probability : 0;
    const probabilityDelta = leftProbability - rightProbability;

    points.push({ total, leftProbability, rightProbability, probabilityDelta });
    maximumProbability = Math.max(maximumProbability, leftProbability, rightProbability);
    maximumAbsoluteDelta = Math.max(maximumAbsoluteDelta, Math.abs(probabilityDelta));

    if (leftTotal === total) leftIndex += 1;
    if (rightTotal === total) rightIndex += 1;
  }

  return { points, maximumProbability, maximumAbsoluteDelta };
}
