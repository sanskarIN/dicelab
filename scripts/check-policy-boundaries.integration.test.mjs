import assert from 'node:assert/strict';
import test from 'node:test';
import { auditAccessibilitySources, auditPolicyBoundaries } from './check-policy-boundaries.mjs';

const validAccessibilitySources = {
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

test('all committed policy boundaries satisfy their repository audits', async () => {
  assert.deepEqual(await auditPolicyBoundaries(), []);
});

test('accessibility contract accepts the complete semantics set', () => {
  assert.deepEqual(auditAccessibilitySources(validAccessibilitySources), []);
});

test('accessibility contract reports a missing skip-link boundary', () => {
  const findings = auditAccessibilitySources({
    ...validAccessibilitySources,
    appSource: '<a href="#main-content">Skip</a>',
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /skip link/i);
});

test('accessibility contract reports lost modal focus containment', () => {
  const findings = auditAccessibilitySources({
    ...validAccessibilitySources,
    commandPaletteSource:
      'role="dialog" aria-modal="true" aria-labelledby="commands-title" previouslyFocused?.focus()',
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /focus restoration.*tab containment/i);
});
