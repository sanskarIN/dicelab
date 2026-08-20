import assert from 'node:assert/strict';
import test from 'node:test';
import { auditPwaBundle } from './check-pwa.mjs';

function fixture(overrides = {}) {
  return {
    manifest: {
      name: 'DiceLab',
      short_name: 'DiceLab',
      description: 'Offline dice simulator',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      icons: [{ src: '/dicelab-icon.svg' }],
    },
    indexHtml:
      '<meta name="viewport" content="width=device-width, viewport-fit=cover"><meta name="theme-color" content="#111827"><link rel="manifest" href="/manifest.webmanifest">',
    serviceWorker:
      "self.addEventListener('install',()=>{});self.addEventListener('activate',()=>{});self.addEventListener('fetch',()=>{});if (url.origin !== self.location.origin) return;if (request.method !== 'GET') return;",
    mainSource: 'void registerPwaServiceWorker();',
    registrationSource:
      "import.meta.env.PROD; isTauriRuntime(); environment.serviceWorker.register('/sw.js', { scope: '/' });",
    ...overrides,
  };
}

test('accepts the expected PWA boundary contract', () => {
  assert.deepEqual(auditPwaBundle(fixture()), []);
});

test('requires mobile viewport safe-area support', () => {
  const findings = auditPwaBundle(
    fixture({
      indexHtml:
        '<meta name="viewport" content="width=device-width"><meta name="theme-color" content="#111827"><link rel="manifest" href="/manifest.webmanifest">',
    }),
  );
  assert.ok(findings.some((finding) => finding.includes('viewport-fit=cover')));
});

test('requires same-origin cache handling and Tauri exclusion', () => {
  const findings = auditPwaBundle(
    fixture({
      serviceWorker:
        "self.addEventListener('install',()=>{});self.addEventListener('activate',()=>{});self.addEventListener('fetch',()=>{});if (request.method !== 'GET') return;",
      registrationSource:
        "import.meta.env.PROD; environment.serviceWorker.register('/sw.js', { scope: '/' });",
    }),
  );
  assert.ok(findings.some((finding) => finding.includes('current origin')));
  assert.ok(findings.some((finding) => finding.includes('Tauri runtime exclusion')));
});
