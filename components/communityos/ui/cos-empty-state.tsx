"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { COSButton } from "./cos-button";
import { PlusCircle, Search, WifiOff, AlertTriangle, Inbox } from "lucide-react";

interface COSEmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    illustration?: 'no-data' | 'no-results' | 'error' | 'offline';
    className?: string;
}

const COSEmptyState = ({
    title,
    description,
    icon,
    action,
    illustration = 'no-data',
    className
}: COSEmptyStateProps) => {
    const getDefaultIcon = () => {
        switch (illustration) {
            case 'no-data': return <PlusCircle className="h-12 w-12 text-muted-foreground/40" />;
            case 'no-results': return <Search className="h-12 w-12 text-muted-foreground/40" />;
            case 'offline': return <WifiOff className="h-12 w-12 text-muted-foreground/40" />;
            case 'error': return <AlertTriangle className="h-12 w-12 text-muted-foreground/40" />;
            default: return <Inbox className="h-12 w-12 text-muted-foreground/40" />;
        }
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-muted/50 bg-muted/5",
            className
        )}>
            <div className="mb-4">
                {icon || getDefaultIcon()}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8">
                    {description}
                </p>
            )}

            {action && (
                <COSButton
                    variant="primary"
                    onClick={action.onClick}
                    icon={<PlusCircle className="h-4 w-4" />}
                >
                    {action.label}
                </COSButton>
            )}
        </div>
    );
};

export { COSEmptyState };
