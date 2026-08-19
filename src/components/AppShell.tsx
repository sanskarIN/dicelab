import { BarChart3, Dices, History, Info, Keyboard, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { copy } from '../i18n';

export type AppView = 'roll' | 'history' | 'probability' | 'settings' | 'about';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommands: () => void;
  children: ReactNode;
}

const items: Array<{ id: AppView; label: string; icon: typeof Dices }> = [
  { id: 'roll', label: copy.navigation.roll, icon: Dices },
  { id: 'history', label: copy.navigation.history, icon: History },
  { id: 'probability', label: copy.navigation.probability, icon: BarChart3 },
  { id: 'settings', label: copy.navigation.settings, icon: Settings },
  { id: 'about', label: copy.navigation.about, icon: Info },
];

export function AppShell({ view, onNavigate, onOpenCommands, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label={copy.navigation.primary}>
        <div className="brand" aria-label={copy.navigation.brandHome}>
          <span className="brand-mark" aria-hidden="true">
            ◆
          </span>
          <div>
            <strong>DiceLab</strong>
            <span>{copy.navigation.brandSubtitle}</span>
          </div>
        </div>
        <nav className="nav-list">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              className={view === id ? 'nav-button active' : 'nav-button'}
              key={id}
              type="button"
              aria-current={view === id ? 'page' : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="command-trigger" type="button" onClick={onOpenCommands}>
          <Keyboard size={18} aria-hidden="true" />
          <span>{copy.navigation.quickActions}</span>
          <kbd>{copy.navigation.quickActionsShortcut}</kbd>
        </button>
        <p className="sidebar-credit">{copy.navigation.credit}</p>
      </aside>

      <main className="main-content" id="main-content">
        {children}
      </main>

      <nav className="bottom-nav" aria-label={copy.navigation.mobile}>
        {items.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button
            className={view === id ? 'active' : ''}
            key={id}
            type="button"
            aria-current={view === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
