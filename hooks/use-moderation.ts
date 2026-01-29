"use client";

import { useMemo } from "react";
import { moderateContent } from "@/lib/utils/moderation";

/**
 * Hook for content moderation. 
 * Utilises the shared moderation pipeline to ensure data safety.
 * @param content - Raw content string to moderate
 * @returns Object containing moderatedContent: string and isLoading: boolean
 */
export function useModeration(content: string) {
    // Compute moderated content synchronously via useMemo to avoid hydration flashes
    // and misleading loading states for purely synchronous logic.
    const moderatedContent = useMemo(() => moderateContent(content), [content]);

    return { moderatedContent, isLoading: false };
}