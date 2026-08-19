import type { ReactNode } from 'react';
import { BarChart3, Dices, History, Info, Keyboard, Settings } from 'lucide-react';

export type AppView = 'roll' | 'history' | 'probability' | 'settings' | 'about';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommands: () => void;
  children: ReactNode;
}

const items: Array<{ id: AppView; label: string; icon: typeof Dices }> = [
  { id: 'roll', label: 'Roll', icon: Dices },
  { id: 'history', label: 'History', icon: History },
  { id: 'probability', label: 'Probability', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
];

export function AppShell({ view, onNavigate, onOpenCommands, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand" aria-label="DiceLab home">
          <span className="brand-mark" aria-hidden="true">◆</span>
          <div>
            <strong>DiceLab</strong>
            <span>Offline dice studio</span>
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
          <span>Quick actions</span>
          <kbd>Ctrl K</kbd>
        </button>
        <p className="sidebar-credit">Made by the Sanskar</p>
      </aside>

      <main className="main-content" id="main-content">{children}</main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
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
