import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIRECTORY, '..');

export function auditAccessibilitySources({
  appSource,
  appShellSource,
  rollWorkspaceSource,
  commandPaletteSource,
  onboardingSource,
  settingsSource,
  stylesSource,
}) {
  const findings = [];

  requireSource(
    findings,
    appSource,
    ['className="skip-link"', 'href="#main-content"', 'messages.common.skipToContent'],
    'src/App.tsx: keyboard skip link to #main-content must remain present and localized',
  );
  requireSource(
    findings,
    appShellSource,
    ['<main className="main-content" id="main-content">', 'aria-current={view === id ? \'page\' : undefined}'],
    'src/components/AppShell.tsx: main landmark and current-page navigation semantics are required',
  );
  requireSource(
    findings,
    appShellSource,
    ['aria-haspopup="dialog"', 'aria-keyshortcuts="Control+K Meta+K"'],
    'src/components/AppShell.tsx: command-palette trigger must expose dialog and keyboard-shortcut semantics',
  );
  requireSource(
    findings,
    rollWorkspaceSource,
    ['aria-live="polite"', 'role="alert"', 'aria-invalid={Boolean(validation.error)}', 'aria-describedby="expression-help expression-error"'],
    'src/components/RollWorkspace.tsx: roll results and validation errors must remain screen-reader announced',
  );
  requireSource(
    findings,
    commandPaletteSource,
    ['role="dialog"', 'aria-modal="true"', 'aria-labelledby="commands-title"', 'previouslyFocused?.focus()', "event.key !== 'Tab'"],
    'src/components/CommandPalette.tsx: modal semantics, focus restoration, and tab containment are required',
  );
  requireSource(
    findings,
    onboardingSource,
    ['role="dialog"', 'aria-modal="true"', 'aria-labelledby="onboarding-title"', 'aria-describedby="onboarding-description"', 'startButtonRef.current?.focus()'],
    'src/components/Onboarding.tsx: onboarding dialog semantics and deterministic initial focus are required',
  );
  requireSource(
    findings,
    settingsSource,
    ['role="status"', 'type="checkbox"', 'aria-label={messages.settings.importBackup}'],
    'src/components/SettingsPanel.tsx: asynchronous data status, toggle semantics, and file-input labeling are required',
  );
  requireSource(
    findings,
    stylesSource,
    ['button:focus-visible', 'input:focus-visible', 'select:focus-visible', 'a:focus-visible', '.skip-link:focus'],
    'src/styles.css: visible keyboard focus indicators and skip-link reveal behavior are required',
  );

  return findings;
}

export async function auditAccessibilityFiles(root = ROOT) {
  const [
    appSource,
    appShellSource,
    rollWorkspaceSource,
    commandPaletteSource,
    onboardingSource,
    settingsSource,
    stylesSource,
  ] = await Promise.all([
    readFile(path.join(root, 'src/App.tsx'), 'utf8'),
    readFile(path.join(root, 'src/components/AppShell.tsx'), 'utf8'),
    readFile(path.join(root, 'src/components/RollWorkspace.tsx'), 'utf8'),
    readFile(path.join(root, 'src/components/CommandPalette.tsx'), 'utf8'),
    readFile(path.join(root, 'src/components/Onboarding.tsx'), 'utf8'),
    readFile(path.join(root, 'src/components/SettingsPanel.tsx'), 'utf8'),
    readFile(path.join(root, 'src/styles.css'), 'utf8'),
  ]);

  return auditAccessibilitySources({
    appSource,
    appShellSource,
    rollWorkspaceSource,
    commandPaletteSource,
    onboardingSource,
    settingsSource,
    stylesSource,
  });
}

function requireSource(findings, source, requiredFragments, message) {
  if (requiredFragments.some((fragment) => !source.includes(fragment))) findings.push(message);
}

async function main() {
  let findings;
  try {
    findings = await auditAccessibilityFiles();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`Accessibility contract audit could not read required files: ${message}`);
    process.exitCode = 1;
    return;
  }

  if (findings.length === 0) {
    console.log('Accessibility contract audit passed.');
    return;
  }

  console.error('Accessibility contract audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
