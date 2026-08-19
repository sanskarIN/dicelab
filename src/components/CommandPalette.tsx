import { BarChart3, Dices, History, Info, Search, Settings, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copy } from '../i18n';
import type { AppView } from './AppShell';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onSetExpression: (expression: string) => void;
}

const commands: Array<{
  label: string;
  detail: string;
  icon: typeof Dices;
  run: (props: CommandPaletteProps) => void;
}> = [
  {
    label: copy.commands.rollDice,
    detail: copy.commands.rollDiceDetail,
    icon: Dices,
    run: (props) => props.onNavigate('roll'),
  },
  {
    label: copy.commands.viewHistory,
    detail: copy.commands.viewHistoryDetail,
    icon: History,
    run: (props) => props.onNavigate('history'),
  },
  {
    label: copy.commands.probability,
    detail: copy.commands.probabilityDetail,
    icon: BarChart3,
    run: (props) => props.onNavigate('probability'),
  },
  {
    label: copy.commands.settings,
    detail: copy.commands.settingsDetail,
    icon: Settings,
    run: (props) => props.onNavigate('settings'),
  },
  {
    label: copy.commands.about,
    detail: copy.commands.aboutDetail,
    icon: Info,
    run: (props) => props.onNavigate('about'),
  },
  {
    label: copy.commands.advantage,
    detail: copy.commands.advantageDetail,
    icon: Dices,
    run: (props) => {
      props.onSetExpression('2d20kh1');
      props.onNavigate('roll');
    },
  },
  {
    label: copy.commands.ability,
    detail: copy.commands.abilityDetail,
    icon: Dices,
    run: (props) => {
      props.onSetExpression('4d6kh3');
      props.onNavigate('roll');
    },
  },
];

export function CommandPalette(props: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return commands.filter(
      (command) => !normalized || `${command.label} ${command.detail}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    if (props.open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [props.open]);

  if (!props.open) return null;

  const run = (command: (typeof commands)[number]) => {
    command.run(props);
    props.onClose();
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) props.onClose();
      }}
    >
      <section className="command-dialog" role="dialog" aria-modal="true" aria-labelledby="commands-title">
        <div className="command-search">
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') props.onClose();
              if (event.key === 'Enter' && filtered[0]) run(filtered[0]);
            }}
            placeholder={copy.commands.searchPlaceholder}
            aria-label={copy.commands.searchLabel}
          />
          <button type="button" aria-label={copy.commands.closeLabel} onClick={props.onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <h2 id="commands-title" className="sr-only">
          {copy.commands.dialogTitle}
        </h2>
        <div className="command-list">
          {filtered.length ? (
            filtered.map((command) => {
              const Icon = command.icon;
              return (
                <button key={command.label} type="button" onClick={() => run(command)}>
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{command.label}</strong>
                    <small>{command.detail}</small>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="command-empty">{copy.commands.empty}</p>
          )}
        </div>
      </section>
    </div>
  );
}
