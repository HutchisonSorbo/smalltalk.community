import { Resend } from 'resend';

// Initialize the Resend client only if the API key is available
// This prevents crashes during build time or in environments where email isn't configured
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Helper to check if email sending is configured
 */
export const isEmailConfigured = (): boolean => {
    return !!resend;
};

// CodeRabbit Audit Trigger
