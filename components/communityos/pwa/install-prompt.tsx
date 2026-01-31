"use client";

import React, { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { COSButton } from '../ui/cos-button';
import { COSCard } from '../ui/cos-card';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
    const { isInstallable, isInstalled, install, dismiss } = useInstallPrompt();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if installable and not already dismissed recently
        const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const isRecentlyDismissed = dismissedAt && (Date.now() - parseInt(dismissedAt)) < sevenDays;

        if (isInstallable && !isInstalled && !isRecentlyDismissed) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable, isInstalled]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:right-6 md:left-auto md:w-96"
                >
                    <COSCard variant="glass" className="p-4 shadow-2xl border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-sm">Install SmallTalk</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add SmallTalk to your home screen for a faster, offline-ready experience.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <COSButton
                                        size="sm"
                                        className="flex-grow gap-2"
                                        onClick={() => {
                                            install();
                                            setIsVisible(false);
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                        Install Now
                                    </COSButton>
                                    <COSButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            dismiss();
                                            setIsVisible(false);
                                        }}
                                    >
                                        Not now
                                    </COSButton>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Dismiss install prompt"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </COSCard>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
