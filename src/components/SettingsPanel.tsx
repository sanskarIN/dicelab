import { Accessibility, Database, Download, MoonStar, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import type { DiceLabSettings } from '../domain/types';

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
      setImportStatus('Importing…');
      await onImportBackup(file);
      setImportStatus('Backup restored successfully.');
    } catch (cause) {
      setImportStatus(cause instanceof Error ? cause.message : 'Backup import failed.');
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
          <p className="eyebrow">Your preferences</p>
          <h1 id="settings-heading">Settings</h1>
          <p>DiceLab keeps its everyday data on this device and does not require an account.</p>
        </div>
      </header>

      <section className="settings-section panel" aria-labelledby="appearance-heading">
        <div className="settings-section-title">
          <MoonStar size={20} aria-hidden="true" />
          <div><h2 id="appearance-heading">Appearance</h2><p>Choose how DiceLab fits your system.</p></div>
        </div>
        <label className="setting-row">
          <span><strong>Theme</strong><small>Light, dark, or follow your operating system.</small></span>
          <select value={settings.theme} onChange={(event) => patch({ theme: event.target.value as DiceLabSettings['theme'] })}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </section>

      <section className="settings-section panel" aria-labelledby="accessibility-heading">
        <div className="settings-section-title">
          <Accessibility size={20} aria-hidden="true" />
          <div><h2 id="accessibility-heading">Accessibility</h2><p>Control motion without losing information.</p></div>
        </div>
        <ToggleRow
          label="Reduced motion"
          detail="Minimize transitions and movement across the interface."
          checked={settings.reducedMotion}
          onChange={(checked) => patch({ reducedMotion: checked, animations: checked ? false : settings.animations })}
        />
        <ToggleRow
          label="Dice animations"
          detail="Allow subtle result transitions when reduced motion is off."
          checked={settings.animations}
          disabled={settings.reducedMotion}
          onChange={(checked) => patch({ animations: checked })}
        />
      </section>

      <section className="settings-section panel" aria-labelledby="random-heading">
        <div className="settings-section-title">
          <ShieldCheck size={20} aria-hidden="true" />
          <div><h2 id="random-heading">Randomness</h2><p>Secure mode is the default; seeded mode makes testing reproducible.</p></div>
        </div>
        <label className="setting-row">
          <span><strong>Random mode</strong><small>Seeded mode is deterministic and is not intended for security-sensitive draws.</small></span>
          <select value={settings.randomMode} onChange={(event) => patch({ randomMode: event.target.value as DiceLabSettings['randomMode'] })}>
            <option value="secure">Secure</option>
            <option value="seeded">Seeded</option>
          </select>
        </label>
        {settings.randomMode === 'seeded' ? (
          <label className="setting-row stacked">
            <span><strong>Seed</strong><small>Each roll combines this value with a local sequence number.</small></span>
            <input value={settings.seed} onChange={(event) => patch({ seed: event.target.value.slice(0, 120) })} maxLength={120} />
          </label>
        ) : null}
      </section>

      <section className="settings-section panel" aria-labelledby="data-heading">
        <div className="settings-section-title">
          <Database size={20} aria-hidden="true" />
          <div><h2 id="data-heading">Data & privacy</h2><p>History, presets, and settings are stored locally.</p></div>
        </div>
        <label className="setting-row">
          <span><strong>History limit</strong><small>Keep between 10 and 5,000 recent rolls.</small></span>
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
          <button type="button" className="secondary-button" onClick={onExportBackup}><Download size={16} aria-hidden="true" /> Export backup</button>
          <label className="secondary-button file-button">
            <Upload size={16} aria-hidden="true" /> Import backup
            <input className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void importBackup(event)} />
          </label>
          <button type="button" className={confirmClear ? 'danger-button confirm' : 'danger-button'} onClick={clearData} onBlur={() => setConfirmClear(false)}>
            <Trash2 size={16} aria-hidden="true" /> {confirmClear ? 'Click again to clear' : 'Clear local data'}
          </button>
        </div>
        {importStatus ? <p className="panel-note" role="status">{importStatus}</p> : null}
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
      <span><strong>{label}</strong><small>{detail}</small></span>
      <input className="switch" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
