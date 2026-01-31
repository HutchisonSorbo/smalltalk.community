/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { matchPrecache } from 'workbox-precaching';
import { appShellStrategy, apiStrategy, imageStrategy } from './cache-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache assets defined by build process
// In Next.js, we don't have an easy way to get the manifest here without extra build steps,
// so we'll start with manual precaching of critical assets if needed, or rely on strategies.
// cleanupOutdatedCaches();

// App Shell routes (Next.js pages)
registerRoute(
    ({ request }) => request.mode === 'navigate',
    appShellStrategy
);

// API routes
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    apiStrategy
);

// Statics (Images, Fonts)
registerRoute(
    ({ request }) => request.destination === 'image' || request.destination === 'font',
    imageStrategy
);

// Offline fallback
setCatchHandler(async ({ event }) => {
    if ((event as FetchEvent).request.mode === 'navigate') {
        return (await matchPrecache('/offline.html')) || Response.error();
    }
    return Response.error();
});

// Skip waiting and claim clients
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
