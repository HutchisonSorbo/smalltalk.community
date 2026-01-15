import { getDitto } from "@/lib/ditto/client";

interface ReferralData {
    sourceApp: string;
    name: string;
    contact: string;
    [key: string]: any;
}

export class IntegrationBridge {
    private static validateTenantId(tenantId: string): string {
        const sanitized = tenantId.trim();
        if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
            throw new Error(`Invalid tenantId: ${tenantId}`);
        }
        return sanitized;
    }

    static async bridgeServiceReferral(tenantId: string, data: ReferralData) {
        const validTenantId = this.validateTenantId(tenantId);
        const ditto = getDitto();

        if (!ditto) {
            throw new Error(`Ditto client not initialized for tenantId: ${tenantId}`);
        }

        const tenantStore = ditto.store.collection(`tenant_${validTenantId}_cases`);

        try {
            await tenantStore.upsert({
                source: data.sourceApp,
                patientName: data.name,
                contactInfo: data.contact,
                status: "new",
                bridgedAt: new Date().toISOString(),
                originalData: data
            });

            // PII Masking: Log only safe identifiers
            console.log(`[IntegrationBridge] Bridged referral from output for tenant ${validTenantId}`);
        } catch (error) {
            console.error(`[IntegrationBridge] Failed to bridge referral:`, error);
            throw error;
        }
    }

    static async syncApplicationsToCRM() {
        // Placeholder for syncing volunteer applications to CRM
        // Implementation depends on specific CRM requirements
    }
}
