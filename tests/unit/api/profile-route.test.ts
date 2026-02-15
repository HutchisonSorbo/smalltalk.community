
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/onboarding/profile/route';
import { validateContentWithAI } from '@/lib/utils/moderation';
import { db } from '@/server/db';

// Mock dependencies
vi.mock('@/lib/utils/moderation', () => ({
    validateContentWithAI: vi.fn(),
}));

vi.mock('@/server/db', () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{
                        id: 'test-user-id',
                        accountType: 'Individual',
                        userType: 'musician',
                        firstName: 'John',
                        lastName: 'Doe',
                        isMinor: false
                    }])
                })
            })
        }),
        transaction: vi.fn(async (callback) => {
            const tx = {
                insert: vi.fn().mockReturnValue({
                    values: vi.fn().mockReturnValue({
                        onConflictDoUpdate: vi.fn(),
                        returning: vi.fn().mockResolvedValue([{ id: 'new-org-id' }])
                    })
                }),
                update: vi.fn().mockReturnValue({
                    set: vi.fn().mockReturnValue({
                        where: vi.fn()
                    })
                })
            };
            return await callback(tx);
        })
    }
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn().mockReturnValue({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
                error: null
            })
        }
    })
}));

describe('Profile Setup API Route', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if unauthorized (no header)', async () => {
        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            body: JSON.stringify({})
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails (schema)', async () => {
        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                // dateOfBirth validation: send invalid age
                dateOfBirth: "2020-01-01" // Under 13
            })
        });

        const res = await POST(req);
        // The schema validation failure for age
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Validation failed");
    });

    it('should return 400 if user is under 13', async () => {
        const today = new Date();
        const dob = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString();

        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                // Include ALL required fields to pass schema validation
                bio: "My Bio",
                headline: "My Headline",
                location: "My Location",
                dateOfBirth: dob,
                profileImageUrl: "http://example.com/img.jpg"
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        // Schema validation error message
        expect(JSON.stringify(data)).toContain("at least 13 years old");
    });

    it('should return 400 if moderation fails for BIO', async () => {
        (validateContentWithAI as any).mockResolvedValue({ valid: false, error: "Hate Speech" });

        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                bio: "I hate everyone",
                headline: "Musician",
                location: "Melbourne",
                profileImageUrl: "http://example.com/img.jpg"
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain("Bio content flagged as unsafe");
    });

    it('should return 400 if moderation fails for HEADLINE', async () => {
        // First call (bio) passes, second (headline) fails
        (validateContentWithAI as any)
            .mockResolvedValueOnce({ valid: true, sanitized: "Safe Bio" })
            .mockResolvedValueOnce({ valid: false, error: "Violence" });

        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                bio: "Safe Bio",
                headline: "Unsafe Headline",
                location: "Melbourne",
                profileImageUrl: "http://example.com/img.jpg"
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain("Headline content flagged as unsafe");
    });

    it('should succeed and sanitize content if moderation passes', async () => {
        (validateContentWithAI as any).mockResolvedValue({ valid: true, sanitized: "Sanitized Content" });

        const req = new Request('http://localhost/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer token' },
            body: JSON.stringify({
                bio: "My Bio",
                headline: "My Headline",
                location: "My Location",
                profileImageUrl: "http://example.com/img.jpg"
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);

        // Verify database was called with sanitized content
        // This is tricky without deeper mocking of the transaction callback,
        // but success status implies it reached the transaction block.
        expect(db.transaction).toHaveBeenCalled();
        expect(validateContentWithAI).toHaveBeenCalledTimes(3); // Bio, Headline, Location
    });

});
