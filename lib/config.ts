/**
 * Centralized application configuration constants.
 * 
 * This module provides platform-wide configuration values that can be
 * used across the application. Values can be overridden via environment
 * variables where applicable.
 */

/**
 * Platform launch date - used for "all time" date range calculations.
 * Override via PLATFORM_LAUNCH_DATE env var (ISO date format: YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DD)
 * 
 * Both env var and fallback use UTC to ensure consistent behavior across timezones.
 */
function parsePlatformLaunchDate(): Date {
    const envValue = process.env.PLATFORM_LAUNCH_DATE;

    if (envValue) {
        // Parse as UTC - append Z if not present for timezone consistency
        const isoValue = envValue.includes("T") ? envValue : `${envValue}T00:00:00Z`;
        const parsed = new Date(isoValue);

        // Validate the parsed date
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }

        console.warn(
            `[Config] Invalid PLATFORM_LAUNCH_DATE: "${envValue}". Using fallback.`
        );
    }

    // Fallback: January 1, 2020 UTC
    return new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
}

export const PLATFORM_LAUNCH_DATE = parsePlatformLaunchDate();

/**
 * Default locale for date formatting throughout the application.
 * Override via DEFAULT_LOCALE env var.
 */
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? "en-AU";
