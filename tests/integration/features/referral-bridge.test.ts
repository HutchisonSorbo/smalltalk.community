// tests/integration/features/referral-bridge.test.ts
import { IntegrationBridge } from '@/lib/communityos/IntegrationBridge';
import { getDitto } from '@/lib/ditto/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/ditto/client');

describe('Service Referral Bridge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('successfully bridges public referral to internal tenant storage', async () => {
        const mockUpsert = vi.fn().mockResolvedValue('ref-123');
        const mockCollection = {
            upsert: mockUpsert,
        };
        const mockStore = {
            collection: vi.fn().mockReturnValue(mockCollection),
        };
        const mockDitto = {
            store: mockStore,
        };

        (getDitto as any).mockReturnValue(mockDitto);

        const referralData = {
            sourceApp: 'Youth Navigator',
            name: 'Test Member',
            contact: 'test@example.com',
        };

        await IntegrationBridge.bridgeServiceReferral('tenant-123', referralData);

        expect(mockStore.collection).toHaveBeenCalledWith('tenant_tenant-123_cases');
        expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
            source: 'Youth Navigator',
            patientName: 'Test Member',
        }));
    });

    it('throws error when Ditto client is not initialized', async () => {
        (getDitto as any).mockReturnValue(null);

        const referralData = { sourceApp: 'App', name: 'User', contact: 'test' };

        await expect(IntegrationBridge.bridgeServiceReferral('tenant-123', referralData))
            .rejects.toThrow('Ditto client not initialized');
    });

    it('throws error when sync fails', async () => {
        const mockUpsert = vi.fn().mockRejectedValue(new Error('Ditto sync failed'));
        const mockCollection = { upsert: mockUpsert };
        const mockStore = { collection: vi.fn().mockReturnValue(mockCollection) };
        const mockDitto = { store: mockStore };

        (getDitto as any).mockReturnValue(mockDitto);

        const referralData = { sourceApp: 'App', name: 'User', contact: 'test' };

        await expect(IntegrationBridge.bridgeServiceReferral('tenant-123', referralData))
            .rejects.toThrow('Ditto sync failed');
    });
});
