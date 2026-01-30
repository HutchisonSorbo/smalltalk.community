"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/design-system/tokens";

interface COSCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outlined' | 'elevated';
    loading?: boolean;
    interactive?: boolean;
}

const COSCard = React.forwardRef<HTMLDivElement, COSCardProps>(
    ({ className, variant = "default", loading = false, interactive = false, children, ...props }, ref) => {
        const variantStyles = {
            default: "bg-card text-card-foreground border-border",
            glass: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/20 dark:border-gray-800/30 shadow-glass",
            outlined: "bg-transparent border-2 border-border",
            elevated: "bg-card text-card-foreground border-border shadow-lg",
        };

        const interactiveStyles = interactive
            ? "transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md cursor-pointer active:scale-[0.98]"
            : "";

        if (loading) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        "rounded-xl border p-6 animate-pulse bg-gray-100 dark:bg-gray-800",
                        className
                    )}
                    {...props}
                >
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl border p-6",
                    variantStyles[variant],
                    interactiveStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

COSCard.displayName = "COSCard";

export { COSCard };
