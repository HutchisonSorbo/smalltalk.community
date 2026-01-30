"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface COSSwipeableProps {
    children: React.ReactNode;
    leftAction?: {
        icon: React.ReactNode;
        color: string;
        onClick: () => void;
    };
    rightAction?: {
        icon: React.ReactNode;
        color: string;
        onClick: () => void;
    };
    className?: string;
}

const COSSwipeable = ({ children, leftAction, rightAction, className }: COSSwipeableProps) => {
    const [startX, setStartX] = React.useState(0);
    const [currentX, setCurrentX] = React.useState(0);
    const [isSwiping, setIsSwiping] = React.useState(false);
    const threshold = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].pageX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        const x = e.touches[0].pageX;
        const diff = x - startX;

        // Contain diff based on available actions
        let activeDiff = diff;
        if (!leftAction && diff > 0) activeDiff = 0;
        if (!rightAction && diff < 0) activeDiff = 0;

        setCurrentX(activeDiff);
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);

        if (currentX > threshold && leftAction) {
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            leftAction.onClick();
        } else if (currentX < -threshold && rightAction) {
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            rightAction.onClick();
        }

        setCurrentX(0);
    };

    return (
        <div
            className={cn("relative overflow-hidden w-full touch-pan-y h-full", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Left Action Background */}
            {leftAction && (
                <div
                    style={{ "--swipe-width": `${Math.max(currentX, 0)}px`, "--swipe-opacity": currentX > 20 ? 1 : 0 } as React.CSSProperties}
                    className={cn("absolute inset-y-0 left-0 flex items-center justify-start pl-8 transition-opacity w-[var(--swipe-width)] opacity-[var(--swipe-opacity)]", leftAction.color)}
                >
                    {leftAction.icon}
                </div>
            )}

            {/* Right Action Background */}
            {rightAction && (
                <div
                    style={{ "--swipe-width": `${Math.max(-currentX, 0)}px`, "--swipe-opacity": currentX < -20 ? 1 : 0 } as React.CSSProperties}
                    className={cn("absolute inset-y-0 right-0 flex items-center justify-end pr-8 transition-opacity w-[var(--swipe-width)] opacity-[var(--swipe-opacity)]", rightAction.color)}
                >
                    {rightAction.icon}
                </div>
            )}

            {/* Foreground Content */}
            <div
                style={{ "--swipe-translate": `${currentX}px` } as React.CSSProperties}
                className={cn("relative bg-white dark:bg-gray-950 transition-transform duration-200 translate-x-[var(--swipe-translate)]", !isSwiping && "transition-all")}
            >
                {children}
            </div>
        </div>
    );
};

export { COSSwipeable };
