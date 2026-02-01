import React, { useState } from 'react';
import { Network, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface COSSyncStatusProps {
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
    const [isOpen, setIsOpen] = useState(false);

    // Normalize inputs
    const safePendingChanges = Math.max(0, Number(pendingChanges) || 0);
    const safeLastSyncTime = (lastSyncTime && !isNaN(new Date(lastSyncTime).getTime()))
        ? new Date(lastSyncTime)
        : undefined;

    // Determine status color and icon
    const getStatus = () => {
        if (!isOnline) return { color: "text-destructive", bg: "bg-destructive", icon: Network, label: "Offline" };
        if (isSyncing) return { color: "text-amber-500", bg: "bg-amber-500", icon: RefreshCw, label: "Syncing..." };
        if (safePendingChanges > 0) return { color: "text-amber-500", bg: "bg-amber-500", icon: AlertCircle, label: "Unsynced Changes" };
        return { color: "text-green-500", bg: "bg-green-500", icon: CheckCircle2, label: "Synced" };
    };

    const status = getStatus();
    const Icon = status.icon;

    const handleRetry = async () => {
        if (!onRetry) return;
        try {
            await onRetry();
        } catch (error) {
            console.error("COSSyncStatus: onRetry failed", {
                isOnline,
                pendingChanges: safePendingChanges,
                error
            });
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 px-2 gap-2 transition-colors", className)}
                    aria-label={`Sync status: ${status.label}`}
                >
                    <div className="relative flex items-center justify-center">
                        <div className={cn("h-2 w-2 rounded-full", status.bg, isSyncing && "animate-pulse")} />
                        {isSyncing && (
                            <div className={cn("absolute h-3 w-3 rounded-full opacity-50 animate-ping", status.bg)} />
                        )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground hidden md:inline-block">
                        {status.label}
                    </span>
                    {safePendingChanges > 0 && (
                        <span className="flex items-center justify-center bg-muted text-foreground text-[10px] font-bold h-4 min-w-[1rem] px-1 rounded-full border border-border">
                            {safePendingChanges}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 max-w-full p-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Icon className={cn("h-4 w-4", status.color, isSyncing && "animate-spin")} />
                        <h4 className="font-medium text-sm">{status.label}</h4>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Pending Changes:</span>
                            <span className="font-mono text-foreground">{safePendingChanges}</span>
                        </div>
                        {safeLastSyncTime && (
                            <div className="flex justify-between">
                                <span>Last Sync:</span>
                                <span className="text-foreground">{safeLastSyncTime.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>

                    {(onRetry && (!isOnline || safePendingChanges > 0)) && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs mt-2"
                            onClick={handleRetry}
                            disabled={isSyncing}
                        >
                            {isSyncing ? "Syncing..." : "Sync Now"}
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
