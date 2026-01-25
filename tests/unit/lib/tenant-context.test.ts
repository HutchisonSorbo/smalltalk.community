/**
 * Tests for getPublicTenantByCode function
 * Tests the public profile page data fetching logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase server client (used by createClient)
vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn(async () => ({
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

import { getPublicTenantByCode, type PublicTenant } from '@/lib/communityos/tenant-context';
import { createClient } from '@/lib/supabase-server';

describe('getPublicTenantByCode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns tenant when found and public', async () => {
        const mockTenantRow = {
            id: 'test-id',
            code: 'stc',
            name: 'smalltalk.community Inc',
            is_public: true,
            description: 'Test description',
        };

        const expectedTenant: PublicTenant = {
            id: 'test-id',
            code: 'stc',
            name: 'smalltalk.community Inc',
            isPublic: true,
            description: 'Test description',
            logoUrl: null,
            primaryColor: null,
            secondaryColor: null,
            website: null,
            heroImageUrl: null,
            missionStatement: null,
            socialLinks: {},
            contactEmail: null,
            contactPhone: null,
            address: null,
            impactStats: [],
            programs: [],
            teamMembers: [],
            gallery: [],
            testimonials: [],
            ctas: [],
            events: [],
        };

        // Setup mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockTenantRow, error: null });
        const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
        const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        vi.mocked(createClient).mockResolvedValue({
            from: fromMock,
        } as any);

        const result = await getPublicTenantByCode('stc');

        expect(result).toEqual(expectedTenant);
        expect(fromMock).toHaveBeenCalledWith('tenants');
        // Check for explicit columns (starting with 'id, code, name')
        expect(selectMock).toHaveBeenCalledWith(expect.stringContaining('id, code, name'));
        expect(eqCodeMock).toHaveBeenCalledWith('code', 'stc');
        expect(eqPublicMock).toHaveBeenCalledWith('is_public', true);
    });

    it('returns null when tenant not found', async () => {
        const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
        const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
        const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        vi.mocked(createClient).mockResolvedValue({
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

        vi.mocked(createClient).mockResolvedValue({
            from: fromMock,
        } as any);

        const result = await getPublicTenantByCode('private-org');

        expect(result).toBeNull();
    });

    describe('input validation', () => {
        it('returns null for empty string', async () => {
            const result = await getPublicTenantByCode('');
            expect(result).toBeNull();
            // Should not call database for invalid input
            expect(createClient).not.toHaveBeenCalled();
        });

        it('returns null for whitespace-only string', async () => {
            const result = await getPublicTenantByCode('   ');
            expect(result).toBeNull();
            expect(createClient).not.toHaveBeenCalled();
        });

        it('trims whitespace from code before querying', async () => {
            const mockTenantRow = { id: 'test', code: 'stc', name: 'Test', is_public: true };
            const singleMock = vi.fn().mockResolvedValue({ data: mockTenantRow, error: null });
            const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
            const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
            const fromMock = vi.fn().mockReturnValue({ select: selectMock });

            vi.mocked(createClient).mockResolvedValue({
                from: fromMock,
            } as any);

            await getPublicTenantByCode('  stc  ');

            expect(eqCodeMock).toHaveBeenCalledWith('code', 'stc');
        });
    });

    describe('error handling', () => {
        it('returns null and logs error on database failure', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const singleMock = vi.fn().mockRejectedValue(new Error('Connection failed'));
            const eqPublicMock = vi.fn().mockReturnValue({ single: singleMock });
            const eqCodeMock = vi.fn().mockReturnValue({ eq: eqPublicMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqCodeMock });
            const fromMock = vi.fn().mockReturnValue({ select: selectMock });

            vi.mocked(createClient).mockResolvedValue({
                from: fromMock,
            } as any);

            const result = await getPublicTenantByCode('stc');

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
