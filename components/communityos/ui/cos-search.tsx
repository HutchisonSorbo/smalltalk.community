"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";

interface COSSearchProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    debounceMs?: number;
    loading?: boolean;
    className?: string;
    autoFocus?: boolean;
    minLength?: number;
    maxLength?: number;
    ariaLabel?: string;
}

const COSSearch = React.forwardRef<HTMLInputElement, COSSearchProps>(
    ({
        placeholder = "Search...",
        value,
        onChange,
        onSearch,
        debounceMs = 300,
        loading = false,
        className,
        autoFocus,
        minLength,
        maxLength,
        ariaLabel,
        ...props
    }, ref) => {
        const [localValue, setLocalValue] = React.useState(value);

        React.useEffect(() => {
            setLocalValue(value);
        }, [value]);

        React.useEffect(() => {
            const handler = setTimeout(() => {
                if (localValue !== value) {
                    const meetsMinLength = minLength === undefined || localValue.length >= minLength;
                    const meetsMaxLength = maxLength === undefined || localValue.length <= maxLength;

                    if (meetsMinLength && meetsMaxLength) {
                        onChange(localValue);
                        onSearch?.(localValue);
                    } else if (localValue === "") {
                        onChange(localValue);
                        onSearch?.(localValue);
                    }
                }
            }, debounceMs);

            return () => clearTimeout(handler);
        }, [localValue, debounceMs, onChange, onSearch, value, minLength, maxLength]);

        const handleClear = () => {
            setLocalValue("");
            onChange("");
            onSearch?.("");
        };

        return (
            <div className={cn("relative w-full", className)}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </div>

                <input
                    ref={ref}
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    aria-label={ariaLabel || placeholder}
                    className={cn(
                        "flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2",
                        "text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
                        "disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                    )}
                    {...props}
                />

                {localValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        );
    }
);

COSSearch.displayName = "COSSearch";

export { COSSearch };
