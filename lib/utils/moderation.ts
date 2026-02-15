/**
 * Shared Moderation Pipeline
 * Provides a consistent three-stage pipeline for community-generated content:
 * 1. Keyword/Profanity Filter
 * 2. PII Redaction (Emails, Phones)
 * 3. HTML Sanitisation (XSS Prevention)
 */

import { getAIClient, SAFETY_SETTINGS, AI_MODEL_CONFIG } from '../ai-config';

const KEYWORD_PATTERNS = [
    /badword/gi, // Placeholder
    // Add real patterns here
];

const PII_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Enhanced regex for Australian mobile (04xx xxx xxx) and landlines ((0x) xxxx xxxx) + international
    phone: /(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}/g,
};

/**
 * Stage 1: Filter forbidden keywords
 */
function filterKeywords(text: string): string {
    let result = text;
    KEYWORD_PATTERNS.forEach(pattern => {
        result = result.replace(pattern, "[sanitised]");
    });
    return result;
}

/**
 * Stage 2: Redact PII
 */
function redactPII(text: string): string {
    return text
        .replace(PII_PATTERNS.email, "[email redacted]")
        .replace(PII_PATTERNS.phone, "[phone redacted]");
}

/**
 * Stage 3: HTML Sanitisation (prevent XSS)
 */
function sanitizeHTML(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Master moderation function
 */
export function moderateContent(text: string | null | undefined): string {
    if (!text) return "";

    // 1. Initial trim
    let result = text.trim();

    // 2. Keyword Filtering
    result = filterKeywords(result);

    // 3. PII Redaction
    result = redactPII(result);

    // 4. HTML Sanitisation
    result = sanitizeHTML(result);

    return result;
}

/**
 * Lightweight version for display-only (no PII redaction)
 */
export function sanitizeDisplay(text: string | null | undefined): string {
    if (!text) return "";
    return sanitizeHTML(text.trim());
}

/**
 * Advanced moderation using AI (Google Gemini)
 * checks for safety relative to age group.
 */
export async function validateContentWithAI(
    text: string | null | undefined,
    isMinor: boolean = false
): Promise<{ valid: boolean; sanitized: string; error?: string }> {
    // 1. Run standard sync moderation first (Keywords, PII, HTML)
    const sanitized = moderateContent(text);

    // If empty after sanitization, it's valid (or empty)
    if (!sanitized) return { valid: true, sanitized: "" };

    const client = getAIClient();
    if (!client) {
        console.warn("AI Client not configured, skipping AI moderation check.");
        return { valid: true, sanitized };
    }

    try {
        const prompt = `
        You are a content safety moderator for a community platform that includes teenagers (13-17) and adults.
        Your task is to evaluate the following text for safety.
        Target Audience: ${isMinor ? "Teenagers (13-17)" : "General Audience (Adults)"}.

        Text to evaluate: "${sanitized}"

        Rules:
        1. Flag hate speech, harassment, sexual content, self-harm, or violence.
        2. For teenagers, be stricter about inappropriate themes.
        3. If unsafe, respond starting with "UNSAFE: " followed by a brief reason.
        4. If safe, respond with "SAFE".

        Response:
        `;

        const result = await client.models.generateContent({
            model: AI_MODEL_CONFIG.model,
            config: {
                safetySettings: isMinor ? SAFETY_SETTINGS.teen : SAFETY_SETTINGS.adult,
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (responseText.trim().toUpperCase().startsWith("UNSAFE")) {
            return { valid: false, sanitized, error: responseText.trim().substring(8) };
        }

        return { valid: true, sanitized };

    } catch (error) {
        console.error("AI Moderation failed:", error);
        // Fail open to prevent blocking users during AI service outages, but log heavily.
        return { valid: true, sanitized };
    }
}
