
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateContentWithAI, moderateContent, sanitizeDisplay } from '@/lib/utils/moderation';
import { getAIClient, SAFETY_SETTINGS, AI_MODEL_CONFIG } from '@/lib/ai-config';

// Mock dependencies
vi.mock('@/lib/ai-config', () => ({
    getAIClient: vi.fn(),
    SAFETY_SETTINGS: { teen: 'teen-settings', adult: 'adult-settings' },
    AI_MODEL_CONFIG: { model: 'test-model' }
}));

describe('Content Moderation Utility', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('moderateContent (Synchronous)', () => {
        it('should return empty string for null/undefined', () => {
            expect(moderateContent(null)).toBe("");
            expect(moderateContent(undefined)).toBe("");
        });

        it('should redact PII (email)', () => {
            const input = "Contact me at test@example.com please.";
            const output = moderateContent(input);
            expect(output).toContain("[email redacted]");
            expect(output).not.toContain("test@example.com");
        });

        it('should redact PII (Australian mobile)', () => {
            const input = "Call 0412 345 678 now.";
            const output = moderateContent(input);
            expect(output).toContain("[phone redacted]");
            expect(output).not.toContain("0412 345 678");
        });

        it('should sanitise HTML', () => {
            const input = "<script>alert('xss')</script>";
            const output = moderateContent(input);
            expect(output).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
        });
    });

    describe('sanitizeDisplay (Synchronous)', () => {
        it('should return empty string for null/undefined', () => {
            expect(sanitizeDisplay(null)).toBe("");
            expect(sanitizeDisplay(undefined)).toBe("");
        });

        it('should sanitise HTML but preserve PII', () => {
            const input = "Call 0412 345 678 <script>alert('xss')</script>";
            const output = sanitizeDisplay(input);
            expect(output).toContain("0412 345 678"); // PII preserved
            expect(output).toContain("&lt;script&gt;"); // HTML sanitized
        });
    });

    describe('validateContentWithAI (Async)', () => {

        it('should return valid immediately if content is empty', async () => {
            const result = await validateContentWithAI("   ", false);
            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe("");
            expect(getAIClient).not.toHaveBeenCalled();
        });

        it('should fail open (return valid) if AI client is not configured', async () => {
            (getAIClient as any).mockReturnValue(null);

            const result = await validateContentWithAI("Some text", false);

            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe("Some text");
        });

        it('should return valid if AI says SAFE', async () => {
            const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [{
                    content: { parts: [{ text: "SAFE" }] }
                }]
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            const result = await validateContentWithAI("I love dogs", false);

            expect(result.valid).toBe(true);
            expect(result.sanitized).toBe("I love dogs");
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('should return invalid if AI says UNSAFE', async () => {
            const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [{
                    content: { parts: [{ text: "UNSAFE: Hate Speech" }] }
                }]
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            const result = await validateContentWithAI("I hate everyone", false);

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Hate Speech");
        });

        it('should use correct safety settings for minors', async () => {
            const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [{ content: { parts: [{ text: "SAFE" }] } }]
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            await validateContentWithAI("Test text", true); // isMinor = true

            expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                config: { safetySettings: 'teen-settings' }
            }));
        });

        it('should use correct safety settings for adults', async () => {
            const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [{ content: { parts: [{ text: "SAFE" }] } }]
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            await validateContentWithAI("Test text", false); // isMinor = false

            expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                config: { safetySettings: 'adult-settings' }
            }));
        });

        it('should fail open (return valid) if AI throws error', async () => {
            const mockGenerateContent = vi.fn().mockRejectedValue(new Error("API Error"));

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            // Spy on console.error to suppress output during test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const result = await validateContentWithAI("Some text", false);

            expect(result.valid).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should perform PII redaction before AI check', async () => {
            const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [{ content: { parts: [{ text: "SAFE" }] } }]
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            const input = "Call me at 0412 345 678";
            const result = await validateContentWithAI(input, false);

            expect(result.valid).toBe(true);
            expect(result.sanitized).toContain("[phone redacted]");

            // Verify AI received redacted text
            const callArgs = mockGenerateContent.mock.calls[0][0];
            const promptText = callArgs.contents[0].parts[0].text;
            expect(promptText).toContain("[phone redacted]");
            expect(promptText).not.toContain("0412 345 678");
        });

        it('should handle malformed AI response gracefully', async () => {
             const mockGenerateContent = vi.fn().mockResolvedValue({
                candidates: [] // No candidates
            });

            (getAIClient as any).mockReturnValue({
                models: { generateContent: mockGenerateContent }
            });

            const result = await validateContentWithAI("Text", false);

            expect(result.valid).toBe(true); // Fails open
            expect(result.sanitized).toBe("Text");
        });
    });
});
