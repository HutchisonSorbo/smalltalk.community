/**
 * useDittoSync Hook
 * Provides Ditto sync functionality for CommunityOS React components
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface DittoDocument {
    _id?: string;
    id?: string;
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
    insert: (doc: Omit<T, "_id" | "id">) => Promise<string>;
    update: (id: string, updates: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    refresh: () => void;
    // Aliases for compatibility with CommunityOS apps
    upsertDocument: (id: string, doc: T) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
}

/**
 * Hook for syncing documents with Ditto
 * Provides offline-first data access with automatic sync
 * 
 * Supports two calling conventions:
 * 1. Full options object: useDittoSync({ collection, tenantId, query })
 * 2. Simple collection string: useDittoSync("tenantId:collection")
 * 
 * Note: This is a placeholder implementation until Ditto SDK is integrated
 * In production, this would use the actual Ditto React hooks
 */
export function useDittoSync<T extends DittoDocument>(
    optionsOrCollectionString: UseDittoSyncOptions | string
): UseDittoSyncResult<T> {
    // Support both options object and simple string format
    const options: UseDittoSyncOptions = typeof optionsOrCollectionString === "string"
        ? { collection: optionsOrCollectionString, tenantId: "" }
        : optionsOrCollectionString;
    const { collection, tenantId, query } = options;
    const [documents, setDocuments] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
    const [error, setError] = useState<Error | null>(null);

    // VALIDATION: Warn if tenantId is missing
    useEffect(() => {
        if (!tenantId && typeof optionsOrCollectionString === "object") {
            console.warn("[useDittoSync] No tenantId provided - data may not persist correctly");
        }
    }, [tenantId, optionsOrCollectionString]);

    // VALIDATION: Prevent undefined in storage key
    // Only persist if we have a valid tenantId
    const storageKey = tenantId ? `ditto:${tenantId}:${collection}` : undefined;

    // Load from localStorage on mount
    useEffect(() => {
        if (!storageKey) {
            setIsLoading(false);
            return;
        }

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
        if (!isLoading && storageKey) {
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
    const insert = useCallback(async (doc: Omit<T, "_id" | "id">): Promise<string> => {
        const id = crypto.randomUUID();
        const newDoc = { ...doc, _id: id, id } as T;

        setDocuments((prev) => [...prev, newDoc]);

        // In production, this would sync to Ditto
        // dittoCollection.upsert(newDoc);

        return id;
    }, []);

    // Update document
    const update = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
        setDocuments((prev) =>
            prev.map((doc) =>
                (doc._id === id || doc.id === id) ? { ...doc, ...updates } : doc
            )
        );

        // In production, this would sync to Ditto
        // dittoCollection.findByID(id).update(...);
    }, []);

    // Remove document
    const remove = useCallback(async (id: string): Promise<void> => {
        setDocuments((prev) => prev.filter((doc) => doc._id !== id && doc.id !== id));

        // In production, this would sync to Ditto
        // dittoCollection.findByID(id).remove();
    }, []);

    // Refresh from remote
    const refresh = useCallback(() => {
        // In production, this would trigger a Ditto sync
        // dittoInstance.transportDiagnostics...
        console.log("[useDittoSync] Refresh triggered");
    }, []);

    // Upsert document (insert or update) - for CommunityOS app compatibility
    // Supports both _id and id fields for document identification
    const upsertDocument = useCallback(async (id: string, doc: T): Promise<void> => {
        setDocuments((prev) => {
            const existingIndex = prev.findIndex((d) => d._id === id || (d as Record<string, unknown>).id === id);
            if (existingIndex >= 0) {
                // Update existing
                const updated = [...prev];
                updated[existingIndex] = { ...doc, _id: id, id } as T;
                return updated;
            } else {
                // Insert new
                return [...prev, { ...doc, _id: id, id } as T];
            }
        });
    }, []);

    // Delete document - for CommunityOS app compatibility
    // Supports both _id and id fields for document identification
    const deleteDocument = useCallback(async (id: string): Promise<void> => {
        setDocuments((prev) => prev.filter((doc) => doc._id !== id && (doc as Record<string, unknown>).id !== id));
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
        upsertDocument,
        deleteDocument,
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
