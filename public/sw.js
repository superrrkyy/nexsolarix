/* NexSolarix offline shell.
 *
 * Strategy: cache-first for same-origin GET requests, network refresh in the
 * background. Navigations fall back to the cached shell so the app opens
 * offline. Nothing cross-origin is ever cached.
 *
 * All paths are resolved against the service worker scope, so the same file
 * works when the site is hosted from a sub-folder (GitHub Pages).
 */

const CACHE = 'nexsolarix-v1';
const SCOPE = new URL(self.registration.scope);
const at = (path) => new URL(path, SCOPE).href;
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'favicon.svg'].map(at);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(at('index.html')).then((cached) => cached ?? Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
