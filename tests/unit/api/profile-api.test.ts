import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/onboarding/profile/route';

// Hoist mocks
const mocks = vi.hoisted(() => {
    return {
        getUser: vi.fn(),
        dbSelect: vi.fn(),
        dbInsert: vi.fn(),
        dbUpdate: vi.fn(),
        dbTransaction: vi.fn(),
        moderateContent: vi.fn(),
    };
});

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        auth: {
            getUser: mocks.getUser,
        },
    }),
}));

// Mock DB
vi.mock('@/server/db', () => ({
    db: {
        select: () => ({
            from: () => ({
                where: () => ({
                    limit: mocks.dbSelect,
                }),
            }),
        }),
        transaction: mocks.dbTransaction,
    },
}));

// Mock Moderation
vi.mock('@/lib/utils/moderation', () => ({
    moderateContent: mocks.moderateContent,
}));

// Mock Drizzle ORM helpers
vi.mock('drizzle-orm', async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        eq: vi.fn(),
    };
});

describe('Profile Onboarding API', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mocks
        mocks.getUser.mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
        });

        // Mock DB find user
        mocks.dbSelect.mockResolvedValue([{
            id: 'test-user-id',
            accountType: 'Individual',
            userType: 'musician',
            firstName: 'Test',
            lastName: 'User',
            isMinor: false
        }]);

        // Transaction mock implementation
        mocks.dbTransaction.mockImplementation(async (callback) => {
            const tx = {
                insert: () => ({
                    values: () => ({
                        onConflictDoUpdate: mocks.dbInsert,
                        returning: () => Promise.resolve([{id: 'org-id'}])
                    })
                }),
                update: () => ({ set: () => ({ where: mocks.dbUpdate }) }),
            };
            return callback(tx);
        });

        mocks.moderateContent.mockImplementation((text) => `moderated: ${text}`);
    });

    it('should verify moderation is called', async () => {
        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                bio: 'badword',
                headline: 'headline',
                location: 'location',
            })
        });

        const res = await POST(req);
        const json = await res.json();

        expect(json.success).toBe(true);

        expect(mocks.moderateContent).toHaveBeenCalledWith('badword');
        expect(mocks.moderateContent).toHaveBeenCalledWith('headline');
        expect(mocks.moderateContent).toHaveBeenCalledWith('location');
    });

    it('should enforce privacy for existing minors', async () => {
        // User is minor
        mocks.dbSelect.mockResolvedValue([{
            id: 'test-user-id',
            accountType: 'Individual',
            userType: 'musician',
            firstName: 'Test',
            lastName: 'User',
            isMinor: true // Existing minor
        }]);

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                bio: 'bio',
            })
        });

        await POST(req);

        // Check if dbInsert was called for privacy settings
        // In the route, userPrivacySettings insert calls onConflictDoUpdate
        expect(mocks.dbInsert).toHaveBeenCalled();
    });

    it('should enforce privacy for new minors (from DOB update)', async () => {
        // User is NOT currently minor
        mocks.dbSelect.mockResolvedValue([{
            id: 'test-user-id',
            accountType: 'Individual',
            userType: 'musician',
            firstName: 'Test',
            lastName: 'User',
            isMinor: false
        }]);

        // Update DOB to be 15 years old
        const today = new Date();
        const birthYear = today.getFullYear() - 15;
        const dob = `${birthYear}-01-01`;

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                dateOfBirth: dob,
                bio: 'bio',
            })
        });

        await POST(req);

        // Check if dbInsert was called for privacy settings
        expect(mocks.dbInsert).toHaveBeenCalled();
    });

    it('should return 400 for underage users', async () => {
        // Update DOB to be 10 years old
        const today = new Date();
        const birthYear = today.getFullYear() - 10;
        const dob = `${birthYear}-01-01`;

        const req = new Request('http://localhost/api/onboarding/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                dateOfBirth: dob,
            })
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        // The error message might be "Validation failed" with details
        if (json.error === 'Validation failed') {
             // Zod validation error
             expect(JSON.stringify(json.details)).toContain('at least 13 years old');
        } else {
             // Manual check error (if Zod passed but route check failed)
             expect(json.error).toContain('at least 13 years old');
        }
    });
});
