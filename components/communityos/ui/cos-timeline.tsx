"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, MessageSquare, User } from "lucide-react";

interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    type: 'event' | 'comment' | 'status' | 'system';
    user?: {
        name: string;
        avatar?: string;
    };
    isActive?: boolean;
}

interface COSTimelineProps {
    items: TimelineItem[];
    className?: string;
}

/**
 * Get the appropriate icon for a timeline item type
 */
function getTimelineIcon(type: TimelineItem['type'], isActive?: boolean) {
    switch (type) {
        case 'comment': return <MessageSquare className="h-3 w-3" />;
        case 'status': return isActive ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />;
        case 'event': return <Clock className="h-3 w-3" />;
        default: return <User className="h-3 w-3" />;
    }
}

/**
 * Renders a single row in the timeline
 */
function TimelineItemRow({ item }: { item: TimelineItem }) {
    return (
        <div className="relative flex items-start gap-6 group max-w-full">
            {/* Node */}
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-transform group-hover:scale-110",
                item.isActive ? "border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "border-muted text-muted-foreground"
            )}>
                {getTimelineIcon(item.type, item.isActive)}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 pt-1.5 pb-4 w-full min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <h4 className={cn(
                        "text-sm font-bold leading-none truncate",
                        item.isActive ? "text-primary" : "text-foreground"
                    )}>
                        {item.title}
                    </h4>
                    <time className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0">
                        {item.timestamp}
                    </time>
                </div>

                {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {item.user && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                            {item.user.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-medium text-foreground/80 truncate">{item.user.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

const COSTimeline = ({ items, className }: COSTimelineProps) => {
    return (
        <div className={cn(
            "relative space-y-6 max-w-full before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent",
            className
        )}>
            {items.map((item) => (
                <TimelineItemRow key={item.id} item={item} />
            ))}
        </div>
    );
};

export { COSTimeline, getTimelineIcon, TimelineItemRow };
