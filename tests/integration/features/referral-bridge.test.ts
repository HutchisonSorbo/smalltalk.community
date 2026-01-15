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

        (getDitto as any).mockResolvedValue(mockDitto);

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
});
