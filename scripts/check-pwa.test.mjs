import assert from 'node:assert/strict';
import test from 'node:test';
import { auditPwaBundle } from './check-pwa.mjs';

const COMPLETE_SERVICE_WORKER =
  "self.addEventListener('install',()=>precacheApplicationShell());self.addEventListener('activate',()=>{});self.addEventListener('fetch',()=>{});if (url.origin !== self.location.origin) return;if (request.method !== 'GET') return;const assets=['/manifest.webmanifest','/dicelab-icon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];function precacheApplicationShell(){const buildAssets=discoverBuildAssets('');cache.addAll(buildAssets);}function discoverBuildAssets(){if(url.pathname.startsWith('/assets/')) return [];}";

function fixture(overrides = {}) {
  return {
    manifest: {
      name: 'DiceLab',
      short_name: 'DiceLab',
      description: 'Offline dice simulator',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    indexHtml:
      '<meta name="viewport" content="width=device-width, viewport-fit=cover"><meta name="theme-color" content="#111827"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">',
    serviceWorker: COMPLETE_SERVICE_WORKER,
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
        '<meta name="viewport" content="width=device-width"><meta name="theme-color" content="#111827"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">',
    }),
  );
  assert.ok(findings.some((finding) => finding.includes('viewport-fit=cover')));
});

test('requires same-origin cache handling and Tauri exclusion', () => {
  const findings = auditPwaBundle(
    fixture({
      serviceWorker: COMPLETE_SERVICE_WORKER.replace('if (url.origin !== self.location.origin) return;', ''),
      registrationSource:
        "import.meta.env.PROD; environment.serviceWorker.register('/sw.js', { scope: '/' });",
    }),
  );
  assert.ok(findings.some((finding) => finding.includes('current origin')));
  assert.ok(findings.some((finding) => finding.includes('Tauri runtime exclusion')));
});

test('requires standard PNG install sizes and a maskable large icon', () => {
  const findings = auditPwaBundle(
    fixture({
      manifest: {
        ...fixture().manifest,
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }],
      },
    }),
  );

  assert.ok(findings.some((finding) => finding.includes('512x512 PNG install icon')));
  assert.ok(findings.some((finding) => finding.includes('maskable purpose')));
});

test('rejects remote and path-traversing manifest icon sources', () => {
  const findings = auditPwaBundle(
    fixture({
      manifest: {
        ...fixture().manifest,
        icons: [
          { src: '//example.test/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/../icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  );

  assert.equal(findings.filter((finding) => finding.includes('safe root-relative local path')).length, 2);
});

test('requires Apple touch icon metadata and precached install assets', () => {
  const findings = auditPwaBundle(
    fixture({
      indexHtml:
        '<meta name="viewport" content="width=device-width, viewport-fit=cover"><meta name="theme-color" content="#111827"><link rel="manifest" href="/manifest.webmanifest">',
      serviceWorker: COMPLETE_SERVICE_WORKER.replace(",'/apple-touch-icon.png'", ''),
    }),
  );

  assert.ok(findings.some((finding) => finding.includes('Apple touch icon metadata')));
  assert.ok(findings.some((finding) => finding.includes('precache /apple-touch-icon.png')));
});

test('requires generated Vite runtime assets to be precached during install', () => {
  const findings = auditPwaBundle(
    fixture({
      serviceWorker: COMPLETE_SERVICE_WORKER.replace(
        "function discoverBuildAssets(){if(url.pathname.startsWith('/assets/')) return [];}",
        'function discoverBuildAssets(){return [];}',
      ),
    }),
  );

  assert.ok(findings.some((finding) => finding.includes('generated Vite /assets/ runtime files')));
});