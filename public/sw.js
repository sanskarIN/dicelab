const CACHE_PREFIX = 'dicelab-';
const CACHE_NAME = `${CACHE_PREFIX}runtime-v3`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/dicelab-icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];
const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'image', 'font', 'manifest']);

self.addEventListener('install', (event) => {
  event.waitUntil(precacheApplicationShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (CACHEABLE_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function precacheApplicationShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);

  const indexResponse = (await cache.match('/index.html')) ?? (await cache.match('/'));
  if (!indexResponse) return;

  const html = await indexResponse.text();
  const buildAssets = discoverBuildAssets(html);
  if (buildAssets.length > 0) await cache.addAll(buildAssets);
}

function discoverBuildAssets(html) {
  const assets = new Set();
  const references = html.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi);

  for (const reference of references) {
    try {
      const url = new URL(reference[1], self.location.origin);
      if (url.origin !== self.location.origin || !url.pathname.startsWith('/assets/')) continue;
      assets.add(`${url.pathname}${url.search}`);
    } catch {
      // Ignore malformed document references; the static application shell remains cached.
    }
  }

  return [...assets];
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ??
      (await cache.match('/')) ??
      (await cache.match('/index.html')) ??
      Response.error()
    );
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network.then(() => undefined));
    return cached;
  }

  return (await network) ?? Response.error();
}
