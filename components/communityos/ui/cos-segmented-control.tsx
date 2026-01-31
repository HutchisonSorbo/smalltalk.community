"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface COSSegmentedControlProps {
    options: Array<{ id: string; label: string; icon?: React.ReactNode }>;
    value: string;
    onChange: (id: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const COSSegmentedControl = ({ options, value, onChange, className, size = 'md' }: COSSegmentedControlProps) => {
    const activeIndex = options.findIndex(opt => opt.id === value);
    const safeIndex = activeIndex >= 0 ? activeIndex : 0;
    const percent = options.length > 0 ? (safeIndex / options.length) * 100 : 0;

    const sizeStyles = {
        sm: "h-8 p-0.5 text-xs",
        md: "h-10 p-1 text-sm",
        lg: "h-12 p-1 text-base",
    };

    return (
        <div className={cn(
            "relative flex w-full max-w-full bg-muted/50 rounded-xl border border-border/50 select-none",
            sizeStyles[size],
            className
        )}>
            {/* Sliding background */}
            <div
                className="absolute top-1 left-0 rounded-lg bg-background shadow-xs transition-all duration-300 ease-in-out h-[calc(100%-8px)]"
                style={{
                    width: `${activeWidth}%`,
                    left: `${activeOffset}%`
                }}
                aria-hidden="true"
            />

            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                            navigator.vibrate(5);
                        }
                        onChange(option.id);
                    }}
                    className={cn(
                        "relative flex-1 flex items-center justify-center gap-2 font-bold transition-colors z-10",
                        value === option.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                    )}
                >
                    {option.icon}
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    );
};

export { COSSegmentedControl };
