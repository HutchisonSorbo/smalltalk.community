import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { RouteHandlerCallback } from 'workbox-core';

// 1. App Shell Strategy - NetworkFirst for HTML (ensure fresh content), fallback to cache
// Modified to have a short timeout as per plan (3s)
export const appShellStrategy = new NetworkFirst({
    cacheName: 'app-shell-v1',
    networkTimeoutSeconds: 3,
    plugins: [
        new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
    ],
});

// 2. Static Resources (JS, CSS, Fonts) - StaleWhileRevalidate
export const staticResourceStrategy = new StaleWhileRevalidate({
    cacheName: 'static-resources-v1',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
    ],
});

// 3. Images - CacheFirst with long expiration
export const imageStrategy = new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            purgeOnQuotaError: true,
        }),
    ],
});

// 4. API / Data - StaleWhileRevalidate for fast reads
export const apiStrategy = new StaleWhileRevalidate({
    cacheName: 'api-cache-v1',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
    ],
});

// 5. Ditto Sync Background Queue
// This is used for POST/PUT/DELETE requests that fail when offline
export const dittoSyncQueue = new BackgroundSyncPlugin('ditto-sync-queue', {
    maxRetentionTime: 24 * 60, // 24 hours (in minutes)
});
