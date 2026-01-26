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
            // Move skipWaiting to successful path
            sw.skipWaiting();
        } catch (error) {
            console.error('[SW] Install failed:', error);
            // Re-throw so installation fails
            throw error;
        }
    };

    event.waitUntil(installHandler());
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

async function handleNavigate(request: Request): Promise<Response> {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('[SW] Navigation fetch failed, falling back to offline page', error);
        const cache = await caches.open(CACHE_NAME);
        const offlineResponse = await cache.match(OFFLINE_URL);
        if (offlineResponse) return offlineResponse;
        throw error;
    }
}

async function handleCachedAsset(request: Request, cachedResponse: Response, event: FetchEvent): Promise<Response> {
    try {
        // Update cache in background
        const updateCache = async () => {
            try {
                const networkResponse = await fetch(request);
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, responseToCache);
                }
            } catch (err) {
                console.error('[SW] Background cache update failed:', err);
            }
        };
        event.waitUntil(updateCache());
    } catch (err) {
        console.error('[SW] handleCachedAsset failed:', err);
    }

    return cachedResponse;
}

async function cacheResponse(request: Request, networkResponse: Response, event: FetchEvent): Promise<void> {
    try {
        const responseToCache = networkResponse.clone();
        const cacheOp = async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
            } catch (err) {
                console.error('[SW] Cache put failed:', err);
            }
        };
        event.waitUntil(cacheOp());
    } catch (err) {
        console.error('[SW] cacheResponse failed:', err);
    }
}

sw.addEventListener('fetch', (event: FetchEvent) => {
    if (event.request.method !== 'GET') return;

    const fetchHandler = async () => {
        try {
            // Navigation requests (HTML pages) -> Network First with Offline Fallback
            if (event.request.mode === 'navigate') {
                return await handleNavigate(event.request);
            }

            // Stale-while-revalidate for assets
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return await handleCachedAsset(event.request, cachedResponse, event);
            }

            // Network First for everything else
            const networkResponse = await fetch(event.request);

            // Cache valid responses
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                await cacheResponse(event.request, networkResponse, event);
            }

            return networkResponse;

        } catch (error) {
            console.error('[SW] Fetch failed:', error);

            // Null-safe Accept header check
            const accept = event.request.headers.get('accept') || '';
            if (accept.includes('image')) {
                // Could return a placeholder image here
            }

            throw error;
        }
    };

    event.respondWith(fetchHandler());
});
