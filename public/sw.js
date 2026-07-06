const CACHE_NAME = 'cgb-cache-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json'
];

// 1. INSTALL: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline fallback shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Strategy Router
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (appointments, calculations, logs)
  if (request.method !== 'GET') {
    return;
  }

  // Skip Admin paths and Auth API routes - always hit network
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/auth')) {
    return;
  }

  // A. Stale-While-Revalidate for Live Gold Rates API endpoint
  if (url.pathname === '/api/rates') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            // Update cache with fresh rates
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch((err) => {
            console.warn('[Service Worker] Failed to fetch rates from network. Serving cached rates.', err);
          });
          
          // Return cached response instantly (or wait for network if cache is empty)
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // B. Page Navigation Fallback (Offline Page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // C. Cache-First for static assets (fonts, icons, public uploads)
  const isStaticAsset = 
    url.pathname.includes('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/uploads/') ||
    request.destination === 'font' ||
    request.destination === 'image';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Cache the resource on demand if fetch succeeded
          if (networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
