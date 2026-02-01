
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

// Mock the schemas to avoid drizzle-zod dependencies causing issues with mocked schema
vi.mock('@/lib/onboarding-schemas', () => {
    const { z } = require('zod');
    return {
        profileSetupSchema: z.object({
            bio: z.string().optional(),
            headline: z.string().optional(),
            dateOfBirth: z.string().optional(), // simplified
            location: z.string().optional(),
            profileImageUrl: z.string().optional(),
        })
    };
});

// Mock schema tables to be simple objects that drizzle-orm eq() can handle
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

        // Reset chainable returns just in case
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
        const json = await res.json();
        expect(json.error).toBe('Unauthorised');
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

    it('should return 400 for validation failure (invalid body)', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({
                // Missing required fields or invalid types
                bio: 123
            }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Validation failed');
    });

    it('should return 404 if user not found in database', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([]); // No user found

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({
                bio: 'Test bio',
                headline: 'Test headline'
            }),
        });
        const res = await POST(req);
        expect(res.status).toBe(404);
        expect(json => json.error === 'User not found');
    });

    it('should return 400 if user is under 13', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{ id: 'user-123', accountType: 'Individual', userType: 'musician' }]);

        const today = new Date();
        const under13Date = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString().split('T')[0];

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { Authorization: 'Bearer valid-token' },
            body: JSON.stringify({
                bio: 'Kid',
                dateOfBirth: under13Date
            }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toContain('must be at least 13 years old');
    });

    it('should succeed and moderate content for valid Musician user', async () => {
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
            body: JSON.stringify({
                bio: 'Bad bio content',
                headline: 'Bad headline',
                dateOfBirth: '2000-01-01' // Adult
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Check if moderation was called
        const { moderateContent } = await import('@/lib/utils/moderation');
        expect(moderateContent).toHaveBeenCalledWith('Bad bio content');
        expect(moderateContent).toHaveBeenCalledWith('Bad headline');
    });

    it('should succeed and moderate content for valid Professional user', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{
            id: 'user-123',
            accountType: 'Individual',
            userType: 'professional',
            firstName: 'Pro',
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
            body: JSON.stringify({
                bio: 'Pro bio content',
                headline: 'Pro headline',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        const { moderateContent } = await import('@/lib/utils/moderation');
        expect(moderateContent).toHaveBeenCalledWith('Pro bio content');
    });

    it('should succeed and moderate content for valid Organisation user', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
        mockDbLimit.mockResolvedValue([{
            id: 'user-123',
            accountType: 'Organisation',
            userType: 'admin',
            organisationName: 'Test Org'
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
            body: JSON.stringify({
                bio: 'Org bio content',
                headline: 'Org headline',
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        const { moderateContent } = await import('@/lib/utils/moderation');
        expect(moderateContent).toHaveBeenCalledWith('Org bio content');
    });
});
