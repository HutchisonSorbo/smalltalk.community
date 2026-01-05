/**
 * Centralized application configuration constants.
 * 
 * This module provides platform-wide configuration values that can be
 * used across the application. Values can be overridden via environment
 * variables where applicable.
 */

/**
 * Platform launch date - used for "all time" date range calculations.
 * Override via PLATFORM_LAUNCH_DATE env var (ISO date format: YYYY-MM-DD)
 */
export const PLATFORM_LAUNCH_DATE = process.env.PLATFORM_LAUNCH_DATE
    ? new Date(process.env.PLATFORM_LAUNCH_DATE)
    : new Date(2020, 0, 1); // January 1, 2020

/**
 * Default locale for date formatting throughout the application.
 * Override via DEFAULT_LOCALE env var.
 */
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? "en-AU";
