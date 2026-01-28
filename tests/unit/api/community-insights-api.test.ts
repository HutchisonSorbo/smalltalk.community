/**
 * Unit tests for the Community Insights API route.
 *
 * These tests focus on request validation which can be reliably tested
 * without complex mock orchestration. Integration tests would be needed
 * for full authentication and AI generation testing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies with default implementations
vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            generateContent: vi.fn().mockResolvedValue({
                text: 'AI-generated community insights.',
            }),
        },
    })),
}));

vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn().mockImplementation(() =>
        Promise.resolve({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'test-user-id' } },
                    error: null,
                }),
            },
        })
    ),
}));

vi.mock('@/lib/communityos/tenant-context', () => ({
    verifyTenantAccess: vi.fn().mockResolvedValue({ hasAccess: true }),
}));

vi.mock('@/lib/abs-api', () => ({
    getABSDemographics: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/osm-api', () => ({
    getOSMAmenities: vi.fn().mockResolvedValue(null),
}));

// Import after mocks are set up
import { POST } from '@/app/api/community-insights/route';

describe('Community Insights API', () => {
    const originalEnv = process.env;
    const validTenantId = '00000000-0000-0000-0000-000000000000';

    beforeEach(() => {
        process.env = { ...originalEnv };
        vi.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Request Validation', () => {
        it('should return 400 for missing query parameter', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: JSON.stringify({ tenantId: validTenantId }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 for missing tenantId parameter', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: JSON.stringify({ query: 'What is the population?' }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 for invalid postcode format (not 4 digits)', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'What is the population?',
                    tenantId: validTenantId,
                    postcode: '123', // Invalid: must be exactly 4 digits
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 for postcode with letters', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: JSON.stringify({
                    query: 'What is the population?',
                    tenantId: validTenantId,
                    postcode: 'ABCD', // Invalid: must be digits only
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 for empty query string', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: JSON.stringify({
                    query: '',
                    tenantId: validTenantId,
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.error).toContain('Invalid request');
        });

        it('should return 400 for malformed JSON body', async () => {
            const request = new NextRequest('http://localhost/api/community-insights', {
                method: 'POST',
                body: 'not valid json',
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            // Should return 400 or 500 depending on error handling
            expect([400, 500]).toContain(response.status);
        });
    });
});