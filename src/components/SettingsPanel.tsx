import {
  Accessibility,
  Database,
  Download,
  ExternalLink,
  Info,
  MoonStar,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { APP_NAME, APP_VERSION, RELEASES_URL } from '../config/app';
import type { DiceLabSettings } from '../domain/types';
import { messages } from '../i18n';

interface SettingsPanelProps {
  settings: DiceLabSettings;
  onChange: (settings: DiceLabSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<void>;
  onClearData: () => void;
  onOpenAbout: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onExportBackup,
  onImportBackup,
  onClearData,
  onOpenAbout,
}: SettingsPanelProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const patch = (changes: Partial<DiceLabSettings>) => onChange({ ...settings, ...changes });

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setImportStatus(messages.settings.importing);
      await onImportBackup(file);
      setImportStatus(messages.settings.importSuccess);
    } catch (cause) {
      setImportStatus(cause instanceof Error ? cause.message : messages.settings.importFailed);
    }
  };

  const clearData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearData();
    setConfirmClear(false);
  };

  return (
    <section className="view-stack" aria-labelledby="settings-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{messages.settings.eyebrow}</p>
          <h1 id="settings-heading">{messages.settings.heading}</h1>
          <p>{messages.settings.intro}</p>
        </div>
      </header>

      <section className="settings-section panel" aria-labelledby="appearance-heading">
        <div className="settings-section-title">
          <MoonStar size={20} aria-hidden="true" />
          <div>
            <h2 id="appearance-heading">{messages.settings.appearance}</h2>
            <p>{messages.settings.appearanceBody}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{messages.settings.theme}</strong>
            <small>{messages.settings.themeBody}</small>
          </span>
          <select
            value={settings.theme}
            onChange={(event) => patch({ theme: event.target.value as DiceLabSettings['theme'] })}
          >
            <option value="system">{messages.settings.system}</option>
            <option value="light">{messages.settings.light}</option>
            <option value="dark">{messages.settings.dark}</option>
          </select>
        </label>
      </section>

      <section className="settings-section panel" aria-labelledby="accessibility-heading">
        <div className="settings-section-title">
          <Accessibility size={20} aria-hidden="true" />
          <div>
            <h2 id="accessibility-heading">{messages.settings.accessibility}</h2>
            <p>{messages.settings.accessibilityBody}</p>
          </div>
        </div>
        <ToggleRow
          label={messages.settings.reducedMotion}
          detail={messages.settings.reducedMotionBody}
          checked={settings.reducedMotion}
          onChange={(checked) => patch({ reducedMotion: checked, animations: checked ? false : settings.animations })}
        />
        <ToggleRow
          label={messages.settings.diceAnimations}
          detail={messages.settings.diceAnimationsBody}
          checked={settings.animations}
          disabled={settings.reducedMotion}
          onChange={(checked) => patch({ animations: checked })}
        />
      </section>

      <section className="settings-section panel" aria-labelledby="random-heading">
        <div className="settings-section-title">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2 id="random-heading">{messages.settings.randomness}</h2>
            <p>{messages.settings.randomnessBody}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{messages.settings.randomMode}</strong>
            <small>{messages.settings.randomModeBody}</small>
          </span>
          <select
            value={settings.randomMode}
            onChange={(event) => patch({ randomMode: event.target.value as DiceLabSettings['randomMode'] })}
          >
            <option value="secure">{messages.settings.secure}</option>
            <option value="seeded">{messages.settings.seeded}</option>
          </select>
        </label>
        {settings.randomMode === 'seeded' ? (
          <label className="setting-row stacked">
            <span>
              <strong>{messages.settings.seed}</strong>
              <small>{messages.settings.seedBody}</small>
            </span>
            <input
              value={settings.seed}
              onChange={(event) => patch({ seed: event.target.value.slice(0, 120) })}
              maxLength={120}
            />
          </label>
        ) : null}
      </section>

      <section className="settings-section panel" aria-labelledby="data-heading">
        <div className="settings-section-title">
          <Database size={20} aria-hidden="true" />
          <div>
            <h2 id="data-heading">{messages.settings.dataPrivacy}</h2>
            <p>{messages.settings.dataPrivacyBody}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{messages.settings.historyLimit}</strong>
            <small>{messages.settings.historyLimitBody}</small>
          </span>
          <input
            className="number-input"
            type="number"
            min={10}
            max={5000}
            step={10}
            value={settings.historyLimit}
            onChange={(event) => patch({ historyLimit: Math.min(5000, Math.max(10, Number(event.target.value) || 10)) })}
          />
        </label>
        <div className="setting-actions">
          <button type="button" className="secondary-button" onClick={onExportBackup}>
            <Download size={16} aria-hidden="true" /> {messages.settings.exportBackup}
          </button>
          <label className="secondary-button file-button">
            <Upload size={16} aria-hidden="true" /> {messages.settings.importBackup}
            <input
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label={messages.settings.importBackup}
              onChange={(event) => void importBackup(event)}
            />
          </label>
          <button
            type="button"
            className={confirmClear ? 'danger-button confirm' : 'danger-button'}
            onClick={clearData}
            onBlur={() => setConfirmClear(false)}
          >
            <Trash2 size={16} aria-hidden="true" />
            {confirmClear ? messages.settings.confirmClear : messages.settings.clearData}
          </button>
        </div>
        {importStatus ? (
          <p className="panel-note" role="status">
            {importStatus}
          </p>
        ) : null}
      </section>

      <section className="settings-section panel" aria-labelledby="updates-heading">
        <div className="settings-section-title">
          <Info size={20} aria-hidden="true" />
          <div>
            <h2 id="updates-heading">{messages.settings.updatesAbout}</h2>
            <p>{messages.settings.updatesAboutBody}</p>
          </div>
        </div>
        <div className="setting-row">
          <span>
            <strong>{APP_NAME} {APP_VERSION}</strong>
            <small>{messages.settings.releaseBody}</small>
          </span>
          <a className="secondary-button" href={RELEASES_URL} target="_blank" rel="noreferrer">
            {messages.settings.releases} <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="setting-actions">
          <button type="button" className="secondary-button" onClick={onOpenAbout}>
            <Info size={16} aria-hidden="true" /> {messages.settings.openAbout}
          </button>
        </div>
      </section>
    </section>
  );
}

function ToggleRow({
  label,
  detail,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={disabled ? 'setting-row disabled' : 'setting-row'}>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <input
        className="switch"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
