/// <reference lib="webworker" />

const CACHE_NAME = 'stc-cache-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/manifest.json',
    '/favicon.ico',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Use type assertion to tell TS this is a ServiceWorker
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event: ExtendableEvent) => {
    const installHandler = async () => {
        try {
            console.log('[SW] Installing...');
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(ASSETS_TO_CACHE);
            console.log('[SW] Installed');
        } catch (error) {
            console.error('[SW] Install failed:', error);
        }
    };

    event.waitUntil(installHandler());
    sw.skipWaiting();
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
    const activateHandler = async () => {
        try {
            console.log('[SW] Activating...');
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
            await sw.clients.claim();
            console.log('[SW] Activated');
        } catch (error) {
            console.error('[SW] Activate failed:', error);
        }
    };

    event.waitUntil(activateHandler());
});

sw.addEventListener('fetch', (event: FetchEvent) => {
    if (event.request.method !== 'GET') return;

    const fetchHandler = async () => {
        try {
            // Navigation requests (HTML pages) -> Network First with Offline Fallback
            if (event.request.mode === 'navigate') {
                try {
                    return await fetch(event.request);
                } catch (error) {
                    console.error('[SW] Navigation fetch failed, falling back to offline page', error);
                    const cache = await caches.open(CACHE_NAME);
                    const offlineResponse = await cache.match(OFFLINE_URL);
                    if (offlineResponse) return offlineResponse;
                    throw error;
                }
            }

            // Stale-while-revalidate for assets
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                // Update cache in background
                const updateCache = async () => {
                    try {
                        const networkResponse = await fetch(event.request);
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            const cache = await caches.open(CACHE_NAME);
                            await cache.put(event.request, responseToCache);
                        }
                    } catch (err) {
                        console.error('[SW] Background cache update failed:', err);
                    }
                };
                event.waitUntil(updateCache());

                return cachedResponse;
            }

            // Network First for everything else
            const networkResponse = await fetch(event.request);

            // Valid response check and cache
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                const cacheOp = async () => {
                    try {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(event.request, responseToCache);
                    } catch (err) {
                        console.error('[SW] Cache put failed:', err);
                    }
                };
                event.waitUntil(cacheOp());
            }

            return networkResponse;

        } catch (error) {
            console.error('[SW] Fetch failed:', error);

            // Null-safe Accept header check
            const accept = event.request.headers.get('accept') || '';
            if (accept.includes('image')) {
                // Could return a placeholder image here if we had one
                // return caches.match('/images/offline-placeholder.png');
            }

            throw error;
        }
    };

    event.respondWith(fetchHandler());
});
