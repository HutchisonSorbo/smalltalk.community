"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa-utils";

/**
 * PWARegistration Component
 * Handles client-side service worker registration
 */
export function PWARegistration() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            registerServiceWorker().catch((err) => {
                console.error("[PWA] Registration failed in component:", err);
            });
        }
    }, []);

    return null;
}
