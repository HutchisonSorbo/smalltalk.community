"use client";

import * as React from "react";
import { COSTimeline } from "../ui/cos-timeline";
import { formatDistanceToNow, isValid } from "date-fns";
import { COSEmptyState } from "../ui/cos-empty-state";
import { Clock } from "lucide-react";
import type { CrmActivityLog } from "@/types/crm";

interface CRMActivityTimelineProps {
    logs: CrmActivityLog[];
    isLoading?: boolean;
}

/**
 * Get the title and description for an activity log entry
 */
function getActionTitleAndDescription(log: CrmActivityLog): { title: string; description: string } {
    const title = log.action.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    let description = "";

    if (log.action === "stage_changed") {
        description = "Moved to new stage.";
    } else if (log.action === "deal_created") {
        const details = log.details as { title?: string } | null;
        description = `New deal created: ${details?.title || "Untitled"}`;
    } else if (log.action === "contact_created") {
        const details = log.details as { name?: string } | null;
        description = `New contact added: ${details?.name || "Unknown"}`;
    } else if (log.action === "pipeline_created") {
        const details = log.details as { name?: string } | null;
        description = `New pipeline created: ${details?.name || "Untitled"}`;
    }

    return { title, description };
}

/**
 * Format a timestamp for display, with validation
 */
function formatLogTimestamp(createdAt: Date | string | null): string {
    if (!createdAt) return "Unknown date";
    const date = new Date(createdAt);
    if (!isValid(date)) return "Unknown date";
    return formatDistanceToNow(date, { addSuffix: true });
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
        const { title, description } = getActionTitleAndDescription(log);
        const timestamp = formatLogTimestamp(log.createdAt);

        return { id: log.id, title, description, timestamp, type: "system" as const };
    });

    return (
        <div className="p-4">
            <COSTimeline items={timelineItems} />
        </div>
    );
}
