"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function SkipToContent() {
    return (
        <a
            href="#main-content"
            className={cn(
                "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
                "px-4 py-2 bg-background text-foreground border rounded-md shadow-lg",
                "font-medium ring-2 ring-primary transition-all"
            )}
        >
            Skip to main content
        </a>
    );
}

// CodeRabbit Audit Trigger
