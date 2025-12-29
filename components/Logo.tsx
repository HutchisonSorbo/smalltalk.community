
import React from 'react';

export interface LogoProps {
    className?: string;
    text?: string;
    ariaLabel?: string;
}

export function Logo({ className, text = "Local Music Network", ariaLabel }: LogoProps) {
    return (
        <div className={`flex items-center gap-0.5 font-bold text-3xl tracking-tight leading-none ${className}`} aria-label={ariaLabel || `${text} Logo`}>
            <span>{text}</span>
        </div>
    );
}

// CodeRabbit Audit Trigger
