"use client";

import React, { useEffect, useState } from 'react';
import { WifiOff, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function COSOfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setDismissed(false);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setDismissed(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline || dismissed) return null;

    return (
        <AnimatePresence>
            {!isOnline && !dismissed && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-destructive text-destructive-foreground"
                >
                    <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <WifiOff className="w-4 h-4" />
                            <span>You're offline. Changes will sync when you reconnect.</span>
                        </div>
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-1 hover:bg-black/10 rounded-full transition-colors"
                            aria-label="Dismiss offline banner"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
