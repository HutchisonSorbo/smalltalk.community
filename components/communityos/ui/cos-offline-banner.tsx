import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface COSOfflineBannerProps {
    isOnline: boolean;
    className?: string;
    onDismiss?: () => void;
}

export function COSOfflineBanner({
    isOnline,
    className,
    onDismiss
}: COSOfflineBannerProps) {
    const [isVisible, setIsVisible] = useState(!isOnline);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setIsDismissed(false);
            setIsVisible(true);
        } else {
            // Delay hiding to allow animation or simply hide immediately
            setIsVisible(false);
        }
    }, [isOnline]);

    if (!isVisible || isDismissed) return null;

    return (
        <div
            className={cn(
                "bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between text-sm font-medium",
                "animate-in slide-in-from-top-full duration-300 ease-in-out sticky top-0 z-50",
                className
            )}
            role="alert"
        >
            <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>You are offline. Changes will sync when connected.</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive-foreground hover:bg-destructive-foreground/20"
                onClick={() => {
                    setIsDismissed(true);
                    onDismiss?.();
                }}
                aria-label="Dismiss offline alert"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
