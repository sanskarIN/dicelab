import { Download, FileJson, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { summarizeRolls } from '../domain/statistics';
import type { RollResult } from '../domain/types';
import { downloadText, historyToCsv, historyToJson } from '../services/export';

interface HistoryPanelProps {
  history: RollResult[];
  onClear: () => void;
}

export function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return history;
    return history.filter(
      (roll) => roll.expression.toLowerCase().includes(normalized) || String(roll.total).includes(normalized),
    );
  }, [history, query]);
  const stats = useMemo(() => summarizeRolls(filtered), [filtered]);
  const maxFrequency = Math.max(1, ...stats.frequencies.map((item) => item.count));

  const clear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClear();
    setConfirmClear(false);
  };

  return (
    <section className="view-stack" aria-labelledby="history-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">Local roll log</p>
          <h1 id="history-heading">History & statistics</h1>
          <p>Review results, inspect distributions, and export your local roll data.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-button" disabled={!filtered.length} onClick={() => downloadText('dicelab-rolls.csv', historyToCsv(filtered), 'text/csv')}>
            <Download size={16} aria-hidden="true" /> CSV
          </button>
          <button type="button" className="secondary-button" disabled={!filtered.length} onClick={() => downloadText('dicelab-rolls.json', historyToJson(filtered), 'application/json')}>
            <FileJson size={16} aria-hidden="true" /> JSON
          </button>
        </div>
      </header>

      <div className="stats-grid" aria-label="Roll summary">
        <StatCard label="Rolls" value={String(stats.count)} />
        <StatCard label="Average" value={stats.mean === null ? '—' : stats.mean.toFixed(2)} />
        <StatCard label="Median" value={stats.median === null ? '—' : String(stats.median)} />
        <StatCard label="Range" value={stats.minimum === null ? '—' : `${stats.minimum}–${stats.maximum}`} />
      </div>

      <section className="panel history-toolbar-panel">
        <div className="search-control">
          <Search size={18} aria-hidden="true" />
          <input aria-label="Filter roll history" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by expression or total" />
        </div>
        <button type="button" className={confirmClear ? 'danger-button confirm' : 'danger-button'} disabled={!history.length} onClick={clear} onBlur={() => setConfirmClear(false)}>
          <Trash2 size={16} aria-hidden="true" /> {confirmClear ? 'Click again to clear' : 'Clear history'}
        </button>
      </section>

      {filtered.length ? (
        <>
          <section className="panel histogram-panel" aria-labelledby="histogram-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Observed totals</p>
                <h2 id="histogram-heading">Distribution</h2>
              </div>
              <span>{stats.frequencies.length} distinct totals</span>
            </div>
            <div className="histogram" role="img" aria-label="Histogram of observed roll totals">
              {stats.frequencies.map((item) => (
                <div className="histogram-column" key={item.total} title={`${item.total}: ${item.count} rolls (${item.percentage.toFixed(1)}%)`}>
                  <span className="histogram-value">{item.count}</span>
                  <span className="histogram-bar" style={{ height: `${Math.max(8, (item.count / maxFrequency) * 100)}%` }} />
                  <span className="histogram-label">{item.total}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel history-list" aria-label="Roll history entries">
            {filtered.map((roll) => (
              <article className="history-row" key={roll.id}>
                <div className="history-total">{roll.total}</div>
                <div className="history-meta">
                  <strong>{roll.expression}</strong>
                  <span>{roll.dice.map((die) => `${die.value}${die.kept ? '' : '×'}`).join(' · ')}</span>
                </div>
                <div className="history-time">
                  <span>{roll.mode === 'secure' ? 'Secure' : 'Seeded'}</span>
                  <time dateTime={roll.rolledAt}>{new Date(roll.rolledAt).toLocaleString()}</time>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <div className="panel empty-state large">
          <Search size={32} aria-hidden="true" />
          <h2>{history.length ? 'No matching rolls' : 'No rolls yet'}</h2>
          <p>{history.length ? 'Try a different expression or total.' : 'Roll some dice and your local history will appear here.'}</p>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
