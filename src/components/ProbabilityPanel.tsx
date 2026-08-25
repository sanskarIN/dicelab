import { Calculator, Sigma } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { compareProbabilityDistributions } from '../domain/probability-comparison';
import {
  getQuantileTotal,
  getThresholdProbabilities,
  summarizeProbabilityDistribution,
} from '../domain/probability-insights';
import { alignProbabilityDistributions } from '../domain/probability-overlay';
import { calculateProbability } from '../domain/probability';
import type { ProbabilityDistribution } from '../domain/types';
import { messages } from '../i18n';
import { formatDecimal, formatFixedDecimal, formatInteger } from '../i18n/format';
import { formatDomainError } from '../i18n/errors';

const examples = ['2d6', '1d20+5', '4d6kh3', '2d20kh1'];
const MAX_VISIBLE_POINTS = 180;
const MAX_VISIBLE_COMPARISON_POINTS = 120;

export function ProbabilityPanel() {
  const [expression, setExpression] = useState('2d6');
  const [distribution, setDistribution] = useState<ProbabilityDistribution>(() => calculateProbability('2d6'));
  const [threshold, setThreshold] = useState(7);
  const [comparisonExpression, setComparisonExpression] = useState('1d20');
  const [comparisonDistribution, setComparisonDistribution] = useState<ProbabilityDistribution>(() =>
    calculateProbability('1d20'),
  );
  const [error, setError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const visiblePoints = distribution.points.slice(0, MAX_VISIBLE_POINTS);
  const insights = useMemo(() => summarizeProbabilityDistribution(distribution), [distribution]);
  const quartiles = useMemo(
    () => ({
      lower: getQuantileTotal(distribution, 0.25),
      median: getQuantileTotal(distribution, 0.5),
      upper: getQuantileTotal(distribution, 0.75),
    }),
    [distribution],
  );
  const thresholdProbabilities = useMemo(
    () => getThresholdProbabilities(distribution, threshold),
    [distribution, threshold],
  );
  const comparison = useMemo(
    () => compareProbabilityDistributions(distribution, comparisonDistribution),
    [distribution, comparisonDistribution],
  );
  const comparisonOverlay = useMemo(
    () => alignProbabilityDistributions(distribution, comparisonDistribution),
    [distribution, comparisonDistribution],
  );
  const visibleComparisonPoints = comparisonOverlay.points.slice(0, MAX_VISIBLE_COMPARISON_POINTS);
  const comparisonMaxProbability = Math.max(comparisonOverlay.maximumProbability, Number.EPSILON);
  const maxProbability = useMemo(
    () => Math.max(...visiblePoints.map((point) => point.probability), Number.EPSILON),
    [visiblePoints],
  );

  const calculate = (event?: FormEvent) => {
    event?.preventDefault();
    try {
      const nextDistribution = calculateProbability(expression);
      setDistribution(nextDistribution);
      setThreshold(Math.round(nextDistribution.expectedValue));
      setError(null);
    } catch (cause) {
      setError(formatDomainError(cause, messages.probability.genericError));
    }
  };

  const calculateComparison = (event?: FormEvent) => {
    event?.preventDefault();
    try {
      setComparisonDistribution(calculateProbability(comparisonExpression));
      setComparisonError(null);
    } catch (cause) {
      setComparisonError(formatDomainError(cause, messages.probability.genericError));
    }
  };

  const changeThreshold = (rawValue: string) => {
    const next = Number(rawValue);
    if (!Number.isFinite(next)) return;
    setThreshold(Math.min(distribution.maximum, Math.max(distribution.minimum, Math.trunc(next))));
  };

  return (
    <section className="view-stack" aria-labelledby="probability-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{messages.probability.eyebrow}</p>
          <h1 id="probability-heading">{messages.probability.heading}</h1>
          <p>{messages.probability.intro}</p>
        </div>
      </header>

      <section className="panel probability-controls">
        <form onSubmit={calculate} className="probability-form">
          <label htmlFor="probability-expression">{messages.probability.expression}</label>
          <div className="expression-control">
            <Calculator size={20} aria-hidden="true" />
            <input
              id="probability-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              spellCheck={false}
            />
            <button type="submit" className="primary-button">{messages.probability.calculate}</button>
          </div>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
        </form>
        <div className="example-row" aria-label={messages.probability.examples}>
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => setExpression(example)}>{example}</button>
          ))}
        </div>
      </section>

      <div className="stats-grid">
        <ProbabilityStat label={messages.probability.expression} value={distribution.expression} />
        <ProbabilityStat label={messages.probability.expectedValue} value={formatFixedDecimal(distribution.expectedValue, 3)} />
        <ProbabilityStat label="P25" value={formatInteger(quartiles.lower)} />
        <ProbabilityStat label="P50" value={formatInteger(quartiles.median)} />
        <ProbabilityStat label="P75" value={formatInteger(quartiles.upper)} />
        <ProbabilityStat label="σ" value={formatFixedDecimal(insights.standardDeviation, 3)} />
        <ProbabilityStat label={messages.probability.range} value={`${formatInteger(distribution.minimum)}–${formatInteger(distribution.maximum)}`} />
        <ProbabilityStat label={messages.probability.outcomes} value={formatOutcomes(distribution.totalOutcomes)} />
      </div>

      <section className="panel probability-insights-panel" aria-labelledby="probability-threshold-heading">
        <div className="panel-heading probability-insights-heading">
          <div>
            <p className="eyebrow">P(X ≤ n) · P(X = n) · P(X ≥ n)</p>
            <h2 id="probability-threshold-heading">{distribution.expression}</h2>
          </div>
          <label className="threshold-control" htmlFor="probability-threshold">
            <span>n</span>
            <input
              id="probability-threshold"
              className="number-input"
              type="number"
              inputMode="numeric"
              min={distribution.minimum}
              max={distribution.maximum}
              step={1}
              value={threshold}
              onChange={(event) => changeThreshold(event.target.value)}
            />
          </label>
        </div>
        <div className="stats-grid probability-threshold-grid">
          <ProbabilityStat
            label={`P(X = ${formatInteger(threshold)})`}
            value={formatProbability(thresholdProbabilities.exactly)}
          />
          <ProbabilityStat
            label={`P(X ≤ ${formatInteger(threshold)})`}
            value={formatProbability(thresholdProbabilities.atMost)}
          />
          <ProbabilityStat
            label={`P(X ≥ ${formatInteger(threshold)})`}
            value={formatProbability(thresholdProbabilities.atLeast)}
          />
          <ProbabilityStat label="n" value={formatInteger(threshold)} />
        </div>
      </section>

      <section className="panel probability-insights-panel" aria-labelledby="probability-comparison-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">A: {distribution.expression} · B: {comparisonDistribution.expression}</p>
            <h2 id="probability-comparison-heading">P(A &gt; B) · P(A = B) · P(A &lt; B)</h2>
          </div>
        </div>
        <form onSubmit={calculateComparison} className="probability-form">
          <label htmlFor="probability-comparison-expression">B</label>
          <div className="expression-control">
            <Calculator size={20} aria-hidden="true" />
            <input
              id="probability-comparison-expression"
              value={comparisonExpression}
              onChange={(event) => setComparisonExpression(event.target.value)}
              spellCheck={false}
            />
            <button type="submit" className="primary-button" aria-label="A ↔ B">A ↔ B</button>
          </div>
          {comparisonError ? <p className="field-error" role="alert">{comparisonError}</p> : null}
        </form>
        <div
          className="comparison-meter"
          role="img"
          aria-label={`P(A > B) ${formatProbability(comparison.leftHigher)}; P(A = B) ${formatProbability(comparison.tie)}; P(A < B) ${formatProbability(comparison.rightHigher)}`}
        >
          <span className="comparison-meter-higher" style={{ flexBasis: `${comparison.leftHigher * 100}%` }} />
          <span className="comparison-meter-tie" style={{ flexBasis: `${comparison.tie * 100}%` }} />
          <span className="comparison-meter-lower" style={{ flexBasis: `${comparison.rightHigher * 100}%` }} />
        </div>
        <div className="comparison-legend" aria-hidden="true">
          <span><i className="comparison-dot higher" />A &gt; B</span>
          <span><i className="comparison-dot tie" />A = B</span>
          <span><i className="comparison-dot lower" />A &lt; B</span>
        </div>
        <div className="stats-grid probability-threshold-grid">
          <ProbabilityStat label="P(A > B)" value={formatProbability(comparison.leftHigher)} />
          <ProbabilityStat label="P(A = B)" value={formatProbability(comparison.tie)} />
          <ProbabilityStat label="P(A < B)" value={formatProbability(comparison.rightHigher)} />
          <ProbabilityStat label="ΔE(A − B)" value={formatSignedDecimal(comparison.expectedDelta)} />
        </div>

        <section className="comparison-overlay" aria-labelledby="probability-overlay-heading">
          <div className="comparison-overlay-heading">
            <div>
              <p className="eyebrow">{messages.probability.comparisonOverlay}</p>
              <h3 id="probability-overlay-heading">A {distribution.expression} ↔ B {comparisonDistribution.expression}</h3>
            </div>
            <div className="comparison-overlay-legend" aria-hidden="true">
              <span><i className="comparison-dot overlay-left" />A</span>
              <span><i className="comparison-dot overlay-right" />B</span>
              <span>ΔP</span>
            </div>
          </div>
          <div
            className="comparison-overlay-rows"
            role="img"
            aria-label={messages.probability.comparisonOverlayLabel(
              distribution.expression,
              comparisonDistribution.expression,
            )}
          >
            {visibleComparisonPoints.map((point) => (
              <div className="comparison-overlay-row" data-total={point.total} key={point.total}>
                <strong>{formatInteger(point.total)}</strong>
                <div className="comparison-overlay-track" aria-hidden="true">
                  <span
                    className="comparison-overlay-left"
                    style={{ width: `${(point.leftProbability / comparisonMaxProbability) * 100}%` }}
                  />
                  <span
                    className="comparison-overlay-right"
                    style={{ width: `${(point.rightProbability / comparisonMaxProbability) * 100}%` }}
                  />
                </div>
                <span className="comparison-overlay-delta">{formatProbabilityDelta(point.probabilityDelta)}</span>
              </div>
            ))}
          </div>
          {comparisonOverlay.points.length > MAX_VISIBLE_COMPARISON_POINTS ? (
            <p className="panel-note">
              {messages.probability.comparisonTruncated(
                MAX_VISIBLE_COMPARISON_POINTS,
                comparisonOverlay.points.length,
              )}
            </p>
          ) : null}
        </section>
      </section>

      <section className="panel probability-chart" aria-labelledby="probability-chart-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{messages.probability.distribution}</p>
            <h2 id="probability-chart-heading">{messages.probability.chartHeading}</h2>
          </div>
          <span><Sigma size={15} aria-hidden="true" /> {messages.probability.exactCalculation}</span>
        </div>
        <div className="probability-rows">
          {visiblePoints.map((point) => (
            <div className="probability-row" key={point.total}>
              <strong>{formatInteger(point.total)}</strong>
              <div className="probability-track" aria-hidden="true">
                <span style={{ width: `${(point.probability / maxProbability) * 100}%` }} />
              </div>
              <span>{formatFixedDecimal(point.probability * 100, point.probability < 0.001 ? 4 : 2)}%</span>
            </div>
          ))}
        </div>
        {distribution.points.length > MAX_VISIBLE_POINTS ? (
          <p className="panel-note">
            {messages.probability.truncated(MAX_VISIBLE_POINTS, distribution.points.length)}
          </p>
        ) : null}
      </section>
    </section>
  );
}

function ProbabilityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatOutcomes(value: number): string {
  if (!Number.isFinite(value)) return messages.probability.veryLarge;
  if (value >= 1_000_000_000) return value.toExponential(3);
  return formatInteger(value);
}

function formatProbability(value: number): string {
  const percent = value * 100;
  return `${formatDecimal(percent, percent > 0 && percent < 0.01 ? 4 : 2)}%`;
}

function formatProbabilityDelta(value: number): string {
  const percentagePoints = value * 100;
  const formatted = formatDecimal(percentagePoints, Math.abs(percentagePoints) < 0.01 && percentagePoints !== 0 ? 4 : 2);
  return `${percentagePoints > 0 ? '+' : ''}${formatted} pp`;
}

function formatSignedDecimal(value: number): string {
  const formatted = formatFixedDecimal(value, 3);
  return value > 0 ? `+${formatted}` : formatted;
}
