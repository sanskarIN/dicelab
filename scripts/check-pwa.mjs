import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const REQUIRED_APP_SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/dicelab-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

export function auditPwaBundle({ manifest, indexHtml, serviceWorker, mainSource, registrationSource }) {
  const findings = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return ['public/manifest.webmanifest: manifest root must be an object'];
  }

  for (const field of ['name', 'short_name', 'description', 'start_url', 'scope', 'display']) {
    if (typeof manifest[field] !== 'string' || manifest[field].trim().length === 0) {
      findings.push(`public/manifest.webmanifest: ${field} must be a non-empty string`);
    }
  }

  if (manifest.start_url !== '/') {
    findings.push('public/manifest.webmanifest: start_url must remain / for the current Vite base');
  }
  if (manifest.scope !== '/') {
    findings.push('public/manifest.webmanifest: scope must remain / for the current Vite base');
  }

  const displayModes = new Set([
    manifest.display,
    ...(Array.isArray(manifest.display_override) ? manifest.display_override : []),
  ]);
  if (!displayModes.has('standalone')) {
    findings.push('public/manifest.webmanifest: standalone display support is required');
  }

  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    findings.push('public/manifest.webmanifest: at least one install icon is required');
  } else {
    for (const [index, icon] of manifest.icons.entries()) {
      if (!isSafeLocalAssetPath(icon?.src)) {
        findings.push(`public/manifest.webmanifest: icons[${index}].src must be a safe root-relative local path`);
      }
    }

    if (!hasPngIcon(manifest.icons, '/icon-192.png', '192x192')) {
      findings.push('public/manifest.webmanifest: a 192x192 PNG install icon is required');
    }
    if (!hasPngIcon(manifest.icons, '/icon-512.png', '512x512')) {
      findings.push('public/manifest.webmanifest: a 512x512 PNG install icon is required');
    }

    const maskableIcon = manifest.icons.find((icon) => icon?.src === '/icon-512.png');
    const purposes = typeof maskableIcon?.purpose === 'string' ? maskableIcon.purpose.split(/\s+/) : [];
    if (!purposes.includes('maskable')) {
      findings.push('public/manifest.webmanifest: the 512x512 PNG icon must support maskable purpose');
    }
  }

  if (!/<link\s+rel=["']manifest["']\s+href=["']\/manifest\.webmanifest["']/i.test(indexHtml)) {
    findings.push('index.html: PWA manifest link is missing');
  }
  if (!/viewport-fit=cover/i.test(indexHtml)) {
    findings.push('index.html: viewport-fit=cover is required for mobile safe-area insets');
  }
  if (!/<meta\s+name=["']theme-color["']/i.test(indexHtml)) {
    findings.push('index.html: theme-color metadata is required');
  }
  if (
    !/<link\s+rel=["']apple-touch-icon["']\s+sizes=["']180x180["']\s+href=["']\/apple-touch-icon\.png["']/i.test(
      indexHtml,
    )
  ) {
    findings.push('index.html: 180x180 Apple touch icon metadata is required');
  }

  for (const eventName of ['install', 'activate', 'fetch']) {
    const pattern = new RegExp(`addEventListener\\(['\"]${eventName}['\"]`);
    if (!pattern.test(serviceWorker)) {
      findings.push(`public/sw.js: ${eventName} event handler is required`);
    }
  }
  if (!serviceWorker.includes("url.origin !== self.location.origin")) {
    findings.push('public/sw.js: cache handling must remain restricted to the current origin');
  }
  if (!serviceWorker.includes("request.method !== 'GET'")) {
    findings.push('public/sw.js: non-GET requests must bypass the cache');
  }
  for (const asset of REQUIRED_APP_SHELL_ASSETS) {
    if (!serviceWorker.includes(`'${asset}'`)) {
      findings.push(`public/sw.js: app shell must precache ${asset}`);
    }
  }
  if (!serviceWorker.includes('precacheApplicationShell')) {
    findings.push('public/sw.js: install must use the complete application-shell precache path');
  }
  if (
    !serviceWorker.includes('discoverBuildAssets') ||
    !serviceWorker.includes("url.pathname.startsWith('/assets/')") ||
    !serviceWorker.includes('cache.addAll(buildAssets)')
  ) {
    findings.push('public/sw.js: generated Vite /assets/ runtime files must be discovered and precached');
  }

  if (!mainSource.includes('registerPwaServiceWorker')) {
    findings.push('src/main.tsx: PWA registration call is missing');
  }
  if (!registrationSource.includes('import.meta.env.PROD')) {
    findings.push('src/services/pwa.ts: service worker registration must stay production-only');
  }
  if (!registrationSource.includes('isTauriRuntime()')) {
    findings.push('src/services/pwa.ts: Tauri runtime exclusion is required');
  }
  if (!registrationSource.includes("register('/sw.js', { scope: '/' })")) {
    findings.push('src/services/pwa.ts: root service worker registration contract changed');
  }

  return findings;
}

export async function auditPwaFiles(root = ROOT) {
  const manifestPath = path.join(root, 'public/manifest.webmanifest');
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    return ['public/manifest.webmanifest: file must exist and contain valid JSON'];
  }

  const [indexHtml, serviceWorker, mainSource, registrationSource] = await Promise.all([
    readFile(path.join(root, 'index.html'), 'utf8'),
    readFile(path.join(root, 'public/sw.js'), 'utf8'),
    readFile(path.join(root, 'src/main.tsx'), 'utf8'),
    readFile(path.join(root, 'src/services/pwa.ts'), 'utf8'),
  ]);

  const findings = auditPwaBundle({ manifest, indexHtml, serviceWorker, mainSource, registrationSource });
  if (Array.isArray(manifest.icons)) {
    for (const [index, icon] of manifest.icons.entries()) {
      if (!isSafeLocalAssetPath(icon?.src)) continue;
      const iconPath = path.join(root, 'public', icon.src.slice(1));
      try {
        await access(iconPath);
      } catch {
        findings.push(`public/manifest.webmanifest: icons[${index}] does not resolve to ${icon.src}`);
      }
    }
  }

  try {
    await access(path.join(root, 'public/apple-touch-icon.png'));
  } catch {
    findings.push('index.html: /apple-touch-icon.png does not resolve to a public asset');
  }

  return findings;
}

function hasPngIcon(icons, expectedSrc, expectedSize) {
  return icons.some(
    (icon) => icon?.src === expectedSrc && icon?.sizes === expectedSize && icon?.type === 'image/png',
  );
}

function isSafeLocalAssetPath(value) {
  return (
    typeof value === 'string' &&
    /^\/(?!\/)[A-Za-z0-9._/-]+$/.test(value) &&
    !/(?:^|\/)\.\.(?:\/|$)/.test(value)
  );
}

async function main() {
  let findings;
  try {
    findings = await auditPwaFiles();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`PWA integrity audit could not read required files: ${message}`);
    process.exitCode = 1;
    return;
  }

  if (findings.length === 0) {
    console.log('PWA integrity audit passed.');
    return;
  }

  console.error('PWA integrity audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();