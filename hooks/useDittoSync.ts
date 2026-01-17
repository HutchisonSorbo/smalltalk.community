/**
 * useDittoSync Hook
 * Provides Ditto sync functionality for CommunityOS React components
 * 
 * Supports real Ditto SDK integration when configured, with localStorage fallback
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDitto } from "@/components/communityos/DittoProvider";

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

    const [documents, setDocuments] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [localOnline, setLocalOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
    const [pendingChanges, setPendingChanges] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const subscriptionRef = useRef<{ cancel: () => void } | null>(null);
    const observerRef = useRef<{ cancel: () => void } | null>(null);

    // Determine if we're in mock mode (using localStorage instead of real Ditto)
    const isMockMode = !ditto || !!dittoError;
    const isOnline = isMockMode ? localOnline : dittoOnline;
    const isSyncing = isMockMode ? false : dittoSyncing;

    // VALIDATION: Warn if tenantId is missing
    useEffect(() => {
        if (!tenantId && typeof optionsOrCollectionString === "object") {
            console.warn("[useDittoSync] No tenantId provided - data may not persist correctly");
        }
    }, [tenantId, optionsOrCollectionString]);

    // Collection name with tenant prefix for Ditto
    const dittoCollectionName = tenantId ? `${tenantId}:${collection}` : collection;

    // Storage key for localStorage fallback
    const storageKey = tenantId ? `ditto:${tenantId}:${collection}` : undefined;

    // Initialize data source (Ditto or localStorage)
    useEffect(() => {
        // Wait for Ditto to initialize
        if (!dittoInitialized) return;

        if (ditto && !dittoError) {
            // Real Ditto mode - set up subscription and observer
            initDittoSync();
        } else {
            // Mock mode - load from localStorage
            loadFromLocalStorage();
        }

        return () => {
            // Cleanup subscriptions
            if (subscriptionRef.current) {
                subscriptionRef.current.cancel();
            }
            if (observerRef.current) {
                observerRef.current.cancel();
            }
        };
    }, [dittoInitialized, ditto, dittoError, dittoCollectionName, storageKey]);

    /**
     * Load documents from localStorage (fallback mode)
     */
    const loadFromLocalStorage = useCallback(() => {
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

    /**
     * Initialize real Ditto sync
     */
    const initDittoSync = useCallback(async () => {
        if (!ditto) return;

        try {
            setIsLoading(true);

            // Create subscription for this collection
            const subscriptionQuery = `SELECT * FROM "${dittoCollectionName}"`;
            subscriptionRef.current = ditto.sync.registerSubscription(subscriptionQuery);

            // Observe local changes
            const dittoCollection = ditto.store.collection(dittoCollectionName);
            observerRef.current = dittoCollection.findAll().observeLocal((docs) => {
                // Convert Ditto documents to our format
                const typedDocs = docs.map(doc => ({
                    ...doc,
                    id: doc._id, // Ensure id field is set for compatibility
                })) as T[];
                setDocuments(typedDocs);
                setIsLoading(false);
            });

            // Initial load
            const initialDocs = await dittoCollection.findAll().exec();
            const typedDocs = initialDocs.map(doc => ({
                ...doc,
                id: doc._id,
            })) as T[];
            setDocuments(typedDocs);
            setIsLoading(false);
            setError(null);

            console.log(`[useDittoSync] Connected to Ditto collection: ${dittoCollectionName}`);
        } catch (err) {
            console.error("[useDittoSync] Error initializing Ditto sync:", err);
            setError(err instanceof Error ? err : new Error("Failed to initialize Ditto sync"));
            // Fall back to localStorage
            loadFromLocalStorage();
        }
    }, [ditto, dittoCollectionName, loadFromLocalStorage]);

    // Initialize data source (Ditto or localStorage)
    useEffect(() => {
        // Wait for Ditto to initialize
        if (!dittoInitialized) return;

        if (ditto && !dittoError) {
            // Real Ditto mode - set up subscription and observer
            initDittoSync();
        } else {
            // Mock mode - load from localStorage
            loadFromLocalStorage();
        }

        return () => {
            // Cleanup subscriptions
            if (subscriptionRef.current) {
                subscriptionRef.current.cancel();
            }
            if (observerRef.current) {
                observerRef.current.cancel();
            }
        };
    }, [dittoInitialized, ditto, dittoError, initDittoSync, loadFromLocalStorage]);

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

    // Online/offline detection for mock mode
    useEffect(() => {
        if (!isMockMode) return;

        const handleOnline = () => setLocalOnline(true);
        const handleOffline = () => setLocalOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [isMockMode]);

    // Insert document
    const insert = useCallback(async (doc: Omit<T, "_id" | "id">): Promise<string> => {
        const id = crypto.randomUUID();
        const newDoc = { ...doc, _id: id, id } as T;

        if (ditto && !isMockMode) {
            setPendingChanges((prev) => prev + 1);
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.upsert({ ...newDoc, _id: id } as unknown as Record<string, unknown>);
                setPendingChanges((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("[useDittoSync] Error inserting document:", err);
                // Still update local state on error for offline-first experience
                setDocuments((prev) => [...prev, newDoc]);
                // Keep pending if you want it to retry, or decrement if error is terminal.
                // For now, aligning with "Correctly decrement pendingChanges" by ensuring 
                // we don't just increment indefinitely on success.
            }
        } else {
            setDocuments((prev) => [...prev, newDoc]);
        }

        return id;
    }, [ditto, isMockMode, dittoCollectionName]);

    // Update document
    const update = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
        if (ditto && !isMockMode) {
            setPendingChanges((prev) => prev + 1);
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.findByID(id).update((mutableDoc) => {
                    Object.entries(updates).forEach(([key, value]) => {
                        (mutableDoc as Record<string, unknown>)[key] = value;
                    });
                });
                setPendingChanges((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("[useDittoSync] Error updating document:", err);
                setDocuments((prev) =>
                    prev.map((doc) =>
                        (doc._id === id || doc.id === id) ? { ...doc, ...updates } : doc
                    )
                );
            }
        } else {
            setDocuments((prev) =>
                prev.map((doc) =>
                    (doc._id === id || doc.id === id) ? { ...doc, ...updates } : doc
                )
            );
        }
    }, [ditto, isMockMode, dittoCollectionName]);

    // Remove document
    const remove = useCallback(async (id: string): Promise<void> => {
        if (ditto && !isMockMode) {
            setPendingChanges((prev) => prev + 1);
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.findByID(id).remove();
                setPendingChanges((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("[useDittoSync] Error removing document:", err);
                setDocuments((prev) => prev.filter((doc) => doc._id !== id && doc.id !== id));
            }
        } else {
            setDocuments((prev) => prev.filter((doc) => doc._id !== id && doc.id !== id));
        }
    }, [ditto, isMockMode, dittoCollectionName]);

    // Refresh from remote
    const refresh = useCallback(() => {
        if (ditto && !isMockMode) {
            // Re-fetch from Ditto
            const dittoCollection = ditto.store.collection(dittoCollectionName);
            dittoCollection.findAll().exec().then((docs) => {
                const typedDocs = docs.map(doc => ({
                    ...doc,
                    id: doc._id,
                })) as T[];
                setDocuments(typedDocs);
            }).catch((err) => {
                console.error("[useDittoSync] Error refreshing:", err);
            });
        }
        console.log("[useDittoSync] Refresh triggered");
    }, [ditto, isMockMode, dittoCollectionName]);

    // Upsert document (insert or update) - for CommunityOS app compatibility
    const upsertDocument = useCallback(async (id: string, doc: T): Promise<void> => {
        if (ditto && !isMockMode) {
            setPendingChanges((prev) => prev + 1);
            try {
                const dittoCollection = ditto.store.collection(dittoCollectionName);
                await dittoCollection.upsert({ ...doc, _id: id } as unknown as Record<string, unknown>);
                setPendingChanges((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("[useDittoSync] Error upserting document:", err);
                // Fall back to local update
                setDocuments((prev) => {
                    const existingIndex = prev.findIndex((d) => d._id === id || d.id === id);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = { ...doc, _id: id, id } as T;
                        return updated;
                    } else {
                        return [...prev, { ...doc, _id: id, id } as T];
                    }
                });
            }
        } else {
            setDocuments((prev) => {
                const existingIndex = prev.findIndex((d) => d._id === id || d.id === id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...doc, _id: id, id } as T;
                    return updated;
                } else {
                    return [...prev, { ...doc, _id: id, id } as T];
                }
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
        pendingChanges,
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
