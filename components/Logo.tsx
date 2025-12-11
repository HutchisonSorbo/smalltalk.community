
import React from 'react';

export function Logo({ className }: { className?: string }) {
    // Extract height classes if needed, or just let valid CSS handle it.
    // We assume className might set height, text color, etc.
    return (
        <div className={`flex items-center gap-0.5 font-bold text-3xl tracking-tight leading-none ${className}`} aria-label="vic.band Logo">
            <span>vic.band</span>
        </div>
    );
}
