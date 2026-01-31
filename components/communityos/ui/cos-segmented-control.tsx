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

const sizeStyles = {
    sm: "h-8 p-0.5 text-xs",
    md: "h-10 p-1 text-sm",
    lg: "h-12 p-1 text-base",
};

function SlidingBackground({ activeWidth, activeOffset }: { activeWidth: number; activeOffset: number }) {
    return (
        <div
            className="absolute top-1 left-0 rounded-lg bg-background shadow-xs transition-all duration-300 ease-in-out h-[calc(100%-8px)]"
            style={{
                width: `${activeWidth}%`,
                left: `${activeOffset}%`
            }}
            aria-hidden="true"
        />
    );
}

function OptionButton({
    option,
    isActive,
    onClick
}: {
    option: { id: string; label: string; icon?: React.ReactNode };
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={() => {
                if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                    navigator.vibrate(5);
                }
                onClick();
            }}
            className={cn(
                "relative flex-1 flex items-center justify-center gap-2 font-bold transition-colors z-10",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
        >
            {option.icon}
            <span>{option.label}</span>
        </button>
    );
}

export const COSSegmentedControl = ({ options, value, onChange, className, size = 'md' }: COSSegmentedControlProps) => {
    const activeIndex = options.findIndex(opt => opt.id === value);
    const safeIndex = activeIndex >= 0 ? activeIndex : 0;
    const activeWidth = options.length > 0 ? 100 / options.length : 0;
    const activeOffset = safeIndex * activeWidth;

    return (
        <div
            className={cn(
                "relative flex w-full max-w-full bg-muted/50 rounded-xl border border-border/50 select-none",
                sizeStyles[size],
                className
            )}
        >
            <SlidingBackground activeWidth={activeWidth} activeOffset={activeOffset} />
            {options.map((option) => (
                <OptionButton
                    key={option.id}
                    option={option}
                    isActive={value === option.id}
                    onClick={() => onChange(option.id)}
                />
            ))}
        </div>
    );
};
