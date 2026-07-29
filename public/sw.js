const CACHE = 'mr-pasta-pos-v5';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './admin.html',
  './admin.css',
  './admin.js',
  './srv.html',
  './manifest.json',
  './assets/logo.png',
  './assets/restaurant.webp',
  './assets/dish-placeholder.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './vendor/qrious.min.js',
  './vendor/qr-scanner.umd.min.js',
  './vendor/qr-scanner-worker.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  // 1. Ignore any non-GET request (POST, PUT, DELETE, PATCH)
  if (event.request.method !== 'GET') return;

  // 2. Ignore all API endpoints
  if (event.request.url.includes('/api/')) return;

  // 3. Ignore cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Static assets: Cache First with background revalidation
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, responseToCache)).catch(() => {});
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, responseToCache)).catch(() => {});
        }
        return networkResponse;
      });
    })
  );
});
