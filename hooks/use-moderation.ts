"use client";

import { useState, useEffect } from "react";

/**
 * Placeholder hook for content moderation.
 * Currently returns the content as-is but provides the expected interface for consumers.
 */
export function useModeration(content: string) {
    const [moderatedContent, setModeratedContent] = useState(content);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setModeratedContent(content);
    }, [content]);

    return { moderatedContent, isLoading };
}
