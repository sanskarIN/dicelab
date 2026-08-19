import { Download, FileJson, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { filterRollHistory } from '../domain/history';
import { summarizeRolls } from '../domain/statistics';
import type { RollResult } from '../domain/types';
import { messages } from '../i18n';
import { formatDateTime, formatDecimal, formatFixedDecimal, formatInteger } from '../i18n/format';
import { historyToCsv, historyToJson, saveTextExport, type TextExportFormat } from '../services/export';

interface HistoryPanelProps {
  history: RollResult[];
  onClear: () => void;
}

const INITIAL_VISIBLE_HISTORY = 200;
const HISTORY_PAGE_SIZE = 200;

export function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE_HISTORY);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const filtered = useMemo(() => filterRollHistory(history, query), [history, query]);
  const visibleHistory = filtered.slice(0, visibleLimit);
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

  const exportHistory = async (
    filename: string,
    contents: string,
    mimeType: string,
    format: TextExportFormat,
  ) => {
    setExportStatus(null);
    try {
      const saved = await saveTextExport(filename, contents, mimeType, format);
      if (saved) setExportStatus(messages.history.exportSuccess);
    } catch {
      setExportStatus(messages.history.exportFailed);
    }
  };

  return (
    <section className="view-stack" aria-labelledby="history-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{messages.history.eyebrow}</p>
          <h1 id="history-heading">{messages.history.heading}</h1>
          <p>{messages.history.intro}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={!filtered.length}
            onClick={() => void exportHistory('dicelab-rolls.csv', historyToCsv(filtered), 'text/csv', 'csv')}
          >
            <Download size={16} aria-hidden="true" /> {messages.history.csv}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!filtered.length}
            onClick={() =>
              void exportHistory('dicelab-rolls.json', historyToJson(filtered), 'application/json', 'json')
            }
          >
            <FileJson size={16} aria-hidden="true" /> {messages.history.json}
          </button>
        </div>
      </header>

      {exportStatus ? (
        <p className="panel-note" role="status">
          {exportStatus}
        </p>
      ) : null}

      <div className="stats-grid" aria-label={messages.history.summaryLabel}>
        <StatCard label={messages.history.rolls} value={formatInteger(stats.count)} />
        <StatCard label={messages.history.average} value={stats.mean === null ? '—' : formatFixedDecimal(stats.mean, 2)} />
        <StatCard label={messages.history.median} value={stats.median === null ? '—' : formatDecimal(stats.median, 2)} />
        <StatCard
          label={messages.history.range}
          value={stats.minimum === null ? '—' : `${formatInteger(stats.minimum)}–${formatInteger(stats.maximum ?? stats.minimum)}`}
        />
      </div>

      <section className="panel history-toolbar-panel">
        <div className="search-control">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label={messages.history.filterLabel}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleLimit(INITIAL_VISIBLE_HISTORY);
            }}
            placeholder={messages.history.filterPlaceholder}
          />
        </div>
        <button
          type="button"
          className={confirmClear ? 'danger-button confirm' : 'danger-button'}
          disabled={!history.length}
          onClick={clear}
          onBlur={() => setConfirmClear(false)}
        >
          <Trash2 size={16} aria-hidden="true" />
          {confirmClear ? messages.history.confirmClear : messages.history.clear}
        </button>
      </section>

      {filtered.length ? (
        <>
          <section className="panel histogram-panel" aria-labelledby="histogram-heading">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{messages.history.observedTotals}</p>
                <h2 id="histogram-heading">{messages.history.distribution}</h2>
              </div>
              <span>{messages.history.distinctTotals(stats.frequencies.length)}</span>
            </div>
            <div className="histogram" role="img" aria-label={messages.history.histogramLabel}>
              {stats.frequencies.map((item) => (
                <div
                  className="histogram-column"
                  key={item.total}
                  title={messages.history.histogramTitle(item.total, item.count, item.percentage)}
                >
                  <span className="histogram-value">{formatInteger(item.count)}</span>
                  <span
                    className="histogram-bar"
                    style={{ height: `${Math.max(8, (item.count / maxFrequency) * 100)}%` }}
                  />
                  <span className="histogram-label">{formatInteger(item.total)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel history-list" aria-label={messages.history.entriesLabel}>
            {visibleHistory.map((roll) => (
              <article className="history-row" key={roll.id}>
                <div className="history-total">{formatInteger(roll.total)}</div>
                <div className="history-meta">
                  <strong>{roll.expression}</strong>
                  <span>{roll.dice.map((die) => `${formatInteger(die.value)}${die.kept ? '' : '×'}`).join(' · ')}</span>
                </div>
                <div className="history-time">
                  <span>{roll.mode === 'secure' ? messages.history.secure : messages.history.seeded}</span>
                  <time dateTime={roll.rolledAt}>{formatDateTime(roll.rolledAt)}</time>
                </div>
              </article>
            ))}
            {visibleHistory.length < filtered.length ? (
              <div className="history-load-more">
                <p className="panel-note">{messages.history.showingEntries(visibleHistory.length, filtered.length)}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setVisibleLimit((current) => Math.min(filtered.length, current + HISTORY_PAGE_SIZE))}
                >
                  {messages.history.showMore}
                </button>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <div className="panel empty-state large">
          <Search size={32} aria-hidden="true" />
          <h2>{history.length ? messages.history.noMatches : messages.history.noRolls}</h2>
          <p>{history.length ? messages.history.noMatchesBody : messages.history.noRollsBody}</p>
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
