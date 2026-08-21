import assert from 'node:assert/strict';
import test from 'node:test';
import { auditAccessibilitySources } from './check-accessibility-contract.mjs';

const validSources = {
  appSource: '<a className="skip-link" href="#main-content">{messages.common.skipToContent}</a>',
  appShellSource:
    '<main className="main-content" id="main-content"> aria-current={view === id ? \'page\' : undefined} aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K"',
  rollWorkspaceSource:
    'aria-live="polite" role="alert" aria-invalid={Boolean(validation.error)} aria-describedby="expression-help expression-error"',
  commandPaletteSource:
    'role="dialog" aria-modal="true" aria-labelledby="commands-title" previouslyFocused?.focus() event.key !== \'Tab\'',
  onboardingSource:
    'role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" startButtonRef.current?.focus()',
  settingsSource: 'role="status" type="checkbox" aria-label={messages.settings.importBackup}',
  stylesSource:
    'button:focus-visible input:focus-visible select:focus-visible a:focus-visible .skip-link:focus',
};

test('accepts the complete accessibility contract', () => {
  assert.deepEqual(auditAccessibilitySources(validSources), []);
});

test('reports a missing keyboard skip-link contract', () => {
  const findings = auditAccessibilitySources({
    ...validSources,
    appSource: '<a href="#main-content">Skip</a>',
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /skip link/i);
});

test('reports lost command-palette focus containment', () => {
  const findings = auditAccessibilitySources({
    ...validSources,
    commandPaletteSource:
      'role="dialog" aria-modal="true" aria-labelledby="commands-title" previouslyFocused?.focus()',
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /focus restoration.*tab containment/i);
});

test('reports lost result announcement semantics', () => {
  const findings = auditAccessibilitySources({
    ...validSources,
    rollWorkspaceSource:
      'role="alert" aria-invalid={Boolean(validation.error)} aria-describedby="expression-help expression-error"',
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /screen-reader announced/i);
});
