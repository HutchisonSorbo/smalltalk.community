import * as Sentry from "@sentry/nextjs";

/**
 * Registers runtime-specific instrumentation and monitoring hooks.
 */
export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      // Prevent New Relic crash if app name is missing
      if (!process.env.NEW_RELIC_APP_NAME) {
        console.warn('[instrumentation] NEW_RELIC_APP_NAME not set, defaulting to "smalltalk.community"');
        process.env.NEW_RELIC_APP_NAME = 'smalltalk.community';
      }

      await import("./sentry.server.config");
      await import("newrelic");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  } catch (error) {
    console.error("[instrumentation] Failed to initialise runtime instrumentation", error);
    throw error;
  }
}

/**
 * Captures and reports request errors to Sentry.
 */
export const onRequestError = Sentry.captureRequestError;