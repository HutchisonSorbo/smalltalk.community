import { useEffect } from 'react';
import { usePWAStore } from '@/lib/stores/use-pwa-store';
import { BeforeInstallPromptEvent } from "@/lib/pwa-utils";

/**
 * Hook to handle PWA installation prompt
 * uses global Zustand store for state management
 */
export function useInstallPrompt() {
    const {
        deferredPrompt,
        isInstallable,
        isInstalled,
        setDeferredPrompt,
        setIsInstallable,
        setIsInstalled
    } = usePWAStore();

    useEffect(() => {
        // Check if app is already installed (launching in standalone mode)
        if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('PWA was installed');
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [setDeferredPrompt, setIsInstallable, setIsInstalled]);

    const install = async () => {
        if (!deferredPrompt) {
            return;
        }
        try {
            // Show the install prompt
            await deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            // Optionally, send analytics event with outcome of user choice
            console.log(`User response to the install prompt: ${outcome}`);
        } catch (error) {
            console.error('PWA installation prompt failed:', error);
        } finally {
            // We've used the prompt, and can't use it again, throw it away
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    const dismiss = () => {
        setIsInstallable(false);
    };

    return { isInstallable, isInstalled, install, dismiss };
}
