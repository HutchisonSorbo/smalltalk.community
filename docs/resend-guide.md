# Resend Email Integration Guide

This project uses [Resend](https://resend.com) for sending transactional emails.

## Setup

### Environment Variables

Ensure your `.env` (local) or Vercel environment variables include:

```env
RESEND_API_KEY=re_123456789
```

> **Note:** The API key has been added to the Vercel project settings. For local development, you will need to add your own test key or the shared key to your local `.env` file if you intend to test email sending locally.

## Usage

We import the pre-configured client from `@/lib/resend`.

### Basic Example

```typescript
import { resend, isEmailConfigured } from '@/lib/resend';

export async function sendWelcomeEmail(email: string, name: string) {
  if (!isEmailConfigured()) {
    console.warn('Resend API key not found. Skipping email.');
    return;
  }

  try {
    const data = await resend!.emails.send({
      from: 'Smalltalk Community <onboarding@smalltalk.community>', // Use a verified domain
      to: email,
      subject: 'Welcome to the Community!',
      html: `<p>Hi ${name}, welcome to Smalltalk Community!</p>`,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
```

### React Email (Optional Future Step)

Resend works great with [React Email](https://react.email). If we decide to use complex templates, we should install `@react-email/components` and create templates in a `emails/` directory.

## Testing

You can verify the integration by calling an API route that triggers an email or by using a script.
Ensure you check the logs for success messages.
