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

// --- Helpers ---

/**
 * Calculates the active drag difference with resistance/containment
 */
function applyResistance(
    diff: number,
    maxLeftTranslate: number,
    maxRightTranslate: number,
    hasLeftActions: boolean,
    hasRightActions: boolean
): number {
    let activeDiff = diff;

    // If no left actions, block right swipe (positive diff)
    if (!hasLeftActions && diff > 0) activeDiff = 0;
    // If no right actions, block left swipe (negative diff)
    if (!hasRightActions && diff < 0) activeDiff = 0;

    // Add resistance past max width
    if (activeDiff > maxLeftTranslate) {
        const extra = activeDiff - maxLeftTranslate;
        activeDiff = maxLeftTranslate + extra * 0.4;
    } else if (activeDiff < -maxRightTranslate) {
        const extra = activeDiff + maxRightTranslate;
        activeDiff = -maxRightTranslate + extra * 0.4;
    }

    return activeDiff;
}

// --- Hook ---

function useSwipeGesture(
    leftActions: SwipeAction[],
    rightActions: SwipeAction[],
    threshold: number = 80
) {
    const [startX, setStartX] = React.useState(0);
    const [currentX, setCurrentX] = React.useState(0);
    const [isSwiping, setIsSwiping] = React.useState(false);
    const [isActionActive, setIsActionActive] = React.useState(false);

    // Calculate action button widths (assuming roughly 72px per action)
    const actionWidth = 72;
    const maxLeftTranslate = leftActions.length * actionWidth;
    const maxRightTranslate = rightActions.length * actionWidth;

    const reset = React.useCallback(() => {
        setCurrentX(0);
        setIsActionActive(false);
        setIsSwiping(false);
    }, []);

    const onTouchStart = React.useCallback((e: React.TouchEvent) => {
        setStartX(e.touches[0].pageX);
        setIsSwiping(true);
        setIsActionActive(false);
    }, []);

    const onTouchMove = React.useCallback((e: React.TouchEvent) => {
        if (!isSwiping) return;
        const x = e.touches[0].pageX;
        const diff = x - startX;

        const activeDiff = applyResistance(
            diff,
            maxLeftTranslate,
            maxRightTranslate,
            leftActions.length > 0,
            rightActions.length > 0
        );

        setCurrentX(activeDiff);
    }, [isSwiping, startX, maxLeftTranslate, maxRightTranslate, leftActions.length, rightActions.length]);

    const onTouchEnd = React.useCallback(() => {
        setIsSwiping(false);
        const absX = Math.abs(currentX);

        if (currentX > 0 && leftActions.length > 0) {
            // Swiping Right (Revealing Left Actions)
            // Use threshold clamped to the action width
            const openThreshold = Math.min(threshold, maxLeftTranslate);

            if (absX >= openThreshold) {
                // Snap open
                setCurrentX(maxLeftTranslate);
                setIsActionActive(true);
            } else {
                reset();
            }
        } else if (currentX < 0 && rightActions.length > 0) {
            // Swiping Left (Revealing Right Actions)
            // Use threshold clamped to the action width
            const openThreshold = Math.min(threshold, maxRightTranslate);

            if (absX >= openThreshold) {
                // Snap open
                setCurrentX(-maxRightTranslate);
                setIsActionActive(true);
            } else {
                reset();
            }
        } else {
            reset();
        }
    }, [currentX, leftActions.length, rightActions.length, maxLeftTranslate, maxRightTranslate, threshold, reset]);

    return {
        currentX,
        isSwiping,
        isActionActive,
        handleTouchStart: onTouchStart,
        handleTouchMove: onTouchMove,
        handleTouchEnd: onTouchEnd,
        reset,
        maxLeftTranslate,
        maxRightTranslate,
    };
}

// --- Sub-components ---

const ActionButtons = ({
    actions,
    width,
    reset,
    side,
}: {
    actions: SwipeAction[];
    width: number;
    reset: () => void;
    side: "left" | "right";
}) => {
    if (actions.length === 0) return null;

    return (
        <div
            className={cn(
                "absolute inset-y-0 flex h-full z-0",
                side === "left" ? "left-0 flex-row" : "right-0 flex-row-reverse"
            )}
            style={{ width }}
        >
            {actions.map((action) => (
                <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                        action.onClick();
                        reset();
                    }}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 h-full min-w-[72px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
                        colorMap[action.color] || colorMap.default
                    )}
                    aria-label={action.label}
                >
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

// --- Main Component ---

const COSSwipeActions = ({
    children,
    leftActions = [],
    rightActions = [],
    className,
    threshold = 80,
}: COSSwipeActionsProps) => {
    const {
        currentX,
        isSwiping,
        isActionActive,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        reset,
        maxLeftTranslate,
        maxRightTranslate,
    } = useSwipeGesture(leftActions, rightActions, threshold);

    // Auto-close when clicking outside used to be handled by overlay, 
    // but typically clicking the content itself should reset if actions are open.
    const handleContentClick = (e: React.MouseEvent) => {
        if (isActionActive) {
            e.stopPropagation(); // Prevent detail click if just closing actions
            reset();
        }
    };

    const handleContentKeyDown = (e: React.KeyboardEvent) => {
        if (isActionActive && (e.key === "Enter" || e.key === " " || e.key === "Escape")) {
            e.preventDefault();
            e.stopPropagation();
            reset();
        }
    };

    return (
        <div className={cn("relative overflow-hidden w-full max-w-full touch-pan-y h-full select-none", className)}>
            <ActionButtons
                actions={leftActions}
                width={maxLeftTranslate}
                reset={reset}
                side="left"
            />
            <ActionButtons
                actions={rightActions}
                width={maxRightTranslate}
                reset={reset}
                side="right"
            />

            {/* Foreground Content */}
            <div
                role={isActionActive ? "button" : undefined}
                tabIndex={isActionActive ? 0 : -1}
                aria-label={isActionActive ? "Close actions" : undefined}
                aria-expanded={isActionActive}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleContentClick}
                onKeyDown={handleContentKeyDown}
                style={{
                    transform: `translateX(${currentX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="relative bg-white dark:bg-slate-950 z-10 w-full h-full outline-none"
            >
                {children}
            </div>
        </div>
    );
};

export { COSSwipeActions };
