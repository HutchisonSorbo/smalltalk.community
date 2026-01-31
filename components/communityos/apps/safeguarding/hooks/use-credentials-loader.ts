"use client";

import { useState, useEffect } from "react";
import { Credential } from "@/lib/communityos/safeguarding/types";

export function useCredentialsLoader() {
    const [credentials, setCredentials] = useState<Credential[]>([]);

    // Mock constants for simplicity (moved here as they are related to data loading/stats)
    const incidentsCount = 2;
    const expiringCredentialsCount = 3;
    const auditLogs = [
        {
            id: "1",
            user_name: "Mock User",
            action: "Updated Standard 1",
            target_type: "standard" as const,
            target_id: "1",
            details: "Marked 'Leadership Support' as completed.",
            created_at: new Date().toISOString()
        }
    ];

    useEffect(() => {
        async function loadCredentials() {
            try {
                // Simulate API fetch delay
                await new Promise(resolve => setTimeout(resolve, 300));
                const mockCredentials: Credential[] = [
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
                setCredentials(mockCredentials);
            } catch (error) {
                console.error("Error loading credentials in loadCredentials:", error);
                setCredentials([]);
            }
        }
        loadCredentials();
    }, []);

    return {
        credentials,
        incidentsCount,
        expiringCredentialsCount,
        auditLogs
    };
}
