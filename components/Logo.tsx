
import React from 'react';

export interface LogoProps {
    className?: string;
    text?: string;
    ariaLabel?: string;
}

export function Logo({ className, text = "Local Music Network", ariaLabel }: Readonly<LogoProps>) {
    return (
        <img
            src="/logo.png"
            alt={ariaLabel || `${text} Logo`}
            className={`h-8 w-auto ${className}`}
        />
    );
}

// CodeRabbit Audit Trigger
