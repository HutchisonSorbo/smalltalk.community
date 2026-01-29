/**
 * Shared Moderation Pipeline
 * Provides a consistent three-stage pipeline for community-generated content:
 * 1. Keyword/Profanity Filter
 * 2. PII Redaction (Emails, Phones)
 * 3. HTML Sanitisation (XSS Prevention)
 */

const KEYWORD_PATTERNS = [
    /badword/gi, // Placeholder
    // Add real patterns here
];

const PII_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, // Basic regex
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
