import { Accessibility, Database, Download, MoonStar, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import type { DiceLabSettings } from '../domain/types';
import { copy } from '../i18n';

interface SettingsPanelProps {
  settings: DiceLabSettings;
  onChange: (settings: DiceLabSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<void>;
  onClearData: () => void;
}

export function SettingsPanel({ settings, onChange, onExportBackup, onImportBackup, onClearData }: SettingsPanelProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const patch = (changes: Partial<DiceLabSettings>) => onChange({ ...settings, ...changes });

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setImportStatus(copy.settings.importing);
      await onImportBackup(file);
      setImportStatus(copy.settings.importSuccess);
    } catch (cause) {
      setImportStatus(cause instanceof Error ? cause.message : copy.settings.importFailed);
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
          <p className="eyebrow">{copy.settings.eyebrow}</p>
          <h1 id="settings-heading">{copy.settings.title}</h1>
          <p>{copy.settings.description}</p>
        </div>
      </header>

      <section className="settings-section panel" aria-labelledby="appearance-heading">
        <div className="settings-section-title">
          <MoonStar size={20} aria-hidden="true" />
          <div>
            <h2 id="appearance-heading">{copy.settings.appearanceTitle}</h2>
            <p>{copy.settings.appearanceDescription}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{copy.settings.theme}</strong>
            <small>{copy.settings.themeDescription}</small>
          </span>
          <select
            value={settings.theme}
            onChange={(event) => patch({ theme: event.target.value as DiceLabSettings['theme'] })}
          >
            <option value="system">{copy.settings.system}</option>
            <option value="light">{copy.settings.light}</option>
            <option value="dark">{copy.settings.dark}</option>
          </select>
        </label>
      </section>

      <section className="settings-section panel" aria-labelledby="accessibility-heading">
        <div className="settings-section-title">
          <Accessibility size={20} aria-hidden="true" />
          <div>
            <h2 id="accessibility-heading">{copy.settings.accessibilityTitle}</h2>
            <p>{copy.settings.accessibilityDescription}</p>
          </div>
        </div>
        <ToggleRow
          label={copy.settings.reducedMotion}
          detail={copy.settings.reducedMotionDescription}
          checked={settings.reducedMotion}
          onChange={(checked) => patch({ reducedMotion: checked, animations: checked ? false : settings.animations })}
        />
        <ToggleRow
          label={copy.settings.diceAnimations}
          detail={copy.settings.diceAnimationsDescription}
          checked={settings.animations}
          disabled={settings.reducedMotion}
          onChange={(checked) => patch({ animations: checked })}
        />
      </section>

      <section className="settings-section panel" aria-labelledby="random-heading">
        <div className="settings-section-title">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2 id="random-heading">{copy.settings.randomnessTitle}</h2>
            <p>{copy.settings.randomnessDescription}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{copy.settings.randomMode}</strong>
            <small>{copy.settings.randomModeDescription}</small>
          </span>
          <select
            value={settings.randomMode}
            onChange={(event) => patch({ randomMode: event.target.value as DiceLabSettings['randomMode'] })}
          >
            <option value="secure">{copy.settings.secure}</option>
            <option value="seeded">{copy.settings.seeded}</option>
          </select>
        </label>
        {settings.randomMode === 'seeded' ? (
          <label className="setting-row stacked">
            <span>
              <strong>{copy.settings.seed}</strong>
              <small>{copy.settings.seedDescription}</small>
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
            <h2 id="data-heading">{copy.settings.dataTitle}</h2>
            <p>{copy.settings.dataDescription}</p>
          </div>
        </div>
        <label className="setting-row">
          <span>
            <strong>{copy.settings.historyLimit}</strong>
            <small>{copy.settings.historyLimitDescription}</small>
          </span>
          <input
            className="number-input"
            type="number"
            min={10}
            max={5000}
            step={10}
            value={settings.historyLimit}
            onChange={(event) =>
              patch({ historyLimit: Math.min(5000, Math.max(10, Number(event.target.value) || 10)) })
            }
          />
        </label>
        <div className="setting-actions">
          <button type="button" className="secondary-button" onClick={onExportBackup}>
            <Download size={16} aria-hidden="true" /> {copy.settings.exportBackup}
          </button>
          <label className="secondary-button file-button">
            <Upload size={16} aria-hidden="true" /> {copy.settings.importBackup}
            <input
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importBackup(event)}
            />
          </label>
          <button
            type="button"
            className={confirmClear ? 'danger-button confirm' : 'danger-button'}
            onClick={clearData}
            onBlur={() => setConfirmClear(false)}
          >
            <Trash2 size={16} aria-hidden="true" />{' '}
            {confirmClear ? copy.settings.confirmClear : copy.settings.clearLocalData}
          </button>
        </div>
        {importStatus ? (
          <p className="panel-note" role="status">
            {importStatus}
          </p>
        ) : null}
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
