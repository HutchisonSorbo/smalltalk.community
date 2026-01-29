"use client";

import { useState, useEffect } from "react";
import { moderateContent } from "@/lib/utils/moderation";

/**
 * Hook for content moderation.
 * Utilises the shared moderation pipeline to ensure data safety.
 */
export function useModeration(content: string) {
    const [moderatedContent, setModeratedContent] = useState(content);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // We can make this async if we ever use an external API
        const result = moderateContent(content);
        setModeratedContent(result);
        setIsLoading(false);
    }, [content]);

    return { moderatedContent, isLoading };
}
