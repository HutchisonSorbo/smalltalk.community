"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface COSBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    removable?: boolean;
    onRemove?: () => void;
}

const COSBadge = React.forwardRef<HTMLDivElement, COSBadgeProps>(
    ({ className, variant = "default", size = "md", removable = false, onRemove, children, ...props }, ref) => {
        const variantStyles = {
            default: "bg-secondary text-secondary-foreground border-transparent",
            success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
            warning: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
            danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
            info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
            outline: "bg-transparent text-foreground border-border",
        };

        const sizeStyles = {
            sm: "px-2 py-0.5 text-[10px]",
            md: "px-2.5 py-0.5 text-xs",
            lg: "px-3 py-1 text-sm font-medium",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border font-medium transition-colors",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {children}
                {removable && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.();
                        }}
                        className="ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Remove badge"
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                )}
            </div>
        );
    }
);

COSBadge.displayName = "COSBadge";

export { COSBadge };
