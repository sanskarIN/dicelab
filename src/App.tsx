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
import { messages } from './i18n';
import { formatDomainError } from './i18n/errors';
import { backupToJson, createBackup, downloadText, parseBackupJson } from './services/export';
import { rollDice } from './services/roll-service';
import {
  BUILTIN_PRESETS,
  clearDiceLabData,
  completeOnboarding,
  hasCompletedOnboarding,
  loadHistory,
  loadPresets,
  loadSettings,
  saveCustomPresets,
  saveHistory,
  saveSettings,
} from './services/storage';

export default function App() {
  const [view, setView] = useState<AppView>('roll');
  const [expression, setExpression] = useState('1d20');
  const [history, setHistory] = useState<RollResult[]>(loadHistory);
  const [presets, setPresets] = useState<DicePreset[]>(loadPresets);
  const [settings, setSettings] = useState<DiceLabSettings>(loadSettings);
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
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.theme, settings.reducedMotion, settings.animations]);

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
      const result = await rollDice(expression, settings.randomMode, settings.seed || 'dicelab', sequenceRef.current++);
      setHistory((current) => [result, ...current].slice(0, settings.historyLimit));
    } catch (cause) {
      setRollError(formatDomainError(cause, messages.roll.genericRollError));
    } finally {
      setBusy(false);
    }
  };

  const savePreset = (name: string) => {
    const parsed = parseDiceExpression(expression);
    const id =
      typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `preset-${Date.now()}`;
    setPresets((current) => [
      ...current,
      {
        id,
        name,
        expression: parsed.normalized,
        description: messages.common.customPresetDescription,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const deletePreset = (id: string) => {
    if (id.startsWith('builtin-')) return;
    setPresets((current) => current.filter((preset) => preset.id !== id));
  };

  const updateSettings = (next: DiceLabSettings) => {
    setSettings(next);
    if (next.historyLimit < history.length) setHistory((current) => current.slice(0, next.historyLimit));
  };

  const exportBackup = () => {
    const backup = createBackup(history, presets, settings);
    downloadText('dicelab-backup.json', backupToJson(backup), 'application/json');
  };

  const importBackup = async (file: File) => {
    const backup = parseBackupJson(await file.text());
    setHistory(backup.history.slice(0, backup.settings.historyLimit));
    setPresets([...BUILTIN_PRESETS, ...backup.presets]);
    setSettings(backup.settings);
    sequenceRef.current = 0;
  };

  const clearAllData = () => {
    clearDiceLabData();
    setHistory([]);
    setPresets(BUILTIN_PRESETS);
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
