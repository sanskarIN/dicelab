import { BarChart3, Dices, History, Info, Search, Settings, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { AppView } from './AppShell';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onSetExpression: (expression: string) => void;
}

const commands: Array<{ label: string; detail: string; icon: typeof Dices; run: (props: CommandPaletteProps) => void }> = [
  { label: 'Roll dice', detail: 'Open the dice studio', icon: Dices, run: (props) => props.onNavigate('roll') },
  {
    label: 'View history',
    detail: 'Browse recent local rolls',
    icon: History,
    run: (props) => props.onNavigate('history'),
  },
  {
    label: 'Probability calculator',
    detail: 'Inspect exact distributions',
    icon: BarChart3,
    run: (props) => props.onNavigate('probability'),
  },
  {
    label: 'Settings',
    detail: 'Appearance, accessibility, randomness',
    icon: Settings,
    run: (props) => props.onNavigate('settings'),
  },
  { label: 'About DiceLab', detail: 'Project, privacy, support', icon: Info, run: (props) => props.onNavigate('about') },
  {
    label: 'Roll with advantage',
    detail: 'Set expression to 2d20kh1',
    icon: Dices,
    run: (props) => {
      props.onSetExpression('2d20kh1');
      props.onNavigate('roll');
    },
  },
  {
    label: 'Roll ability score',
    detail: 'Set expression to 4d6kh3',
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
  const dialogRef = useRef<HTMLElement>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return commands.filter(
      (command) => !normalized || `${command.label} ${command.detail}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    if (!props.open) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      previouslyFocused?.focus();
    };
  }, [props.open]);

  if (!props.open) return null;

  const run = (command: (typeof commands)[number]) => {
    command.run(props);
    props.onClose();
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      props.onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('hidden'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) props.onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="commands-title"
        onKeyDown={handleDialogKeyDown}
      >
        <div className="command-search">
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filtered[0]) run(filtered[0]);
            }}
            placeholder="Search actions…"
            aria-label="Search quick actions"
          />
          <button type="button" aria-label="Close quick actions" onClick={props.onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <h2 id="commands-title" className="sr-only">
          Quick actions
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
            <p className="command-empty">No matching action.</p>
          )}
        </div>
      </section>
    </div>
  );
}
