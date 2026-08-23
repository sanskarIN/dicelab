import { useEffect, useRef, useState } from 'react';
import { AboutPanel } from './components/AboutPanel';
import { AppShell, type AppView } from './components/AppShell';
import { CommandPalette } from './components/CommandPalette';
import { HistoryPanel } from './components/HistoryPanel';
import { Onboarding } from './components/Onboarding';
import { ProbabilityPanel } from './components/ProbabilityPanel';
import { RollWorkspace } from './components/RollWorkspace';
import { SettingsPanel } from './components/SettingsPanel';
import { parseDiceExpression } from './domain/parser';
import { DEFAULT_SETTINGS, type DiceLabSettings, type DicePreset, type RollResult } from './domain/types';
import { messages, setLocale } from './i18n';
import { formatDomainError } from './i18n/errors';
import { backupToJson, createBackup, parseBackupFile, saveTextExport } from './services/export';
import { rollDice } from './services/roll-service';
import {
  clearDiceLabData,
  completeOnboarding,
  getBuiltinPresets,
  hasCompletedOnboarding,
  limitPresetCollection,
  loadHistory,
  loadPresets,
  loadSettings,
  saveCustomPresets,
  saveHistory,
  saveSettings,
} from './services/storage';

let fallbackPresetIdSequence = 0;

export default function App() {
  const [view, setView] = useState<AppView>('roll');
  const [expression, setExpression] = useState('1d20');
  const [settings, setSettings] = useState<DiceLabSettings>(() => {
    const loaded = loadSettings();
    setLocale(loaded.locale);
    return loaded;
  });
  const [history, setHistory] = useState<RollResult[]>(() => loadHistory().slice(0, settings.historyLimit));
  const [presets, setPresets] = useState<DicePreset[]>(() => loadPresets(settings.locale));
  const [commandOpen, setCommandOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding());
  const [busy, setBusy] = useState(false);
  const [rollError, setRollError] = useState<string | null>(null);
  const sequenceRef = useRef(0);

  useEffect(() => {
    saveSettings(settings);
    saveHistory(history, settings.historyLimit);
  }, [history, settings]);

  useEffect(() => {
    saveCustomPresets(presets);
  }, [presets]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      root.dataset.theme = settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      root.dataset.reducedMotion = String(settings.reducedMotion);
      root.dataset.animations = String(settings.animations && !settings.reducedMotion);
      root.lang = settings.locale;
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.theme, settings.locale, settings.reducedMotion, settings.animations]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roll = async () => {
    if (busy) return;
    setBusy(true);
    setRollError(null);
    try {
      parseDiceExpression(expression);
      const result = await rollDice(
        expression,
        settings.randomMode,
        settings.seed || 'dicelab',
        sequenceRef.current++,
      );
      setHistory((current) => [result, ...current].slice(0, settings.historyLimit));
    } catch (cause) {
      setRollError(formatDomainError(cause, messages.roll.genericRollError));
    } finally {
      setBusy(false);
    }
  };

  const savePreset = (name: string) => {
    const parsed = parseDiceExpression(expression);
    setPresets((current) =>
      limitPresetCollection([
        ...current,
        {
          id: createPresetId(),
          name,
          expression: parsed.normalized,
          description: messages.common.customPresetDescription,
          createdAt: new Date().toISOString(),
        },
      ]),
    );
  };

  const deletePreset = (id: string) => {
    if (id.startsWith('builtin-')) return;
    setPresets((current) => current.filter((preset) => preset.id !== id));
  };

  const updateSettings = (next: DiceLabSettings) => {
    if (next.locale !== settings.locale) {
      setLocale(next.locale);
      setPresets((current) => [
        ...getBuiltinPresets(next.locale),
        ...current.filter((preset) => !preset.id.startsWith('builtin-')),
      ]);
    }
    setSettings(next);
    if (next.historyLimit < history.length) setHistory((current) => current.slice(0, next.historyLimit));
  };

  const exportBackup = () => {
    const backup = createBackup(history, presets, settings);
    return saveTextExport('dicelab-backup.json', backupToJson(backup), 'application/json', 'json');
  };

  const importBackup = async (file: File) => {
    const backup = await parseBackupFile(file);
    setLocale(backup.settings.locale);
    setHistory(backup.history.slice(0, backup.settings.historyLimit));
    setPresets([...getBuiltinPresets(backup.settings.locale), ...backup.presets]);
    setSettings(backup.settings);
    sequenceRef.current = 0;
  };

  const clearAllData = () => {
    clearDiceLabData();
    setLocale(DEFAULT_SETTINGS.locale);
    setHistory([]);
    setPresets(getBuiltinPresets(DEFAULT_SETTINGS.locale));
    setSettings(DEFAULT_SETTINGS);
    sequenceRef.current = 0;
    setShowOnboarding(true);
    setView('roll');
  };

  const finishOnboarding = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">{messages.common.skipToContent}</a>
      <AppShell view={view} onNavigate={setView} onOpenCommands={() => setCommandOpen(true)}>
        {view === 'roll' ? (
          <RollWorkspace
            expression={expression}
            onExpressionChange={setExpression}
            onRoll={roll}
            lastRoll={history[0]}
            presets={presets}
            onSavePreset={savePreset}
            onDeletePreset={deletePreset}
            randomMode={settings.randomMode}
            busy={busy}
            error={rollError}
          />
        ) : null}
        {view === 'history' ? <HistoryPanel history={history} onClear={() => setHistory([])} /> : null}
        {view === 'probability' ? <ProbabilityPanel /> : null}
        {view === 'settings' ? (
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onExportBackup={exportBackup}
            onImportBackup={importBackup}
            onClearData={clearAllData}
            onOpenAbout={() => setView('about')}
          />
        ) : null}
        {view === 'about' ? <AboutPanel /> : null}
      </AppShell>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={setView}
        onSetExpression={setExpression}
      />
      {showOnboarding ? <Onboarding onComplete={finishOnboarding} /> : null}
    </>
  );
}

function createPresetId(): string {
  if (typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const sequence = fallbackPresetIdSequence++;
  return `preset-${Date.now()}-${sequence}`;
}
