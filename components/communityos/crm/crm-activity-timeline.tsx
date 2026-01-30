"use client";

import * as React from "react";
import { COSTimeline } from "../ui/cos-timeline";
import { formatDistanceToNow } from "date-fns";
import { COSEmptyState } from "../ui/cos-empty-state";
import { Clock } from "lucide-react";

interface CRMActivityTimelineProps {
    logs: any[];
    isLoading?: boolean;
}

export function CRMActivityTimeline({ logs, isLoading }: CRMActivityTimelineProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading activity...</div>;
    }

    if (!logs || logs.length === 0) {
        return (
            <COSEmptyState
                title="No Activity Yet"
                description="Activity related to deals and contacts will appear here."
                icon={<Clock />}
            />
        );
    }

    const timelineItems = logs.map((log) => {
        let title = log.action.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
        let description = "";

        if (log.action === "stage_changed") {
            description = `Moved to new stage.`;
        } else if (log.action === "deal_created") {
            description = `New deal created: ${log.details?.title || "Untitled"}`;
        } else if (log.action === "contact_created") {
            description = `New contact added: ${log.details?.name || "Unknown"}`;
        }

        return {
            id: log.id,
            title,
            description,
            timestamp: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
            type: "system" as const,
        };
    });

    return (
        <div className="p-4">
            <COSTimeline items={timelineItems} />
        </div>
    );
}
