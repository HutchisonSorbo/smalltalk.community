"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface COSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

const COSButton = React.forwardRef<HTMLButtonElement, COSButtonProps>(
    ({ className, variant = "primary", size = "md", loading = false, icon, iconPosition = "left", fullWidth = false, children, disabled, ...props }, ref) => {
        const variantStyles = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
            ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
            danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
            success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        };

        const sizeStyles = {
            sm: "h-9 px-3 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base font-semibold",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth ? "w-full" : "",
                    className
                )}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!loading && icon && iconPosition === "left" && (
                    <span className="mr-2">{icon}</span>
                )}
                {children}
                {!loading && icon && iconPosition === "right" && (
                    <span className="ml-2">{icon}</span>
                )}
            </button>
        );
    }
);

COSButton.displayName = "COSButton";

export { COSButton };
