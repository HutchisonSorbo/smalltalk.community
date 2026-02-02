"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwipeAction {
    id: string;
    label: string; // Used for aria-label and tooltips if needed
    icon: React.ReactNode;
    color: "danger" | "success" | "warning" | "primary" | "default";
    onClick: () => void;
}

interface COSSwipeActionsProps {
    children: React.ReactNode;
    leftActions?: SwipeAction[];
    rightActions?: SwipeAction[];
    className?: string;
    threshold?: number;
}

const colorMap: Record<string, string> = {
    danger: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
    warning: "bg-amber-500 text-white",
    primary: "bg-blue-500 text-white",
    default: "bg-slate-500 text-white",
};

const COSSwipeActions = ({
    children,
    leftActions = [],
    rightActions = [],
    className,
    threshold = 80,
}: COSSwipeActionsProps) => {
    const [startX, setStartX] = React.useState(0);
    const [currentX, setCurrentX] = React.useState(0);
    const [isSwiping, setIsSwiping] = React.useState(false);
    const [isActionActive, setIsActionActive] = React.useState(false);

    // Calculate action button widths (assuming roughly 64px per action)
    const actionWidth = 72;
    const maxLeftTranslate = leftActions.length * actionWidth;
    const maxRightTranslate = rightActions.length * actionWidth;

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].pageX);
        setIsSwiping(true);
        setIsActionActive(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;
        const x = e.touches[0].pageX;
        const diff = x - startX;

        // Contain diff based on available actions
        let activeDiff = diff;

        // If no left actions, block right swipe
        if (leftActions.length === 0 && diff > 0) activeDiff = 0;
        // If no right actions, block left swipe
        if (rightActions.length === 0 && diff < 0) activeDiff = 0;

        // Add resistance past max width
        if (activeDiff > maxLeftTranslate) {
            const extra = activeDiff - maxLeftTranslate;
            activeDiff = maxLeftTranslate + extra * 0.4;
        } else if (activeDiff < -maxRightTranslate) {
            const extra = activeDiff + maxRightTranslate;
            activeDiff = -maxRightTranslate + extra * 0.4;
        }

        setCurrentX(activeDiff);
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        const absX = Math.abs(currentX);

        if (currentX > 0 && leftActions.length > 0) {
            // Swiping Right (Revealing Left Actions)
            if (absX > maxLeftTranslate * 0.5) {
                // Snap open
                setCurrentX(maxLeftTranslate);
                setIsActionActive(true);
            } else {
                // Snap closed
                setCurrentX(0);
                setIsActionActive(false);
            }
        } else if (currentX < 0 && rightActions.length > 0) {
            // Swiping Left (Revealing Right Actions)
            if (absX > maxRightTranslate * 0.5) {
                // Snap open
                setCurrentX(-maxRightTranslate);
                setIsActionActive(true);
            } else {
                // Snap closed
                setCurrentX(0);
                setIsActionActive(false);
            }
        } else {
            setCurrentX(0);
            setIsActionActive(false);
        }
    };

    // Auto-close when clicking outside used to be handled by overlay, 
    // but typically clicking the content itself should reset if actions are open.
    const handleContentClick = (e: React.MouseEvent) => {
        if (isActionActive) {
            e.stopPropagation(); // Prevent detail click if just closing actions
            setCurrentX(0);
            setIsActionActive(false);
        }
    };

    return (
        <div className={cn("relative overflow-hidden w-full touch-pan-y h-full select-none", className)}>
            {/* Left Actions Background Layer */}
            {leftActions.length > 0 && (
                <div
                    className="absolute inset-y-0 left-0 flex flex-row h-full z-0"
                    style={{ width: maxLeftTranslate }}
                >
                    {leftActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => {
                                action.onClick();
                                setCurrentX(0);
                                setIsActionActive(false);
                            }}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[72px] transition-colors focus:outline-none",
                                colorMap[action.color] || colorMap.default
                            )}
                            aria-label={action.label}
                        >
                            <span className="text-xl">{action.icon}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Right Actions Background Layer */}
            {rightActions.length > 0 && (
                <div
                    className="absolute inset-y-0 right-0 flex flex-row-reverse h-full z-0"
                    style={{ width: maxRightTranslate }}
                >
                    {rightActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => {
                                action.onClick();
                                setCurrentX(0);
                                setIsActionActive(false);
                            }}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[72px] transition-colors focus:outline-none",
                                colorMap[action.color] || colorMap.default
                            )}
                            aria-label={action.label}
                        >
                            <span className="text-xl">{action.icon}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Foreground Content */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleContentClick}
                style={{
                    transform: `translateX(${currentX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="relative bg-white dark:bg-slate-950 z-10 w-full h-full"
            >
                {children}
            </div>
        </div>
    );
};

export { COSSwipeActions };
