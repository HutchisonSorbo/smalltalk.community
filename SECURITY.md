# Security Policy

## Supported Versions

The following versions of the project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

Please do **NOT** open a public issue on GitHub. Instead, report vulnerabilities via:

1. **Email**: Contact the maintainers directly (provide email if applicable, or use a secure channel).
2. **Private Disclosure**: If using a platform that supports it (like GitHub Security Advisories), use the private reporting feature.

### Information to Include

- Description of the vulnerability.
- Steps to reproduce (POC).
- Potential impact.
- Affected components/versions.

### What to Expect

- We will acknowledge receipt of your report within 48 hours.
- We will provide an estimated timeline for a fix.
- We will notify you when the fix is released.

## Security Best Practices in This Codebase

- **Row Level Security (RLS)**: All database tables must have RLS enabled and policies defined. Critical tables (e.g., Announcements) are restricted to admin roles.
- **Authentication**: All protected routes must verify the user session server-side.
- **Headers**: Strict `Content-Security-Policy`, `HSTS`, and other security headers are enforced in `next.config.mjs`.
- **Rate Limiting**: Critical actions (e.g., file uploads) are rate-limited per user.
- **Input Validation**: All API inputs are validated using `zod` schemas.
- **Secrets**: No secrets (API keys, tokens) should be hardcoded. Use environment variables.
- **Dependencies**: Regular `npm audit` checks are recommended.

## XSS Prevention Rules

1. **Contextual Escaping**: React escapes content by default. Do not bypass this with `dangerouslySetInnerHTML` unless verifying the content source is trusted (e.g., static configuration).
2. **URL Handling**:
    - Use `safeUrl()` for any dynamic `href` or `src`.
    - Validate that protocols are `http:` or `https:` only.
    - Never allow `javascript:` or `data:` URIs from user input.
3. **Content Security Policy (CSP)**: Maintain strict CSP headers in `next.config.mjs` to block unauthorized scripts and styles.
4. **Input Validation**: Validate all incoming data against strict schemas (Zod). Strip dangerous tags if rich text is required (use a sanitizer library like `dompurify`).
