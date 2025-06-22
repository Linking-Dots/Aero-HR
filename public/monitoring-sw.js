/**
 * Monitoring Service Worker
 * Provides offline capability and performance monitoring for the ERP system
 */

const CACHE_NAME = 'dbedc-erp-monitoring-v1';
const STATIC_CACHE = 'dbedc-erp-static-v1';

// Cache static assets
const STATIC_ASSETS = [
    '/favicon.ico',
    '/android/android-launchericon-48-48.png',
    '/android/android-launchericon-72-72.png',
    '/android/android-launchericon-96-96.png',
    '/android/android-launchericon-144-144.png',
    '/android/android-launchericon-192-192.png',
    '/android/android-launchericon-512-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Monitoring Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Monitoring Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

// Fetch event - network first strategy with performance monitoring
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Handle API requests with network-first strategy and monitoring
    if (request.url.includes('/api/') || request.url.includes('/dashboard') || request.url.includes('/admin/')) {
        event.respondWith(
            networkFirstWithMonitoring(request)
        );
        return;
    }

    // Handle static assets with cache-first strategy
    if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
        event.respondWith(
            cacheFirst(request)
        );
        return;
    }

    // Default: network first for all other requests
    event.respondWith(
        networkFirst(request)
    );
});

// Network-first strategy with performance monitoring
async function networkFirstWithMonitoring(request) {
    const startTime = performance.now();
    
    try {
        const response = await fetch(request);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log slow requests
        if (duration > 2000) {
            console.warn(`Slow request detected: ${request.url} took ${duration.toFixed(2)}ms`);
            
            // Store performance data for later sync
            storePerformanceData({
                url: request.url,
                duration: duration,
                timestamp: new Date().toISOString(),
                type: 'slow_request'
            });
        }
        
        // Cache successful responses
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn(`Network request failed: ${request.url}`, error);
        
        // Store error data for later sync
        storePerformanceData({
            url: request.url,
            error: error.message,
            timestamp: new Date().toISOString(),
            type: 'network_error'
        });
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>DBEDC ERP - Offline</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: system-ui, -apple-system, sans-serif; 
                            text-align: center; 
                            padding: 2rem; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0;
                        }
                        .container {
                            max-width: 400px;
                            background: rgba(255,255,255,0.1);
                            backdrop-filter: blur(10px);
                            border-radius: 16px;
                            padding: 2rem;
                            border: 1px solid rgba(255,255,255,0.2);
                        }
                        h1 { margin: 0 0 1rem 0; }
                        .icon { font-size: 4rem; margin-bottom: 1rem; }
                        button {
                            background: rgba(255,255,255,0.2);
                            border: 1px solid rgba(255,255,255,0.3);
                            color: white;
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 1rem;
                            margin-top: 1rem;
                        }
                        button:hover {
                            background: rgba(255,255,255,0.3);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">📡</div>
                        <h1>You're Offline</h1>
                        <p>Unable to connect to DBEDC ERP servers. Please check your internet connection and try again.</p>
                        <button onclick="window.location.reload()">Try Again</button>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        throw error;
    }
}

// Cache-first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.warn(`Failed to fetch ${request.url}:`, error);
        throw error;
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Store performance data in IndexedDB for later sync
function storePerformanceData(data) {
    // Simple implementation - in production, you'd use IndexedDB
    if ('indexedDB' in self) {
        // Store in IndexedDB for later sync when online
        const request = indexedDB.open('ERPMonitoring', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['performance'], 'readwrite');
            const store = transaction.objectStore('performance');
            store.add(data);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('performance')) {
                db.createObjectStore('performance', { keyPath: 'id', autoIncrement: true });
            }
        };
    }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                event.ports[0].postMessage({ type: 'CACHE_SIZE', payload: size });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearCache().then(() => {
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            });
            break;
            
        default:
            console.log('Unknown message type:', type);
    }
});

// Get cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const size = (await response.blob()).size;
                totalSize += size;
            }
        }
    }
    
    return totalSize;
}

// Clear all caches
async function clearCache() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
}
