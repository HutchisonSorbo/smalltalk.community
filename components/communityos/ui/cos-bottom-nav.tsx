"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface COSBottomNavProps {
    items: Array<{
        id: string;
        label: string;
        icon: React.ReactNode;
        badge?: number;
    }>;
    activeId: string;
    onSelect: (id: string) => void;
    className?: string;
}

/** Maximum displayable badge value before showing "9+" */
const MAX_BADGE_VALUE = 9;

/**
 * Format badge text with overflow handling
 */
function formatBadge(value: number | undefined): string | null {
    if (value === undefined || value <= 0) return null;
    return value > MAX_BADGE_VALUE ? `${MAX_BADGE_VALUE}+` : String(value);
}

const COSBottomNav = ({ items, activeId, onSelect, className }: COSBottomNavProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            aria-label="Bottom navigation"
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl transition-transform duration-300 md:hidden pb-safe",
                isVisible ? "translate-y-0" : "translate-y-full",
                className
            )}
        >
            {items.map((item) => {
                const isActive = activeId === item.id;
                const badgeText = formatBadge(item.badge);
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                            // SSR guard for haptic feedback
                            if (typeof window !== "undefined" && window.navigator?.vibrate) {
                                window.navigator.vibrate(10);
                            }
                            onSelect(item.id);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={item.label}
                    >
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            isActive ? "bg-primary/10" : ""
                        )}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium truncate max-w-[56px]">{item.label}</span>

                        {badgeText && (
                            <span className="absolute top-1 right-4 flex h-4 min-w-[16px] px-0.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                                {badgeText}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

export { COSBottomNav };
