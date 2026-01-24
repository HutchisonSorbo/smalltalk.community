# Vercel BotId Protection Bypass for Testing

This project uses Vercel BotId to protect sensitive authentication routes (`/login`, `/forgot-password`, `/api/auth/callback`). To allow automated testing and AI agents to access these routes without being blocked, a protection bypass is configured.

## Configuration

1. **Environmental Variable**: Set `VERCEL_AUTOMATION_BYPASS_SECRET` in the Vercel Project Environment Variables.
2. **Secret Value**: Use a long, cryptographically secure string.

## Usage

When making automated requests (e.g., via Playwright, Cypress, or an AI agent like Antigravity), include the secret in either a header or a cookie.

### Method 1: Custom Header (Recommended)

Add the following header to your HTTP requests:

```http
x-vercel-protection-bypass: <YOUR_SECRET>
```

### Method 2: Cookie

Set the following cookie in your browser environment:

```http
Cookie: x-vercel-protection-bypass=<YOUR_SECRET>
```

## How it Works

Vercel Edge Network checks for the presence of this secret. If it matches the configured environment variable, the request is flagged as "Verified Automation," and all BotId/WAF challenges are bypassed for that request.

> [!WARNING]
> Never share this secret publicly. If compromised, rotate it immediately in the Vercel dashboard.
