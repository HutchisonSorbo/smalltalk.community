
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/onboarding/profile/route';

// Mocks
const {
    mockGetUser,
    mockDbSelect,
    mockDbFrom,
    mockDbWhere,
    mockDbLimit,
    mockDbTransaction
} = vi.hoisted(() => {
    const mockGetUser = vi.fn();
    const mockDbSelect = vi.fn();
    const mockDbFrom = vi.fn();
    const mockDbWhere = vi.fn();
    const mockDbLimit = vi.fn();
    const mockDbTransaction = vi.fn();

    // Setup chainable mock for db.select().from().where().limit()
    mockDbSelect.mockReturnValue({ from: mockDbFrom });
    mockDbFrom.mockReturnValue({ where: mockDbWhere });
    mockDbWhere.mockReturnValue({ limit: mockDbLimit });

    return {
        mockGetUser,
        mockDbSelect,
        mockDbFrom,
        mockDbWhere,
        mockDbLimit,
        mockDbTransaction
    };
});

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: mockGetUser,
        },
    })),
}));

vi.mock('@/server/db', () => ({
    db: {
        select: mockDbSelect,
        transaction: mockDbTransaction,
    },
}));

vi.mock('@/lib/utils/moderation', () => ({
    moderateContent: vi.fn((text) => text ? `[MODERATED] ${text}` : ""),
}));

// Mock the schemas
vi.mock('@/lib/onboarding-schemas', () => {
    const { z } = require('zod');
    return {
        profileSetupSchema: z.object({
            bio: z.string().optional(),
            headline: z.string().optional(),
            dateOfBirth: z.string().optional(),
            location: z.string().optional(),
            profileImageUrl: z.string().optional(),
        })
    };
});

vi.mock('@shared/schema', () => ({
    users: { id: 'users.id', accountType: 'accountType', userType: 'userType', onboardingStep: 'onboardingStep' },
    musicianProfiles: { userId: 'musicianProfiles.userId' },
    professionalProfiles: { userId: 'professionalProfiles.userId' },
    organisations: { id: 'organisations.id' },
    organisationMembers: { userId: 'organisationMembers.userId' },
    userOnboardingResponses: { userId: 'userOnboardingResponses.userId' },
    userPrivacySettings: { userId: 'userPrivacySettings.userId' },
}));

describe('POST /api/onboarding/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

        mockDbSelect.mockReturnValue({ from: mockDbFrom });
        mockDbFrom.mockReturnValue({ where: mockDbWhere });
        mockDbWhere.mockReturnValue({ limit: mockDbLimit });
    });

    it('should return 401 if Authorization header is missing', async () => {
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: 'Auth error' });
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer invalid-token' },
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should return 400 for validation failure', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 123 }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('should return 404 if user not found', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([]);
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 'Test' }),
        });
        const res = await POST(req);
        expect(res.status).toBe(404);
    });

    it('should return 400 if user is under 13', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{ id: 'user-123' }]);

        const today = new Date();
        const under13Date = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString().split('T')[0];

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 'Kid', dateOfBirth: under13Date }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('should succeed and moderate content for valid user', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{
            id: 'user-123',
            accountType: 'Individual',
            userType: 'musician',
            firstName: 'Test',
            lastName: 'User'
        }]);
        mockDbTransaction.mockImplementation(async (callback) => {
            const txMock = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockReturnValue({
                        onConflictDoUpdate: vi.fn(),
                        returning: vi.fn().mockResolvedValue([{ id: 'org-1' }])
                    })
                }),
                update: vi.fn().mockReturnValue({
                    set: vi.fn().mockReturnValue({
                        where: vi.fn()
                    })
                })
            };
            await callback(txMock);
        });

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 'Bad bio' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        const { moderateContent } = await import('@/lib/utils/moderation');
        expect(moderateContent).toHaveBeenCalledWith('Bad bio');
    });

    it('should apply strict privacy settings for a Minor user (13-17)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{
            id: 'user-123',
            accountType: 'Individual',
            userType: 'musician',
            firstName: 'Teen',
            lastName: 'User'
        }]);

        const today = new Date();
        const minorDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()).toISOString().split('T')[0];

        const mockValues = vi.fn().mockReturnValue({
            onConflictDoUpdate: vi.fn(),
            returning: vi.fn().mockResolvedValue([{ id: 'res-1' }])
        });

        mockDbTransaction.mockImplementation(async (callback) => {
            const txMock = {
                insert: vi.fn().mockReturnValue({ values: mockValues }),
                update: vi.fn().mockReturnValue({
                    set: vi.fn().mockReturnValue({ where: vi.fn() })
                })
            };
            await callback(txMock);
        });

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({
                bio: 'Teen bio',
                dateOfBirth: minorDate
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Verify calls to values() to find the one with privacy settings
        const calls = mockValues.mock.calls;
        // Looking for an object with profileVisibility: 'private'
        const privacyCall = calls.find(args => args[0].profileVisibility === 'private');
        expect(privacyCall).toBeDefined();
        expect(privacyCall[0].showRealName).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{ id: 'user-123', accountType: 'Individual' }]);

        mockDbTransaction.mockRejectedValue(new Error('DB Error'));

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 'Test' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('Internal Server Error');
    });

    it('should generate correct slug for organisation', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{
            id: 'user-123',
            accountType: 'Organisation',
            userType: 'admin',
            organisationName: 'Test Org & Co.'
        }]);

        let insertedOrg: any;
        const mockValues = vi.fn().mockImplementation((val) => {
            // Need to capture the first argument (val)
            // But if mockValues is called multiple times, we need to be careful.
            // In the route, org is inserted, then member.
            // We want the org insert.
            if (val && val.slug) {
                insertedOrg = val;
            }
            return {
                onConflictDoUpdate: vi.fn(),
                returning: vi.fn().mockResolvedValue([{ id: 'org-1' }])
            };
        });

        mockDbTransaction.mockImplementation(async (callback) => {
            const txMock = {
                insert: vi.fn().mockReturnValue({ values: mockValues }),
                update: vi.fn().mockReturnValue({
                    set: vi.fn().mockReturnValue({ where: vi.fn() })
                })
            };
            await callback(txMock);
        });

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({ bio: 'Org' }),
        });

        await POST(req);

        expect(insertedOrg.slug).toMatch(/^test-org-co-[a-z0-9]{8}$/);
    });
});
