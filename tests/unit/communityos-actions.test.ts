import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTenantProfile, updateTenantImpactStats } from '@/lib/communityos/actions';
import * as tenantContext from '@/lib/communityos/tenant-context';
import * as supabaseServer from '@/lib/supabase-server';
import * as supabaseService from '@/lib/supabase-service';

// Mock dependencies
vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/lib/supabase-service', () => ({
    createServiceClient: vi.fn(),
}));

vi.mock('@/lib/communityos/tenant-context', () => ({
    isTenantAdmin: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('CommunityOS Actions', () => {
    const mockTenantId = 'test-tenant-id';
    const mockUserId = 'test-user-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateTenantProfile', () => {
        it('should return error if not authenticated', async () => {
            (supabaseServer.createClient as any).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
                },
            });

            const result = await updateTenantProfile(mockTenantId, { name: 'New Name' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Authentication required');
            }
        });

        it('should return error if not an admin', async () => {
            (supabaseServer.createClient as any).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
                },
            });
            (tenantContext.isTenantAdmin as any).mockResolvedValue(false);

            const result = await updateTenantProfile(mockTenantId, { name: 'New Name' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Admin privileges required');
            }
        });

        it('should update profile successfully when admin', async () => {
            // Mock auth
            (supabaseServer.createClient as any).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
                },
            });
            (tenantContext.isTenantAdmin as any).mockResolvedValue(true);

            // Mock DB
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockResolvedValue({ error: null });
            (supabaseService.createServiceClient as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    update: mockUpdate,
                    eq: mockEq,
                }),
            });

            const result = await updateTenantProfile(mockTenantId, { name: 'New Name', missionStatement: 'New Mission' });

            expect(result.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Name',
                mission_statement: 'New Mission',
            }));
        });

        it('should return error if database update fails', async () => {
            (supabaseServer.createClient as any).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
                },
            });
            (tenantContext.isTenantAdmin as any).mockResolvedValue(true);

            (supabaseService.createServiceClient as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ error: { message: 'DB Error' } }),
                }),
            });

            const result = await updateTenantProfile(mockTenantId, { name: 'New Name' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Failed to update profile');
            }
        });
    });

    describe('updateTenantImpactStats', () => {
        it('should update impact stats successfully', async () => {
            (supabaseServer.createClient as any).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
                },
            });
            (tenantContext.isTenantAdmin as any).mockResolvedValue(true);

            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockResolvedValue({ error: null });
            (supabaseService.createServiceClient as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    update: mockUpdate,
                    eq: mockEq,
                }),
            });

            const stats = [{ label: 'Members', value: '100', icon: 'users' }];
            const result = await updateTenantImpactStats(mockTenantId, stats);

            expect(result.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                impact_stats: stats,
            }));
        });
    });
});
