/**
 * Tests for getPublicTenantByCode function
 * Tests the public profile page data fetching logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase service client
vi.mock('@/lib/supabase-service', () => ({
    createServiceClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(),
                    })),
                })),
            })),
        })),
    })),
}));

import { getPublicTenantByCode } from '@/lib/communityos/tenant-context';
import { createServiceClient } from '@/lib/supabase-service';

describe('getPublicTenantByCode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns tenant when found and public', async () => {
        const mockTenant = {
            id: 'test-id',
            code: 'stc',
            name: 'smalltalk.community Inc',
            is_public: true,
            description: 'Test description',
        };

        // Setup mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockTenant, error: null });
        const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
        const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        vi.mocked(createServiceClient).mockReturnValue({
            from: fromMock,
        } as any);

        const result = await getPublicTenantByCode('stc');

        expect(result).toEqual(mockTenant);
        expect(fromMock).toHaveBeenCalledWith('tenants');
        expect(selectMock).toHaveBeenCalledWith('*');
        expect(eqCodeMock).toHaveBeenCalledWith('code', 'stc');
        expect(eqPublicMock).toHaveBeenCalledWith('is_public', true);
    });

    it('returns null when tenant not found', async () => {
        const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
        const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
        const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        vi.mocked(createServiceClient).mockReturnValue({
            from: fromMock,
        } as any);

        const result = await getPublicTenantByCode('nonexistent');

        expect(result).toBeNull();
    });

    it('returns null when tenant exists but is not public', async () => {
        // The query includes .eq('is_public', true), so non-public tenants won't be returned
        const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
        const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
        const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        vi.mocked(createServiceClient).mockReturnValue({
            from: fromMock,
        } as any);

        const result = await getPublicTenantByCode('private-org');

        expect(result).toBeNull();
    });
});
