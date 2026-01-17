/**
 * useDittoSync Hook
 * Provides Ditto sync functionality for CommunityOS React components
 * 
 * Supports real Ditto SDK integration when configured, with localStorage fallback
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDitto } from "@/components/communityos/DittoProvider";
import { useDittoStore } from "@/lib/store/ditto-store";

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
    isSyncing: boolean;
    pendingChanges: number;
    isMockMode: boolean;
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
 * Uses real Ditto SDK when available, falls back to localStorage otherwise
 */
export function useDittoSync<T extends DittoDocument>(
    optionsOrCollectionString: UseDittoSyncOptions | string
): UseDittoSyncResult<T> {
    // Support both options object and simple string format
    const options: UseDittoSyncOptions = typeof optionsOrCollectionString === "string"
        ? { collection: optionsOrCollectionString, tenantId: "" }
        : optionsOrCollectionString;
    const { collection, tenantId, query } = options;

    // Get Ditto context (may be null if outside provider or not configured)
    const dittoContext = useDitto();
    const { ditto, isInitialized: dittoInitialized, isOnline: dittoOnline, isSyncing: dittoSyncing, error: dittoError } = dittoContext;

    // Get Ditto store state and actions
    const {
        isSyncing: storeSyncing,
        pendingChanges: storePendingChanges,
        setSyncing: setStoreSyncing,
        incrementPendingChanges,
        decrementPendingChanges,
        setPendingChanges: setStorePendingChanges
    } = useDittoStore();

    const queryClient = useQueryClient();
    const [localDocuments, setLocalDocuments] = useState<T[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const subscriptionRef = useRef<{ cancel: () => void } | null>(null);
    const observerRef = useRef<{ cancel: () => void } | null>(null);

    // Determine if we're in mock mode (using localStorage instead of real Ditto)
    const isMockMode = !ditto || !!dittoError;
    const isOnline = isMockMode ? dittoOnline : dittoOnline; // dittoOnline comes from context which tracks navigator.onLine
    const isSyncing = isMockMode ? false : dittoSyncing;

    // Sanitize and validate collection name
    const sanitizedCollection = useMemo(() => {
        // Remove special characters that might break Ditto queries
        return collection.replace(/[^a-zA-Z0-9_\-:]/g, "");
    }, [collection]);

    // VALIDATION: Warn if tenantId is missing
    useEffect(() => {
        if (!tenantId && typeof optionsOrCollectionString === "object") {
            console.warn("[useDittoSync] No tenantId provided - data may not persist correctly");
        }
    }, [tenantId, optionsOrCollectionString]);

    // Collection name with tenant prefix for Ditto
    const dittoCollectionName = tenantId ? `${tenantId}:${sanitizedCollection}` : sanitizedCollection;

    // Storage key for localStorage fallback
    const storageKey = tenantId ? `ditto:${tenantId}:${collection}` : undefined;


    /**
     * Load documents from localStorage (fallback mode)
     */
    const loadFromLocalStorage = useCallback(() => {
        if (!storageKey) return [];

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored) as T[];
            }
        } catch (e) {
            console.error("[useDittoSync] Error loading from localStorage:", e);
        }
        return [];
    }, [storageKey]);

    // React Query for data fetching
    const { data: documents = [], isLoading, refetch } = useQuery({
        queryKey: ["ditto", dittoCollectionName],
        queryFn: async () => {
            if (isMockMode) {
                return loadFromLocalStorage();
            }

            if (!ditto) return [];

            const dittoCollection = ditto.store.collection(dittoCollectionName);
            const docs = await dittoCollection.findAll().exec();
            return docs.map(doc => ({
                ...doc,
                id: doc._id,
            })) as T[];
        },
        enabled: dittoInitialized,
    });

    /**
     * Initialize real Ditto sync
     */
    useEffect(() => {
        if (!ditto || isMockMode || !dittoInitialized) return;

        try {
            // Create subscription for this collection
            const subscriptionQuery = `SELECT * FROM "${dittoCollectionName}"`;
            subscriptionRef.current = ditto.sync.registerSubscription(subscriptionQuery);

            // Observe local changes and update React Query cache
            const dittoCollection = ditto.store.collection(dittoCollectionName);
            observerRef.current = dittoCollection.findAll().observeLocal((docs) => {
                const typedDocs = docs.map(doc => ({
                    ...doc,
                    id: doc._id,
                })) as T[];
                queryClient.setQueryData(["ditto", dittoCollectionName], typedDocs);
            });

            console.log(`[useDittoSync] Subscribed to Ditto collection: ${dittoCollectionName}`);
        } catch (err) {
            console.error("[useDittoSync] Error initializing Ditto subscription:", err);
            setError(err instanceof Error ? err : new Error("Failed to initialize Ditto subscription"));
        }

        return () => {
            subscriptionRef.current?.cancel();
            observerRef.current?.cancel();
        };
    }, [ditto, dittoCollectionName, isMockMode, dittoInitialized, queryClient]);

    // Persist to localStorage in mock mode
    useEffect(() => {
        if (!isLoading && storageKey && isMockMode) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(documents));
            } catch (e) {
                console.error("[useDittoSync] Error saving to localStorage:", e);
            }
        }
    }, [documents, storageKey, isLoading, isMockMode]);


    // Insert document
    const insert = useCallback(async (doc: Omit<T, "_id" | "id">): Promise<string> => {
        const id = crypto.randomUUID();
        const newDoc = { ...doc, _id: id, id } as T;

        if (ditto && !isMockMode) {
            incrementPendingChanges();
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.upsert({ ...newDoc, _id: id } as unknown as Record<string, unknown>);
                decrementPendingChanges();
            } catch (err) {
                console.error("[useDittoSync] Error inserting document:", err);
                decrementPendingChanges();

                // Optimistically update React Query cache even on error
                queryClient.setQueryData(["ditto", dittoCollectionName], (old: T[] = []) => [...old, newDoc]);
            }
        } else {
            // In mock mode, update local documents then save
            const updatedDocs = [...documents, newDoc];
            if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
            queryClient.setQueryData(["ditto", dittoCollectionName], updatedDocs);
        }

        return id;
    }, [ditto, isMockMode, dittoCollectionName]);

    // Update document
    const update = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
        if (ditto && !isMockMode) {
            incrementPendingChanges();
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.findByID(id).update((mutableDoc) => {
                    Object.entries(updates).forEach(([key, value]) => {
                        (mutableDoc as Record<string, unknown>)[key] = value;
                    });
                });
                decrementPendingChanges();
            } catch (err) {
                console.error("[useDittoSync] Error updating document:", err);
                decrementPendingChanges();

                queryClient.setQueryData(["ditto", dittoCollectionName], (old: T[] = []) =>
                    old.map((doc) => (doc._id === id || doc.id === id) ? { ...doc, ...updates } : doc)
                );
            }
        } else {
            const updatedDocs = documents.map((doc) =>
                (doc._id === id || doc.id === id) ? { ...doc, ...updates } : doc
            );
            if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
            queryClient.setQueryData(["ditto", dittoCollectionName], updatedDocs);
        }
    }, [ditto, isMockMode, dittoCollectionName]);

    // Remove document
    const remove = useCallback(async (id: string): Promise<void> => {
        if (ditto && !isMockMode) {
            incrementPendingChanges();
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.findByID(id).remove();
                decrementPendingChanges();
            } catch (err) {
                console.error("[useDittoSync] Error removing document:", err);
                decrementPendingChanges();

                queryClient.setQueryData(["ditto", dittoCollectionName], (old: T[] = []) =>
                    old.filter((doc) => doc._id !== id && doc.id !== id)
                );
            }
        } else {
            const updatedDocs = documents.filter((doc) => doc._id !== id && doc.id !== id);
            if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
            queryClient.setQueryData(["ditto", dittoCollectionName], updatedDocs);
        }
    }, [ditto, isMockMode, dittoCollectionName]);

    // Refresh from remote
    const refresh = useCallback(async () => {
        console.log("[useDittoSync] Refresh triggered");
        await refetch();
    }, [refetch]);

    // Upsert document (insert or update) - for CommunityOS app compatibility
    const upsertDocument = useCallback(async (id: string, doc: T): Promise<void> => {
        if (ditto && !isMockMode) {
            incrementPendingChanges();
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.upsert({ ...doc, _id: id } as unknown as Record<string, unknown>);
                decrementPendingChanges();
            } catch (err) {
                console.error("[useDittoSync] Error upserting document:", err);
                decrementPendingChanges();

                // Optimistic update
                queryClient.setQueryData(["ditto", dittoCollectionName], (old: T[] = []) => {
                    const existingIndex = old.findIndex((d) => d._id === id || d.id === id);
                    if (existingIndex >= 0) {
                        const updated = [...old];
                        updated[existingIndex] = { ...doc, _id: id, id } as T;
                        return updated;
                    } else {
                        return [...old, { ...doc, _id: id, id } as T];
                    }
                });
            }
        } else {
            queryClient.setQueryData(["ditto", dittoCollectionName], (old: T[] = []) => {
                const existingIndex = old.findIndex((d) => d._id === id || d.id === id);
                let updatedDocs: T[];
                if (existingIndex >= 0) {
                    updatedDocs = [...old];
                    updatedDocs[existingIndex] = { ...doc, _id: id, id } as T;
                } else {
                    updatedDocs = [...old, { ...doc, _id: id, id } as T];
                }
                if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updatedDocs));
                return updatedDocs;
            });
        }
    }, [ditto, isMockMode, dittoCollectionName]);

    // Delete document - for CommunityOS app compatibility
    const deleteDocument = useCallback(async (id: string): Promise<void> => {
        await remove(id);
    }, [remove]);

    return {
        documents,
        isLoading,
        isOnline,
        isSyncing,
        pendingChanges: storePendingChanges,
        isMockMode,
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
