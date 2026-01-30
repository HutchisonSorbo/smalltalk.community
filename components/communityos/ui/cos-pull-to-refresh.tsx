"use client";

import * as React from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface COSPullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
}

const COSPullToRefresh = ({ onRefresh, children, className }: COSPullToRefreshProps) => {
    const [startY, setStartY] = React.useState(0);
    const [currentY, setCurrentY] = React.useState(0);
    const [refreshing, setRefreshing] = React.useState(false);
    const [pullDist, setPullDist] = React.useState(0);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const threshold = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
        } else {
            setStartY(0);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || refreshing) return;

        const y = e.touches[0].pageY;
        const dist = y - startY;

        if (dist > 0) {
            setPullDist(Math.min(dist * 0.4, threshold + 20));
            setCurrentY(y);
        }
    };

    const handleTouchEnd = async () => {
        if (pullDist >= threshold && !refreshing) {
            setRefreshing(true);
            if (window.navigator.vibrate) window.navigator.vibrate(12);

            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                setPullDist(0);
                setStartY(0);
            }
        } else {
            setPullDist(0);
            setStartY(0);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                style={{
                    "--pull-top": refreshing ? '16px' : `${pullDist - 32}px`,
                    "--pull-opacity": Math.min(pullDist / threshold, 1)
                } as React.CSSProperties}
                className="absolute left-0 right-0 flex items-center justify-center transition-all duration-200 top-[var(--pull-top)] opacity-[var(--pull-opacity)]"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-lg border border-border">
                    {refreshing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <ArrowDown
                            style={{ "--pull-rotate": `${Math.min(pullDist * 2, 180)}deg` } as React.CSSProperties}
                            className="h-5 w-5 text-muted-foreground transition-transform rotate-[var(--pull-rotate)]"
                        />
                    )}
                </div>
            </div>

            <div
                style={{ "--pull-translate": refreshing ? `48px` : `${pullDist}px` } as React.CSSProperties}
                className="transition-transform duration-200 translate-y-[var(--pull-translate)]"
            >
                {children}
            </div>
        </div>
    );
};

export { COSPullToRefresh };
