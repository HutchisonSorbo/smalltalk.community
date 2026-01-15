/**
 * useDittoSync Hook
 * Provides Ditto sync functionality for CommunityOS React components
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface DittoDocument {
    _id: string;
    [key: string]: unknown;
}

export interface UseDittoSyncOptions {
    collection: string;
    tenantId: string;
    query?: Record<string, unknown>;
}

export interface UseDittoSyncResult<T extends DittoDocument> {
    documents: T[];
    isLoading: boolean;
    isOnline: boolean;
    error: Error | null;
    insert: (doc: Omit<T, "_id">) => Promise<string>;
    update: (id: string, updates: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    refresh: () => void;
}

/**
 * Hook for syncing documents with Ditto
 * Provides offline-first data access with automatic sync
 * 
 * Note: This is a placeholder implementation until Ditto SDK is integrated
 * In production, this would use the actual Ditto React hooks
 */
export function useDittoSync<T extends DittoDocument>(
    options: UseDittoSyncOptions
): UseDittoSyncResult<T> {
    const { collection, tenantId, query } = options;
    const [documents, setDocuments] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
    const [error, setError] = useState<Error | null>(null);

    // Local storage key for offline persistence
    const storageKey = `ditto:${tenantId}:${collection}`;

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                setDocuments(JSON.parse(stored));
            }
        } catch (e) {
            console.error("[useDittoSync] Error loading from localStorage:", e);
        }
        setIsLoading(false);
    }, [storageKey]);

    // Persist to localStorage when documents change
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(documents));
            } catch (e) {
                console.error("[useDittoSync] Error saving to localStorage:", e);
            }
        }
    }, [documents, storageKey, isLoading]);

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Insert document
    const insert = useCallback(async (doc: Omit<T, "_id">): Promise<string> => {
        const id = crypto.randomUUID();
        const newDoc = { ...doc, _id: id } as T;

        setDocuments((prev) => [...prev, newDoc]);

        // In production, this would sync to Ditto
        // dittoCollection.upsert(newDoc);

        return id;
    }, []);

    // Update document
    const update = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc._id === id ? { ...doc, ...updates } : doc
            )
        );

        // In production, this would sync to Ditto
        // dittoCollection.findByID(id).update(...);
    }, []);

    // Remove document
    const remove = useCallback(async (id: string): Promise<void> => {
        setDocuments((prev) => prev.filter((doc) => doc._id !== id));

        // In production, this would sync to Ditto
        // dittoCollection.findByID(id).remove();
    }, []);

    // Refresh from remote
    const refresh = useCallback(() => {
        // In production, this would trigger a Ditto sync
        // dittoInstance.transportDiagnostics...
        console.log("[useDittoSync] Refresh triggered");
    }, []);

    return {
        documents,
        isLoading,
        isOnline,
        error,
        insert,
        update,
        remove,
        refresh,
    };
}

/**
 * Hook for subscribing to a single Ditto document
 */
export function useDittoDocument<T extends DittoDocument>(
    collection: string,
    tenantId: string,
    documentId: string
): { document: T | null; isLoading: boolean; error: Error | null } {
    const { documents, isLoading, error } = useDittoSync<T>({
        collection,
        tenantId,
        query: { _id: documentId },
    });

    const document = documents.find((d) => d._id === documentId) ?? null;

    return { document, isLoading, error };
}
