/**
 * PWA Utilities
 * Shared service worker and manifest utilities for Progressive Web App features
 */

/**
 * Register the service worker for a specific app
 */
export async function registerServiceWorker(
    scope: string = "/"
): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
        console.log("[PWA] Service workers not supported");
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register(
            "/sw.js",
            { scope }
        );

        console.log("[PWA] Service worker registered:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        // New update available
                        dispatchEvent(new CustomEvent("pwa-update-available"));
                    }
                });
            }
        });

        return registration;
    } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
        return null;
    }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
    if (!("serviceWorker" in navigator)) return;

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
    console.log("[PWA] All service workers unregistered");
}

/**
 * Check if app is running as installed PWA
 */
export function isInstalledPWA(): boolean {
    if (typeof window === "undefined") return false;

    // Check display mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    // iOS Safari specific check
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

    return isStandalone || isIOSStandalone;
}

/**
 * Check if app can be installed (not already installed and supported)
 */
export function canInstallPWA(): boolean {
    if (typeof window === "undefined") return false;

    // Already installed
    if (isInstalledPWA()) return false;

    // beforeinstallprompt event available (Chrome/Edge)
    return "BeforeInstallPromptEvent" in window;
}

/**
 * Request to add to home screen
 * Must be called in response to a user gesture
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Capture the install prompt
if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e as BeforeInstallPromptEvent;
        dispatchEvent(new CustomEvent("pwa-install-available"));
    });
}

export async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;

    return outcome === "accepted";
}

/**
 * Generate manifest.json content for an app
 */
export function generateManifest(options: {
    name: string;
    shortName?: string;
    description?: string;
    startUrl: string;
    scope?: string;
    themeColor?: string;
    backgroundColor?: string;
    icon?: string;
}): object {
    return {
        name: options.name,
        short_name: options.shortName ?? options.name.slice(0, 12),
        description: options.description ?? "",
        start_url: options.startUrl,
        scope: options.scope ?? "/",
        display: "standalone",
        orientation: "any",
        theme_color: options.themeColor ?? "#4F46E5",
        background_color: options.backgroundColor ?? "#ffffff",
        icons: options.icon
            ? [
                { src: options.icon, sizes: "192x192", type: "image/png" },
                { src: options.icon, sizes: "512x512", type: "image/png" },
                { src: options.icon, sizes: "512x512", type: "image/png", purpose: "maskable" },
            ]
            : [],
    };
}

/**
 * Check online status with fallback
 */
export function isOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
}

/**
 * Subscribe to online/offline changes
 */
export function subscribeToOnlineStatus(
    callback: (isOnline: boolean) => void
): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
    };
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}
