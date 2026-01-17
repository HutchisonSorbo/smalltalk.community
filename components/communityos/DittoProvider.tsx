/**
 * DittoProvider - Real Ditto SDK Integration
 * 
 * Provides Ditto instance to CommunityOS components for offline-first sync.
 * Uses Online with Authentication identity mode integrated with Supabase auth.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";

// Ditto SDK types (imported conditionally to handle SSR)
type DittoInstance = {
    startSync: () => void;
    stopSync: () => void;
    store: {
        collection: (name: string) => DittoCollection;
    };
    sync: {
        registerSubscription: (query: string) => DittoSubscription;
    };
    observePeers: (callback: (peers: unknown[]) => void) => { cancel: () => void };
};

type DittoCollection = {
    findAll: () => {
        observeLocal: (callback: (docs: DittoDocument[], event: unknown) => void) => { cancel: () => void };
        exec: () => Promise<DittoDocument[]>;
    };
    findByID: (id: string) => {
        exec: () => Promise<DittoDocument | null>;
        update: (mutator: (doc: DittoDocument) => void) => Promise<void>;
        remove: () => Promise<boolean>;
    };
    upsert: (doc: Record<string, unknown>) => Promise<{ id: string }>;
};

type DittoDocument = {
    _id: string;
    [key: string]: unknown;
};

type DittoSubscription = {
    cancel: () => void;
};

interface DittoContextValue {
    ditto: DittoInstance | null;
    isInitialized: boolean;
    isOnline: boolean;
    isSyncing: boolean;
    error: Error | null;
    peerCount: number;
}

const DittoContext = createContext<DittoContextValue | null>(null);

interface DittoProviderProps {
    children: React.ReactNode;
    tenantId: string;
}

/**
 * DittoProvider initializes and manages the Ditto SDK connection
 * Integrates with Supabase authentication for secure sync
 */
export function DittoProvider({ children, tenantId }: DittoProviderProps) {
    const [ditto, setDitto] = useState<DittoInstance | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [peerCount, setPeerCount] = useState(0);
    const initializingRef = useRef(false);
    const dittoRef = useRef<DittoInstance | null>(null);

    // Initialize Ditto SDK
    useEffect(() => {
        // Skip on server side
        if (typeof window === "undefined") return;

        // Prevent double initialization
        if (initializingRef.current || dittoRef.current) return;
        initializingRef.current = true;

        const appId = process.env.NEXT_PUBLIC_DITTO_APP_ID;

        // Check if Ditto credentials are configured
        if (!appId) {
            console.warn("[DittoProvider] NEXT_PUBLIC_DITTO_APP_ID not configured, using localStorage fallback");
            setIsInitialized(true);
            setError(new Error("Ditto not configured - using local storage only"));
            return;
        }

        let cleanupFn: (() => void) | undefined;

        async function initDitto() {
            try {
                // ... (existing initDitto logic)
                // Capture the cleanup function from initDitto
                cleanupFn = await (async () => {
                    // Dynamic import to avoid SSR issues
                    const { Ditto } = await import("@dittolive/ditto");
                    const supabase = createClient();

                    // Get current session for initial auth
                    const { data: { session } } = await supabase.auth.getSession();

                    if (!session?.access_token) {
                        console.warn("[DittoProvider] No session available, deferring Ditto init");
                        setIsInitialized(true);
                        return undefined;
                    }

                    // Create Ditto with Online with Authentication identity
                    const dittoInstance = new Ditto({
                        type: "onlineWithAuthentication",
                        appID: appId as string,
                        authHandler: {
                            authenticationRequired: async (authenticator) => {
                                try {
                                    // Get fresh session token
                                    const { data: { session: currentSession } } = await supabase.auth.getSession();

                                    if (currentSession?.access_token) {
                                        authenticator.loginWithToken(
                                            currentSession.access_token,
                                            "supabase"
                                        );
                                        setIsSyncing(true);
                                    } else {
                                        console.error("[DittoProvider] No session for auth");
                                        authenticator.logout();
                                    }
                                } catch (authError) {
                                    console.error("[DittoProvider] Auth handler error:", authError);
                                    authenticator.logout();
                                }
                            },
                            authenticationExpiringSoon: async (authenticator, secondsRemaining) => {
                                console.log(`[DittoProvider] Auth expiring in ${secondsRemaining}s, refreshing...`);
                                try {
                                    // Refresh Supabase session
                                    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();

                                    if (refreshedSession?.access_token) {
                                        authenticator.loginWithToken(
                                            refreshedSession.access_token,
                                            "supabase"
                                        );
                                    }
                                } catch (refreshError) {
                                    console.error("[DittoProvider] Token refresh error:", refreshError);
                                }
                            },
                        },
                    });

                    // Start sync
                    dittoInstance.startSync();

                    // Observe peer connections
                    const peerObserver = (dittoInstance as unknown as DittoInstance).observePeers((peers: unknown[]) => {
                        setPeerCount(Array.isArray(peers) ? peers.length : 0);
                        setIsSyncing(Array.isArray(peers) && peers.length > 0);
                    });

                    // Listen for online/offline status
                    const handleOnline = () => setIsOnline(true);
                    const handleOffline = () => setIsOnline(false);
                    window.addEventListener("online", handleOnline);
                    window.addEventListener("offline", handleOffline);
                    setIsOnline(navigator.onLine);

                    dittoRef.current = dittoInstance as unknown as DittoInstance;
                    setDitto(dittoInstance as unknown as DittoInstance);
                    setIsInitialized(true);
                    setError(null);

                    console.log("[DittoProvider] Ditto initialized successfully for tenant:", tenantId);

                    // Return cleanup function
                    return () => {
                        peerObserver.cancel();
                        window.removeEventListener("online", handleOnline);
                        window.removeEventListener("offline", handleOffline);
                        dittoInstance.stopSync();
                    };
                })();
            } catch (initError) {
                console.error("[DittoProvider] Initialization error:", initError);
                setError(initError instanceof Error ? initError : new Error("Failed to initialize Ditto"));
                setIsInitialized(true);
            }
        }

        initDitto();

        return () => {
            if (cleanupFn) {
                cleanupFn();
                // cleanupFn returned by startSync handles stopSync internally
            } else if (dittoRef.current) {
                // Fallback only if no cleanupFn was returned
                dittoRef.current.stopSync();
            }
            dittoRef.current = null;
        };
    }, [tenantId]);

    const value: DittoContextValue = {
        ditto,
        isInitialized,
        isOnline,
        isSyncing,
        error,
        peerCount,
    };

    return (
        <DittoContext.Provider value={value}>
            {children}
        </DittoContext.Provider>
    );
}

/**
 * Hook to access Ditto context
 */
export function useDitto(): DittoContextValue {
    const context = useContext(DittoContext);

    if (!context) {
        throw new Error("useDitto must be used within a DittoProvider. Check that you have wrapped your component tree with <DittoProvider>.");
    }

    return context;
}

/**
 * Hook to check if Ditto is available and ready
 */
export function useDittoReady(): boolean {
    const { ditto, isInitialized, error } = useDitto();
    return isInitialized && ditto !== null && error === null;
}
