import { createClient } from '../supabase-server';

/**
 * Redacts sensitive information from an object (e.g., query parameters).
 * Matches keys containing common sensitive tokens such as 'code', 'token', 'jwt', 'cookie', etc.
 * 
 * @param params The object to redact.
 * @returns A new object with sensitive keys replaced with '[REDACTED]'.
 */
function redactSensitiveData(params: Record<string, any> | null | undefined): Record<string, any> | null {
    if (!params) return null;
    const sensitiveKeys = [
        'code', 'token', 'password', 'secret', 'access_token', 'refresh_token',
        'api_key', 'apikey', 'session', 'session_id', 'sessionid', 'ssn',
        'auth', 'bearer', 'cookie', 'jwt', 'client_secret', 'private_key'
    ];
    const redacted = { ...params };

    for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            redacted[key] = '[REDACTED]';
        }
    }

    return redacted;
}

/**
 * Inserts a persistent audit log into the database using the Supabase service role to bypass RLS.
 * 
 * This utility ensures that security and system events are recorded even if the current user
 * lacks permissions, and it automatically redacts sensitive data from query parameters.
 * 
 * @param event The audit log event details.
 * @param event.eventType The category of the event: 'auth', 'security', or 'system'.
 * @param event.severity The importance of the event: 'info', 'warn', 'error', or 'critical'.
 * @param event.message A descriptive message about the event.
 * @param event.userId Optional ID of the user associated with the event.
 * @param event.ip Optional IP address of the requester.
 * @param event.safeQueryParams Optional object containing query parameters to be logged (will be redacted).
 * 
 * @returns {Promise<void>} Resolves when the insert is attempted. Errors are caught and logged to console.
 * 
 * @see {@link createClient} for the service role client used for RLS bypass.
 * @see {@link redactSensitiveData} for the redaction logic applied to safeQueryParams.
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
