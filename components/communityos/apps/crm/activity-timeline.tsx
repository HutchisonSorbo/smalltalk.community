"use client";

import * as React from "react";
import { CRMInteraction } from "@/lib/communityos/crm/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Mail, Phone, Calendar, CheckSquare, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
    interactions: CRMInteraction[];
    className?: string;
}

const getIcon = (type: CRMInteraction['type']) => {
    switch (type) {
        case 'email': return <Mail className="h-4 w-4" />;
        case 'call': return <Phone className="h-4 w-4" />;
        case 'meeting': return <Calendar className="h-4 w-4" />;
        case 'task': return <CheckSquare className="h-4 w-4" />;
        case 'note': default: return <FileText className="h-4 w-4" />;
    }
};

const getColor = (type: CRMInteraction['type']) => {
    switch (type) {
        case 'email': return "bg-blue-100 text-blue-600";
        case 'call': return "bg-green-100 text-green-600";
        case 'meeting': return "bg-purple-100 text-purple-600";
        case 'task': return "bg-orange-100 text-orange-600";
        case 'note': default: return "bg-gray-100 text-gray-600";
    }
};

export function ActivityTimeline({ interactions, className }: ActivityTimelineProps) {
    // Sort by newest first
    const sorted = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sorted.length === 0) {
        return <div className="text-center py-8 text-muted-foreground text-sm">No activity recorded yet.</div>;
    }

    return (
        <div className={cn("space-y-6 relative ml-2", className)}>
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border -z-10" />

            {sorted.map((item) => (
                <div key={item.id} className="relative flex gap-4">
                    <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background z-10",
                        getColor(item.type)
                    )}>
                        {getIcon(item.type)}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 pt-0.5 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium leading-none capitalize">
                                {item.type} {item.outcome ? `- ${item.outcome}` : ''}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                {formatDistanceToNow(parseISO(item.date), { addSuffix: true })}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">
                            {item.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
                                <User className="h-3 w-3" />
                                <span>User {item.createdBy.slice(0, 5)}...</span>
                            </div>
                            {item.duration && (
                                <span className="px-1.5">• {item.duration} mins</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
