import * as Sentry from "@sentry/nextjs";

/**
 * Registers runtime-specific instrumentation and monitoring hooks.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Prevent New Relic crash if app name is missing
    if (!process.env.NEW_RELIC_APP_NAME) {
      process.env.NEW_RELIC_APP_NAME = 'smalltalk.community';
    }

    await import("./sentry.server.config");
    await import("newrelic");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;