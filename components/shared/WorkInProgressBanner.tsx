"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "smalltalk-wip-banner-dismissed";

export function WorkInProgressBanner() {
    const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const dismissed = localStorage.getItem(STORAGE_KEY);
        setIsDismissed(dismissed === "true");
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsDismissed(true);
    };

    // Don't render on server or if dismissed
    if (!isClient || isDismissed) {
        return null;
    }

    return (
        <div
            role="alert"
            aria-live="polite"
            className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-3"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AlertTriangle
                        className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Work in Progress:</strong>{" "}
                        This website is currently under development. Information may be incomplete or subject to change.
                        Please do not rely on this content until the final version is released.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900"
                    aria-label="Dismiss banner"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
