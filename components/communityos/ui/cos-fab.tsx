"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface COSFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    label?: string; // For accessibility
    onClick?: () => void;
    position?: "bottom-right" | "bottom-center" | "bottom-left";
    extended?: boolean; // Show text label
    disabled?: boolean;
    stickyBottomNav?: boolean; // Lift up by 56px + padding if BottomNav is present
}

const COSFab = React.forwardRef<HTMLButtonElement, COSFabProps>(
    ({
        className,
        icon = <Plus className="h-6 w-6" />,
        label = "Add",
        onClick,
        position = "bottom-right",
        extended = false,
        disabled = false,
        stickyBottomNav = false,
        ...props
    }, ref) => {

        const positionStyles = {
            "bottom-right": "right-4 md:right-8",
            "bottom-center": "left-1/2 -translate-x-1/2",
            "bottom-left": "left-4 md:left-8",
        };

        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={extended ? undefined : label}
                className={cn(
                    "fixed z-50 inline-flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-95 active:shadow-md",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    positionStyles[position],
                    stickyBottomNav ? "bottom-[calc(56px+1.5rem)] md:bottom-8" : "bottom-6 md:bottom-8",
                    extended ? "h-14 px-6 rounded-2xl" : "h-14 w-14 rounded-full",
                    disabled && "opacity-50 pointer-events-none grayscale",
                    className
                )}
                {...props}
            >
                {icon}
                {extended && (
                    <span className="ml-2 font-semibold text-base whitespace-nowrap">{label}</span>
                )}
            </button>
        );
    }
);

COSFab.displayName = "COSFab";

export { COSFab };
