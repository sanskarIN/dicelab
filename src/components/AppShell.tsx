import type { ReactNode } from 'react';
import { BarChart3, Dices, History, Info, Keyboard, Settings } from 'lucide-react';
import { messages } from '../i18n';

export type AppView = 'roll' | 'history' | 'probability' | 'settings' | 'about';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onOpenCommands: () => void;
  children: ReactNode;
}

const items: Array<{ id: AppView; label: string; icon: typeof Dices }> = [
  { id: 'roll', label: messages.navigation.roll, icon: Dices },
  { id: 'history', label: messages.navigation.history, icon: History },
  { id: 'probability', label: messages.navigation.probability, icon: BarChart3 },
  { id: 'settings', label: messages.navigation.settings, icon: Settings },
  { id: 'about', label: messages.navigation.about, icon: Info },
];

export function AppShell({ view, onNavigate, onOpenCommands, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label={messages.common.primaryNavigation}>
        <div className="brand" aria-label={`${messages.common.appName} home`}>
          <span className="brand-mark" aria-hidden="true">◆</span>
          <div>
            <strong>{messages.common.appName}</strong>
            <span>{messages.navigation.offlineStudio}</span>
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
          <span>{messages.navigation.quickActions}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <p className="sidebar-credit">{messages.common.madeBy}</p>
      </aside>

      <main className="main-content" id="main-content">{children}</main>

      <nav className="bottom-nav" aria-label={messages.common.mobileNavigation}>
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
