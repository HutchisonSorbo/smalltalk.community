import { createClient } from '../supabase-server';

/**
 * Redacts sensitive information from an object (e.g., query parameters).
 * @param params The object to redact.
 * @returns A new object with sensitive keys redacted.
 */
function redactSensitiveData(params: Record<string, any> | null | undefined): Record<string, any> | null {
    if (!params) return null;
    const sensitiveKeys = ['code', 'token', 'password', 'secret', 'access_token', 'refresh_token'];
    const redacted = { ...params };

    for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            redacted[key] = '[REDACTED]';
        }
    }

    return redacted;
}

/**
 * Inserts a persistent audit log into the database using the service role to bypass RLS.
 * @param event The audit log event details.
 */
export async function insertAuditLog(event: {
    eventType: 'auth' | 'security' | 'system';
    severity: 'info' | 'warn' | 'error' | 'critical';
    message: string;
    userId?: string;
    ip?: string;
    safeQueryParams?: Record<string, any>;
}) {
    try {
        const supabase = await createClient(true); // Always use service role for audit logs

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                event_type: event.eventType,
                severity: event.severity,
                message: event.message,
                user_id: event.userId,
                ip: event.ip,
                safe_query_params: redactSensitiveData(event.safeQueryParams),
            });

        if (error) {
            console.error(`[CRITICAL] Failed to insert audit log: ${error.message}`, event);
        }
    } catch (err) {
        console.error(`[CRITICAL] Error in insertAuditLog:`, err, event);
    }
}
