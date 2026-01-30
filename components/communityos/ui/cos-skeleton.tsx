"use client";

import { cn } from "@/lib/utils";

interface COSSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
}

function COSSkeleton({
    className,
    variant = 'rectangular',
    ...props
}: COSSkeletonProps) {
    const variantStyles = {
        text: "h-4 w-full rounded",
        circular: "h-12 w-12 rounded-full",
        rectangular: "h-24 w-full rounded-xl",
        card: "h-48 w-full rounded-2xl border p-6 flex flex-col gap-4",
        'table-row': "h-16 w-full rounded-lg border-b flex items-center px-4 gap-4",
    };

    if (variant === 'card') {
        return (
            <div className={cn("animate-pulse border bg-muted/20", variantStyles.card, className)} {...props}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 rounded bg-muted" />
                        <div className="h-3 w-1/4 rounded bg-muted/60" />
                    </div>
                </div>
                <div className="space-y-2 mt-2">
                    <div className="h-4 w-full rounded bg-muted/60" />
                    <div className="h-4 w-5/6 rounded bg-muted/60" />
                </div>
                <div className="flex gap-2 mt-auto">
                    <div className="h-6 w-16 rounded-full bg-muted" />
                    <div className="h-6 w-16 rounded-full bg-muted" />
                </div>
            </div>
        );
    }

    if (variant === 'table-row') {
        return (
            <div className={cn("animate-pulse bg-muted/5", variantStyles['table-row'], className)} {...props}>
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-muted" />
                </div>
                <div className="h-4 w-20 rounded bg-muted/60" />
                <div className="h-4 w-12 rounded bg-muted/60" />
            </div>
        );
    }

    return (
        <div
            className={cn("animate-pulse bg-muted", variantStyles[variant], className)}
            {...props}
        />
    );
}

export { COSSkeleton };
