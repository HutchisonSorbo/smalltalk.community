/**
 * Ditto Client Initialization
 * Sets up Ditto for offline-first sync in CommunityOS apps
 * 
 * Requires Ditto Portal credentials:
 * - DITTO_APP_ID: Your Ditto app ID
 * - DITTO_PLAYGROUND_TOKEN: Token for development (or use Auth Webhook for production)
 */

import { Ditto, type IdentityOfflinePlayground, type IdentityOnlineWithAuthentication } from "@dittolive/ditto";

export interface DittoConfig {
    appId: string;
    token: string;
    authUrl?: string;
}

// Re-export Ditto types for use in other files if needed
export type { Ditto } from "@dittolive/ditto";

let dittoInstance: Ditto | null = null;

/**
 * Get or initialize Ditto instance
 * Uses singleton pattern to ensure only one instance exists
 */
export function getDitto(): Ditto | null {
    return dittoInstance;
}

/**
 * Initialize Ditto with offline playground identity (for development)
 * In production, use the Auth Webhook for proper authentication
 */
export async function initDitto(config: DittoConfig): Promise<Ditto> {
    if (dittoInstance) {
        return dittoInstance;
    }

    const identity: IdentityOfflinePlayground = {
        type: "offlinePlayground",
        appID: config.appId,
        token: config.token,
    };

    // Initialize Ditto with the identity and a persistence path
    dittoInstance = new Ditto(identity, "/ditto");

    try {
        await dittoInstance.startSync();
        console.log("[Ditto] Sync started successfully (Playground Mode)");
    } catch (error) {
        console.error("[Ditto] Failed to start sync:", error);
    }

    return dittoInstance;
}

/**
 * Initialize Ditto with Online with Authentication identity (for production)
 * Uses the Supabase Edge Function webhook for authentication
 */
export async function initDittoWithAuth(
    appId: string,
    authUrl: string,
    getSupabaseToken: () => Promise<string>
): Promise<Ditto> {
    if (dittoInstance) {
        return dittoInstance;
    }

    const identity: IdentityOnlineWithAuthentication = {
        type: "onlineWithAuthentication",
        appID: appId,
        authenticationDelegate: {
            async authenticate() {
                // Fetch the Supabase JWT token
                const token = await getSupabaseToken();

                // Call the Ditto auth webhook (Supabase Edge Function)
                const response = await fetch(authUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        clientId: "community-os-web",
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Ditto authentication failed: ${response.statusText}`);
                }

                const data = await response.json();
                if (!data.authenticated) {
                    throw new Error(data.error || "Ditto authentication failed");
                }

                return data.token; // This is the Ditto-signed token from the webhook if applicable, 
                // but often the webhook returns the token directly to Ditto.
                // Actually, for OnlineWithAuthentication, Ditto expects a token to be returned 
                // from the authenticate method if using a custom provider.
            }
        }
    };

    dittoInstance = new Ditto(identity, "/ditto");

    try {
        await dittoInstance.startSync();
        console.log("[Ditto] Authenticated sync started successfully");
    } catch (error) {
        console.error("[Ditto] Failed to start authenticated sync:", error);
    }

    return dittoInstance;
}

/**
 * Stop Ditto sync and cleanup
 */
export async function stopDitto(): Promise<void> {
    if (dittoInstance) {
        await dittoInstance.stopSync();
        dittoInstance = null;
        console.log("[Ditto] Sync stopped");
    }
}

/**
 * Get sync status
 */
export function getDittoSyncStatus(): "online" | "offline" | "disconnected" {
    if (!dittoInstance) return "disconnected";

    // Check if we have any peers (indicates online sync)
    const peers = dittoInstance.presence.graph.remotePeers;
    return peers.length > 0 ? "online" : "offline";
}
