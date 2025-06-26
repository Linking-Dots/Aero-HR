// Service Worker for DBEDC ERP
// Provides basic offline functionality and caching

const CACHE_NAME = 'dbedc-erp-v1';
const urlsToCache = [
  '/',
  '/css/app.css',
  '/js/app.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache each resource individually to prevent one failure from breaking all
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              // Continue even if some resources fail to cache
              return Promise.resolve();
            });
          })
        );
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache error responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();
            
            // Cache the successful response
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(error => console.warn('Failed to cache response:', error));
              
            return networkResponse;
          })
          .catch(() => {
            // Return a fallback response if both cache and network fail
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html') || new Response('You are offline');
            }
            return new Response('Network error occurred', { status: 408 });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Sync any pending data when connection is restored
  console.log('Background sync triggered');
}
