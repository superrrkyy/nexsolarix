// Bump this version when changing the shell cache so old asset caches are evicted.
const CACHE_NAME = 'nexsolarix-shell-v2';
const SHELL = ['/', '/manifest.webmanifest', '/nexsolarix-mark.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

function cacheSuccessfulResponse(event, request, responsePromise) {
  event.waitUntil(responsePromise.then(async (response) => {
    if (!response.ok) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }).catch(() => undefined));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;

  if (request.mode === 'navigate') {
    const responsePromise = fetch(request);
    event.respondWith(responsePromise.catch(async () => (await caches.match('/')) || Response.error()));
    cacheSuccessfulResponse(event, '/', responsePromise);
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    let fetchedFromNetwork = false;
    const responsePromise = caches.match(request).then((cached) => {
      if (cached) return cached;
      fetchedFromNetwork = true;
      return fetch(request);
    });
    event.respondWith(responsePromise);
    event.waitUntil(responsePromise.then(async (response) => {
      if (!fetchedFromNetwork || !response.ok) return;
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }).catch(() => undefined));
  }
});
