"use client";

import * as React from "react";
import { COSTimeline } from "../ui/cos-timeline";
import { formatDistanceToNow, isValid } from "date-fns";
import { COSEmptyState } from "../ui/cos-empty-state";
import { Clock } from "lucide-react";
import type { CrmActivityLog } from "@/shared/schema";

interface CRMActivityTimelineProps {
    logs: CrmActivityLog[];
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
        const title = log.action.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
        let description = "";

        if (log.action === "stage_changed") {
            description = `Moved to new stage.`;
        } else if (log.action === "deal_created") {
            const details = log.details as { title?: string } | null;
            description = `New deal created: ${details?.title || "Untitled"}`;
        } else if (log.action === "contact_created") {
            const details = log.details as { name?: string } | null;
            description = `New contact added: ${details?.name || "Unknown"}`;
        }

        // Safely parse and validate the date
        let timestamp = "Unknown date";
        if (log.createdAt) {
            const date = new Date(log.createdAt);
            if (isValid(date)) {
                timestamp = formatDistanceToNow(date, { addSuffix: true });
            }
        }

        return {
            id: log.id,
            title,
            description,
            timestamp,
            type: "system" as const,
        };
    });

    return (
        <div className="p-4">
            <COSTimeline items={timelineItems} />
        </div>
    );
}
