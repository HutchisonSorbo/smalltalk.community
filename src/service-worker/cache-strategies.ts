import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Background sync for failed Ditto writes
export const dittoSyncQueue = new BackgroundSyncPlugin('ditto-sync-queue', {
    maxRetentionTime: 24 * 60, // 24 hours
});

// App shell strategy: Network first (ensure latest code), fallback to cache
export const appShellStrategy = new NetworkFirst({
    cacheName: 'stc-app-shell',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 50,
        }),
    ],
});

// API strategy: Stale While Revalidate
export const apiStrategy = new StaleWhileRevalidate({
    cacheName: 'stc-api-cache',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
        dittoSyncQueue,
    ],
});

// Image strategy: Cache First
export const imageStrategy = new CacheFirst({
    cacheName: 'stc-image-cache',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
    ],
});
