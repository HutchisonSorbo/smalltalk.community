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

const COSTimeline = ({ items, className }: COSTimelineProps) => {
    const getIcon = (type: TimelineItem['type'], isActive?: boolean) => {
        switch (type) {
            case 'comment': return <MessageSquare className="h-3 w-3" />;
            case 'status': return isActive ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />;
            case 'event': return <Clock className="h-3 w-3" />;
            default: return <User className="h-3 w-3" />;
        }
    };

    return (
        <div className={cn("relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent", className)}>
            {items.map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-6 group">
                    {/* Node */}
                    <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-transform group-hover:scale-110",
                        item.isActive ? "border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "border-muted text-muted-foreground"
                    )}>
                        {getIcon(item.type, item.isActive)}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1 pt-1.5 pb-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <h4 className={cn(
                                "text-sm font-bold leading-none",
                                item.isActive ? "text-primary" : "text-foreground"
                            )}>
                                {item.title}
                            </h4>
                            <time className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                {item.timestamp}
                            </time>
                        </div>

                        {item.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                {item.description}
                            </p>
                        )}

                        {item.user && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                    {item.user.name.charAt(0)}
                                </div>
                                <span className="text-[10px] font-medium text-foreground/80">{item.user.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export { COSTimeline };
