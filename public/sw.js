const CACHE_NAME = 'freeprivacy-v2';
const APP_SHELL = ['/index.html', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('freeprivacy-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Always request the latest HTML so it cannot reference an old, missing JS bundle.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || Response.error();
      })
    );
    return;
  }

  // Never return index.html as a substitute for a missing JavaScript or CSS file.
  event.respondWith(
    fetch(request).then((response) => {
      const type = response.headers.get('content-type') || '';
      const isCacheableAsset = response.ok &&
        !type.includes('text/html') &&
        (url.pathname.startsWith('/assets/') ||
         /\.(?:js|mjs|css|svg|png|webp|jpg|jpeg|woff2?|ico)$/i.test(url.pathname));

      if (isCacheableAsset) {
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        );
      }

      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || Response.error();
    })
  );
});
