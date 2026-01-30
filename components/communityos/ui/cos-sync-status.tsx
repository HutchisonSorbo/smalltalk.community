"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCcw, Wifi, WifiOff, CloudCheck, CloudOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface COSSyncStatusProps {
    isOnline: boolean;
    isSyncing: boolean;
    pendingChanges: number;
    lastSyncTime?: Date;
    onRetry?: () => void;
    className?: string;
}

export function COSSyncStatus({
    isOnline,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    onRetry,
    className
}: COSSyncStatusProps) {
    const statusColor = !isOnline ? 'bg-destructive' : pendingChanges > 0 ? 'bg-amber-500' : 'bg-green-500';
    const statusText = !isOnline ? 'Offline' : isSyncing ? 'Syncing...' : pendingChanges > 0 ? `${pendingChanges} pending` : 'Synced';

    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border shadow-sm", className)}>
            <div className="relative flex items-center justify-center w-2 h-2">
                <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", statusColor)} />
                <div className={cn("relative w-2 h-2 rounded-full", statusColor)} />
            </div>

            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {statusText}
            </span>

            <AnimatePresence mode="wait">
                {isSyncing ? (
                    <motion.div
                        key="syncing"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCcw className="w-3 h-3 text-amber-500" />
                    </motion.div>
                ) : !isOnline ? (
                    <motion.div key="offline" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <WifiOff className="w-3 h-3 text-destructive" />
                    </motion.div>
                ) : pendingChanges > 0 ? (
                    <motion.div key="pending" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                    </motion.div>
                ) : (
                    <motion.div key="synced" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <CloudCheck className="w-3 h-3 text-green-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
