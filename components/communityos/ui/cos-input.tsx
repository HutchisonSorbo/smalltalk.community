"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface COSInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    clearable?: boolean;
    onClear?: () => void;
    onChange: (value: string) => void;
}

const COSInput = React.forwardRef<HTMLInputElement, COSInputProps>(
    ({ className, label, error, hint, icon, clearable, onClear, value, onChange, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full space-y-1.5">
                <label
                    htmlFor={inputId}
                    className="text-sm font-semibold text-foreground/80 ml-1"
                >
                    {label}
                    {props.required && <span className="text-destructive ml-1">*</span>}
                </label>

                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        className={cn(
                            "flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                            icon ? "pl-10" : "",
                            clearable && value ? "pr-10" : "",
                            error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-input",
                            className
                        )}
                        {...props}
                    />

                    {clearable && value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                onClear?.();
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear input"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="text-xs font-medium text-destructive ml-1" role="alert">
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p id={`${inputId}-hint`} className="text-xs text-muted-foreground ml-1">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

COSInput.displayName = "COSInput";

export { COSInput };
