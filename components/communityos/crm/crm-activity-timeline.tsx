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
 * Basic sanitisation and truncation for user-generated content
 */
function sanitizeContent(text: string | unknown, maxLength = 100): string {
    if (typeof text !== "string") return "";
    const trimmed = text.trim();
    if (!trimmed) return "";

    // Simple HTML escape and truncation
    const escaped = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return escaped.length > maxLength ? escaped.substring(0, maxLength) + "..." : escaped;
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
        const sanitizedTitle = sanitizeContent(details?.title) || "Untitled";
        description = `New deal created: ${sanitizedTitle}`;
    } else if (log.action === "contact_created") {
        const details = log.details as { name?: string } | null;
        const sanitizedName = sanitizeContent(details?.name) || "Unknown";
        description = `New contact added: ${sanitizedName}`;
    } else if (log.action === "pipeline_created") {
        const details = log.details as { name?: string } | null;
        const sanitizedName = sanitizeContent(details?.name) || "Untitled";
        description = `New pipeline created: ${sanitizedName}`;
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
        return <div className="p-8 text-center text-muted-foreground max-w-full">Loading activity...</div>;
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="max-w-full">
                <COSEmptyState
                    title="No Activity Yet"
                    description="Activity related to deals and contacts will appear here."
                    icon={<Clock />}
                />
            </div>
        );
    }

    const timelineItems = logs.map((log) => {
        const { title, description } = getActionTitleAndDescription(log);
        const timestamp = formatLogTimestamp(log.createdAt);

        return { id: log.id, title, description, timestamp, type: "system" as const };
    });

    return (
        <div className="p-4 max-w-full">
            <COSTimeline items={timelineItems} />
        </div>
    );
}
