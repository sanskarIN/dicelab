import { BookmarkPlus, Dices, Play, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { parseDiceExpression } from '../domain/parser';
import type { DicePreset, RandomMode, RollResult } from '../domain/types';
import { copy } from '../i18n';

interface RollWorkspaceProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
  onRoll: () => Promise<void>;
  lastRoll?: RollResult;
  presets: DicePreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  randomMode: RandomMode;
  busy: boolean;
  error: string | null;
}

const quickDice = [4, 6, 8, 10, 12, 20, 100];

export function RollWorkspace({
  expression,
  onExpressionChange,
  onRoll,
  lastRoll,
  presets,
  onSavePreset,
  onDeletePreset,
  randomMode,
  busy,
  error,
}: RollWorkspaceProps) {
  const [presetName, setPresetName] = useState('');
  const validation = useMemo(() => {
    try {
      return { parsed: parseDiceExpression(expression), error: null };
    } catch (cause) {
      return { parsed: null, error: cause instanceof Error ? cause.message : copy.errors.invalidExpression };
    }
  }, [expression]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validation.error && !busy) void onRoll();
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name || validation.error) return;
    onSavePreset(name);
    setPresetName('');
  };

  return (
    <section className="view-stack" aria-labelledby="roll-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{copy.roll.eyebrow}</p>
          <h1 id="roll-heading">{copy.roll.title}</h1>
          <p>{copy.roll.description}</p>
        </div>
        <span className="status-pill">
          <span className="status-dot" />
          {randomMode === 'secure' ? copy.roll.secureRandom : copy.roll.seededMode}
        </span>
      </header>

      <div className="roll-grid">
        <div className="panel roll-panel">
          <div className="quick-dice" aria-label={copy.roll.quickDice}>
            {quickDice.map((sides) => (
              <button key={sides} type="button" onClick={() => onExpressionChange(`1d${sides}`)}>
                d{sides}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="expression-form">
            <label htmlFor="dice-expression">{copy.roll.expressionLabel}</label>
            <div className={validation.error ? 'expression-control invalid' : 'expression-control'}>
              <Dices size={21} aria-hidden="true" />
              <input
                id="dice-expression"
                value={expression}
                onChange={(event) => onExpressionChange(event.target.value)}
                placeholder={copy.roll.expressionPlaceholder}
                spellCheck={false}
                autoComplete="off"
                aria-describedby="expression-help expression-error"
                aria-invalid={Boolean(validation.error)}
              />
              <button className="primary-button" type="submit" disabled={Boolean(validation.error) || busy}>
                <Play size={17} aria-hidden="true" />
                {busy ? copy.roll.rolling : copy.roll.rollButton}
              </button>
            </div>
            <p id="expression-help" className="field-help">{copy.roll.expressionHelp}</p>
            <p id="expression-error" className="field-error" role="alert">{validation.error ?? error ?? ''}</p>
          </form>

          <div className="preset-save-row">
            <input
              aria-label={copy.roll.presetNameLabel}
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder={copy.roll.presetNamePlaceholder}
              maxLength={48}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={savePreset}
              disabled={!presetName.trim() || Boolean(validation.error)}
            >
              <BookmarkPlus size={17} aria-hidden="true" /> {copy.roll.savePreset}
            </button>
          </div>
        </div>

        <div className="panel result-panel" aria-live="polite">
          {lastRoll ? (
            <>
              <div className="result-topline">
                <span>{lastRoll.expression}</span>
                <span>{new Date(lastRoll.rolledAt).toLocaleTimeString()}</span>
              </div>
              <div className="roll-total">{lastRoll.total}</div>
              <div className="dice-results" aria-label={copy.roll.diceResults}>
                {lastRoll.dice.map((die) => (
                  <span key={`${lastRoll.id}-${die.index}`} className={die.kept ? 'die-result' : 'die-result dropped'}>
                    {die.value}
                  </span>
                ))}
              </div>
              <p className="result-note">
                {lastRoll.modifier === 0 ? copy.roll.noModifier : copy.roll.modifier(lastRoll.modifier)}
                {lastRoll.seed ? ` · ${copy.roll.seed(lastRoll.seed)}` : ''}
              </p>
            </>
          ) : (
            <div className="empty-state">
              <Sparkles size={32} aria-hidden="true" />
              <h2>{copy.roll.emptyTitle}</h2>
              <p>{copy.roll.emptyDescription}</p>
            </div>
          )}
        </div>
      </div>

      <section className="panel presets-panel" aria-labelledby="presets-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{copy.roll.presetsEyebrow}</p>
            <h2 id="presets-heading">{copy.roll.presetsTitle}</h2>
          </div>
          <button className="icon-text-button" type="button" onClick={() => onExpressionChange('1d20')}>
            <RotateCcw size={16} aria-hidden="true" /> {copy.roll.reset}
          </button>
        </div>
        <div className="preset-grid">
          {presets.map((preset) => (
            <article className="preset-card" key={preset.id}>
              <button className="preset-main" type="button" onClick={() => onExpressionChange(preset.expression)}>
                <strong>{preset.name}</strong>
                <code>{preset.expression}</code>
                {preset.description ? <span>{preset.description}</span> : null}
              </button>
              {!preset.id.startsWith('builtin-') ? (
                <button
                  className="preset-delete"
                  type="button"
                  aria-label={copy.roll.deletePreset(preset.name)}
                  onClick={() => onDeletePreset(preset.id)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
