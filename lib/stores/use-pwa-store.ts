import { create } from 'zustand';
import { BeforeInstallPromptEvent } from '../pwa-utils';

interface PWAState {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isInstallable: boolean;
    isInstalled: boolean;
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
    setIsInstallable: (isInstallable: boolean) => void;
    setIsInstalled: (isInstalled: boolean) => void;
}

/**
 * Global Zustand store for PWA installation state management.
 * 
 * Provides PWAState getters (deferredPrompt, isInstallable, isInstalled) 
 * and setters for handling the PWA install lifecycle across components.
 */
export const usePWAStore = create<PWAState>((set) => ({
    deferredPrompt: null,
    isInstallable: false,
    isInstalled: false,
    setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
    setIsInstallable: (isInstallable) => set({ isInstallable }),
    setIsInstalled: (isInstalled) => set({ isInstalled }),
}));
