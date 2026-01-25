import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTenantProfile, updateTenantImpactStats } from '@/lib/communityos/actions';
import * as tenantContext from '@/lib/communityos/tenant-context';
import * as supabaseServer from '@/lib/supabase-server';

// Mock dependencies
vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn(),
}));

// Mock Drizzle
vi.mock('@/server/db', () => ({
    db: {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({}),
    },
}));

vi.mock('@/lib/communityos/tenant-context', () => ({
    isTenantAdmin: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { db } from '@/server/db';

describe('CommunityOS Actions (Refined)', () => {
    const mockTenantId = 'test-tenant-id';
    const mockUserId = 'test-user-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupAuth = (user: any = { id: mockUserId }, isAdmin = true) => {
        (supabaseServer.createClient as any).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user } }),
            },
        });
        (tenantContext.isTenantAdmin as any).mockResolvedValue(isAdmin);
    };

    describe('updateTenantProfile', () => {
        it('should return error if not authenticated', async () => {
            setupAuth(null);
            const result = await updateTenantProfile(mockTenantId, { name: 'New Name' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Authentication required');
            }
        });

        it('should return error if Zod validation fails (invalid color)', async () => {
            setupAuth();
            const result = await updateTenantProfile(mockTenantId, { primaryColor: 'not-a-color' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('Validation failed');
            }
        });

        it('should update profile successfully when admin', async () => {
            setupAuth();
            (db.where as any).mockResolvedValue({});

            const result = await updateTenantProfile(mockTenantId, {
                name: 'New Name',
                missionStatement: 'New Mission',
                primaryColor: '#ff0000'
            });

            expect(result.success).toBe(true);
            expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Name',
                missionStatement: 'New Mission'
            }));
        });
    });

    describe('updateTenantImpactStats', () => {
        it('should validate impact stats schema', async () => {
            setupAuth();
            const invalidStats = [{ label: '', value: '100' }];
            const result = await updateTenantImpactStats(mockTenantId, invalidStats);
            expect(result.success).toBe(false);
        });

        it('should update impact stats successfully', async () => {
            setupAuth();
            const stats = [{ label: 'Members', value: '100', icon: 'users' }];
            const result = await updateTenantImpactStats(mockTenantId, stats);

            if (!result.success) {
                console.error('Impact update failed:', result.error);
            }

            expect(result.success).toBe(true);
            expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
                impactStats: stats,
            }));
        });
    });
});
