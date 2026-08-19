import { Calculator, Sigma } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { calculateProbability } from '../domain/probability';
import type { ProbabilityDistribution } from '../domain/types';
import { copy } from '../i18n';

const examples = ['2d6', '1d20+5', '4d6kh3', '2d20kh1'];
const MAX_VISIBLE_POINTS = 180;

export function ProbabilityPanel() {
  const [expression, setExpression] = useState('2d6');
  const [distribution, setDistribution] = useState<ProbabilityDistribution>(() => calculateProbability('2d6'));
  const [error, setError] = useState<string | null>(null);
  const visiblePoints = distribution.points.slice(0, MAX_VISIBLE_POINTS);
  const maxProbability = useMemo(
    () => Math.max(...visiblePoints.map((point) => point.probability), Number.EPSILON),
    [visiblePoints],
  );

  const calculate = (event?: FormEvent) => {
    event?.preventDefault();
    try {
      setDistribution(calculateProbability(expression));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.probability.unable);
    }
  };

  return (
    <section className="view-stack" aria-labelledby="probability-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{copy.probability.eyebrow}</p>
          <h1 id="probability-heading">{copy.probability.title}</h1>
          <p>{copy.probability.description}</p>
        </div>
      </header>

      <section className="panel probability-controls">
        <form onSubmit={calculate} className="probability-form">
          <label htmlFor="probability-expression">{copy.probability.expressionLabel}</label>
          <div className="expression-control">
            <Calculator size={20} aria-hidden="true" />
            <input
              id="probability-expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              spellCheck={false}
            />
            <button type="submit" className="primary-button">
              {copy.probability.calculate}
            </button>
          </div>
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
        <div className="example-row" aria-label={copy.probability.examplesLabel}>
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => setExpression(example)}>
              {example}
            </button>
          ))}
        </div>
      </section>

      <div className="stats-grid">
        <ProbabilityStat label={copy.probability.expression} value={distribution.expression} />
        <ProbabilityStat label={copy.probability.expectedValue} value={distribution.expectedValue.toFixed(3)} />
        <ProbabilityStat label={copy.probability.range} value={`${distribution.minimum}–${distribution.maximum}`} />
        <ProbabilityStat label={copy.probability.outcomes} value={formatOutcomes(distribution.totalOutcomes)} />
      </div>

      <section className="panel probability-chart" aria-labelledby="probability-chart-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{copy.probability.chartEyebrow}</p>
            <h2 id="probability-chart-heading">{copy.probability.chartTitle}</h2>
          </div>
          <span>
            <Sigma size={15} aria-hidden="true" /> {copy.probability.exact}
          </span>
        </div>
        <div className="probability-rows">
          {visiblePoints.map((point) => (
            <div className="probability-row" key={point.total}>
              <strong>{point.total}</strong>
              <div className="probability-track" aria-hidden="true">
                <span style={{ width: `${(point.probability / maxProbability) * 100}%` }} />
              </div>
              <span>{(point.probability * 100).toFixed(point.probability < 0.001 ? 4 : 2)}%</span>
            </div>
          ))}
        </div>
        {distribution.points.length > MAX_VISIBLE_POINTS ? (
          <p className="panel-note">{copy.probability.tooManyPoints(MAX_VISIBLE_POINTS, distribution.points.length)}</p>
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
  if (!Number.isFinite(value)) return copy.probability.veryLarge;
  if (value >= 1_000_000_000) return value.toExponential(3);
  return value.toLocaleString('en-US');
}
