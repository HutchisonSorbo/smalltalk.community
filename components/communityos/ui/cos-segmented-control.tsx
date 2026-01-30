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
    const percent = (activeIndex / options.length) * 100;

    const sizeStyles = {
        sm: "h-8 p-0.5 text-xs",
        md: "h-10 p-1 text-sm",
        lg: "h-12 p-1 text-base",
    };

    return (
        <div className={cn(
            "relative flex w-full bg-muted/50 rounded-xl border border-border/50 select-none",
            sizeStyles[size],
            className
        )}>
            {/* Slider Background */}
            <div
                className="absolute inset-y-1 left-1 bg-background rounded-lg shadow-sm transition-all duration-300 ease-out z-0 w-[var(--slider-width)] translate-x-[var(--slider-translate)]"
                style={{
                    "--slider-width": `calc(${100 / options.length}% - ${size === 'sm' ? '4px' : '8px'})`,
                    "--slider-translate": `${percent}%`
                } as React.CSSProperties}
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
