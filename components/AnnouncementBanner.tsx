"use client";

import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Announcement } from "@shared/schema";

interface AnnouncementBannerProps {
    announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [visibleAnnouncement, setVisibleAnnouncement] = useState<Announcement | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (isLoading || dismissed) return;

        // Find the first announcement that matches the visibility criteria
        const match = announcements.find((a) => {
            if (!a.isActive) return false;
            if (a.visibility === "all") return true;
            if (a.visibility === "private" && isAuthenticated) return true;
            if (a.visibility === "public" && !isAuthenticated) return true;
            return false;
        });

        setVisibleAnnouncement(match || null);
    }, [announcements, isAuthenticated, isLoading, dismissed]);

    if (!visibleAnnouncement || dismissed) return null;

    return (
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white">
            <div className="text-center text-sm font-medium">
                {visibleAnnouncement.message}
            </div>
            <button
                type="button"
                onClick={() => setDismissed(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/20"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
