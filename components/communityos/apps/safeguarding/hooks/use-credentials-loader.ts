"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Credential } from "@/lib/communityos/safeguarding/types";

/**
 * Hook that manages credential data loading using React Query.
 * Derives stats and memoises audit logs for stable references.
 * 
 * @returns Object containing:
 * - `credentials`: Array of Credential objects (defaults to undefined while loading)
 * - `incidentsCount`: Number of active incidents (currently mock data)
 * - `expiringCredentialsCount`: Number of credentials with 'expiring-soon' status
 * - `auditLogs`: Memoised array of recent compliance actions
 * - `isLoading`: Boolean indicating the initial fetch is in progress
 * - `isFetching`: Boolean indicating any fetch (including refetch) is in progress
 * - `error`: Error object if the query fails
 * - `refetch`: Function to manually trigger a data reload
 */
export function useCredentialsLoader() {
    // Hoist a stable reference for the mock created_at timestamp
    const MOCK_TIMESTAMP = useMemo(() => new Date().toISOString(), []);

    const fetchCredentials = async (): Promise<Credential[]> => {
        try {
            // Simulate API fetch delay
            await new Promise(resolve => setTimeout(resolve, 300));
            return [
                {
                    id: "c1",
                    user_name: "Alice Thompson",
                    type: "WWCC (Working with Children)",
                    expiry_date: new Date(Date.now() + 15 * 86400000).toISOString(),
                    status: "expiring-soon"
                },
                {
                    id: "c2",
                    user_name: "Bob Roberts",
                    type: "Police Check",
                    expiry_date: new Date(Date.now() - 2 * 86400000).toISOString(),
                    status: "expired"
                },
                {
                    id: "c3",
                    user_name: "Claire Smith",
                    type: "First Aid Certification",
                    expiry_date: new Date(Date.now() + 120 * 86400000).toISOString(),
                    status: "valid"
                }
            ];
        } catch (error) {
            console.error("use-credentials-loader: fetchCredentials failed", error);
            throw error;
        }
    };

    const query = useQuery({
        queryKey: ["safeguarding-credentials"],
        queryFn: fetchCredentials,
    });

    const credentials = query.data || [];

    // Derived stats
    // NOTE: incidentsCount is currently hardcoded placeholder data until real backend integration.
    const incidentsCount = 2;
    const expiringCredentialsCount = credentials.filter(c => c.status === 'expiring-soon').length;

    const auditLogs = useMemo(() => [
        {
            id: "1",
            user_name: "Mock User",
            action: "Updated Standard 1",
            target_type: "standard" as const,
            target_id: "1",
            details: "Marked 'Leadership Support' as completed.",
            created_at: MOCK_TIMESTAMP
        }
    ], [MOCK_TIMESTAMP]);

    return {
        credentials,
        incidentsCount,
        expiringCredentialsCount,
        auditLogs,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch
    };
}


