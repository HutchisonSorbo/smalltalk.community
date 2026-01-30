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
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl transition-transform duration-300 md:hidden pb-safe",
                isVisible ? "translate-y-0" : "translate-y-full",
                className
            )}
        >
            {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (window.navigator.vibrate) window.navigator.vibrate(10);
                            onSelect(item.id);
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            isActive ? "bg-primary/10" : ""
                        )}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>

                        {item.badge ? (
                            <span className="absolute top-1 right-4 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                                {item.badge}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </nav>
    );
};

export { COSBottomNav };
