# DiceLab Web / PWA Guide

DiceLab's browser companion is an installable Progressive Web App (PWA) in production builds while the Tauri desktop and mobile applications continue to use the same React product without browser service-worker registration.

## Goals

The web target is designed to provide:

- the same core dice, history, statistics, probability, preset, backup, localization, theme, and accessibility surfaces as the browser companion;
- install metadata for Chromium-family browsers and other standards-based PWA-capable browsers;
- iOS/iPadOS home-screen metadata and a dedicated Apple touch icon;
- an offline application shell after the first successful production load;
- local-only application data through the existing browser storage boundary;
- no service-worker interception inside Tauri desktop, Android, or iOS runtimes.

The PWA layer does not replace the native Tauri applications. It strengthens the web/ChromeOS install path and provides a browser-install option where a native package is unnecessary or unavailable.

## Source-of-truth files

| File | Responsibility |
| --- | --- |
| `index.html` | Manifest, theme, mobile-web-app, Apple home-screen, favicon, and safe-area viewport metadata. |
| `public/manifest.webmanifest` | Install identity, standalone display policy, theme/background colors, categories, and icon declarations. |
| `public/sw.js` | Same-origin offline application-shell and runtime asset caching. |
| `public/dicelab-icon.svg` | Scalable browser/favicon branding asset. |
| `public/icon-192.png` | Standard 192×192 PNG install icon. |
| `public/icon-512.png` | Standard 512×512 PNG install icon with maskable purpose. |
| `public/apple-touch-icon.png` | 180×180 iOS/iPadOS home-screen icon. |
| `src/services/pwa.ts` | Production/browser/Tauri registration boundary. |
| `src/services/pwa.test.ts` | Unit coverage for registration eligibility and failure behavior. |
| `scripts/check-pwa.mjs` | Dependency-free repository audit for install/offline invariants. |
| `scripts/check-pwa.test.mjs` | Self-tests proving the PWA audit catches representative regressions. |

## Registration boundary

`src/main.tsx` calls `registerPwaServiceWorker()` after mounting the React application. The registration service intentionally fails closed unless all of these conditions are true:

1. the Vite build is a production build (`import.meta.env.PROD`);
2. the runtime is **not** Tauri;
3. the browser exposes `navigator.serviceWorker`;
4. the origin is HTTPS, or HTTP on a recognized loopback/localhost host.

This prevents development HMR sessions and Tauri webviews from being unexpectedly controlled by a browser service worker.

A registration failure is non-fatal. DiceLab continues to run as a normal web application and records only a bounded local diagnostic event through the shared logger.

## Offline cache strategy

`public/sw.js` uses a versioned DiceLab cache namespace.

### Install

The service worker precaches the stable application shell:

- `/`;
- `/index.html`;
- `/manifest.webmanifest`;
- the SVG browser icon;
- the 192×192 and 512×512 PNG install icons;
- the Apple touch icon.

A changed cache generation should use a new `CACHE_NAME` so old DiceLab cache generations can be removed during activation.

### Activate

Activation deletes older caches whose names start with the DiceLab cache prefix while retaining the current cache. It then claims eligible clients.

### Navigation requests

Same-origin navigation requests use a network-first strategy. Successful navigation responses are cached. If the network is unavailable, the service worker falls back to a cached navigation response and then the cached root/index shell.

This keeps online deployments fresh while still allowing an already-loaded production app to reopen offline.

### Static runtime assets

Same-origin scripts, styles, images, fonts, and manifests use stale-while-revalidate behavior:

1. return the cached asset immediately when available;
2. refresh it from the network in the background;
3. cache successful same-origin basic responses;
4. fall back to the network result when there was no cache hit.

Non-GET requests, range requests, and cross-origin requests bypass DiceLab's cache handler.

## Security and privacy boundaries

The PWA layer must preserve the repository's offline-first and least-privilege model.

- The service worker must not cache or intercept cross-origin requests.
- No remote CDN/runtime asset is required by the PWA files.
- The manifest must use local root-relative icon paths.
- Manifest icon paths must not contain path traversal.
- The service worker must not handle mutation requests.
- The PWA layer does not introduce analytics, remote telemetry, sign-in, advertising, or a cloud data store.
- Browser user data remains under the existing validated localStorage/import/export boundaries.
- Tauri native export and randomness trust boundaries remain unchanged because service-worker registration is excluded in Tauri.

The Tauri CSP/offline-network policy and the browser PWA cache are related but separate controls: the former constrains native-webview network capabilities, while the latter controls production browser caching.

## Install behavior by platform

Browser install UI is controlled by the browser/operating system and may differ by version.

### Desktop browsers and ChromeOS

A compatible browser can treat the production site as an installable standalone web application when the manifest, icon, secure-origin, and service-worker conditions are satisfied. The installed app continues to use browser storage and browser download behavior.

### Android browsers

Compatible browsers can expose an install/add-to-home-screen flow. The manifest includes standard 192×192 and 512×512 PNG assets, with the large icon also marked maskable for launchers that support adaptive presentation.

### iOS / iPadOS browsers

`index.html` includes Apple home-screen metadata plus a 180×180 Apple touch icon. The viewport includes `viewport-fit=cover`, which is also required for the safe-area CSS already used by DiceLab on notched/edge-to-edge devices.

The native Tauri iOS/iPadOS build remains a separate distribution path with Xcode/signing requirements.

## Development and verification

The development server deliberately does not register the service worker. Use the production build/preview path for PWA verification:

```bash
npm ci
npm run build
npm run preview
```

Then open the preview URL in a compatible browser. For local preview, loopback HTTP is accepted by the registration guard because browsers treat localhost as a secure development context for service workers.

Repository checks:

```bash
npm run policy:pwa:test
npm run policy:pwa
npm run test
npm run build
```

`policy:pwa` first syntax-checks `public/sw.js`, then validates the committed manifest, install metadata, local icon paths/files, required PNG sizes, maskable support, Apple touch metadata, service-worker event/same-origin/GET-only boundaries, complete application-shell precache, production-only registration, and Tauri exclusion.

The main GitHub Actions web-quality job runs both the PWA audit self-test and the real PWA integrity audit before installing application dependencies.

## Manual release-candidate checks

Automated checks cannot prove every browser's install UI. For a release candidate, record at least:

- manifest loads without browser parse errors;
- 192×192, 512×512, and Apple icons render correctly;
- a compatible desktop/ChromeOS browser offers installation where supported;
- a compatible Android browser can add/install the app where supported;
- iOS/iPadOS Add to Home Screen uses the expected icon/title;
- reopening after a successful first load works with the network disabled;
- rolling/history/settings continue to use local persisted data offline;
- browser export/download behavior still works when permitted by the browser;
- reconnecting refreshes application assets without corrupting stored user data;
- Tauri desktop/mobile builds do not register `/sw.js`.

Treat these observations as release evidence, not as assumptions derived from source configuration.

## Changing the PWA layer safely

When changing manifest metadata, icons, caching, or service-worker registration:

1. keep the browser/native runtime boundary explicit;
2. avoid remote runtime dependencies;
3. update the cache generation when the precached shell changes materially;
4. update `scripts/check-pwa.mjs` when a new invariant should be permanent;
5. add or update audit self-tests before relying on a new check;
6. update this guide and the repository file reference for new/renamed/deleted files;
7. run the PWA policy checks, normal frontend tests/build, and documentation checks;
8. verify install/offline behavior in a real production build before claiming release evidence.
