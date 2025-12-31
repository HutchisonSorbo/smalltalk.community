# Google OAuth Setup Guide

## Overview

To enable "Sign in with Google", you must configure the Google OAuth client in the Google Cloud Console and link it to your Supabase project.

## Prerequisites

- Access to the [Google Cloud Console](https://console.cloud.google.com/)
- a Supabase Project

## Configuration Steps

### 1. Google Cloud Console

1. Go to **APIs & Services > Credentials**.
2. Select your **OAuth 2.0 Client ID** (or create one).
3. Under **Authorized redirect URIs**, add the following URL:

    ```text
    https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
    ```

    *(Note: Replace `YOUR_PROJECT_ID` with your actual Supabase project ID found in your Supabase dashboard URL)*.
4. Save changes.

### 2. Supabase Dashboard

1. Go to **Authentication > Providers > Google**.
2. Ensure **Google** is enabled.
3. Paste the **Client ID** and **Client Secret** from Google Cloud Console.
4. Save changes.

## Troubleshooting

- **redirect_uri_mismatch**: Ensure the URI in Google Cloud Console matches exactly what Supabase expects (see step 1.3).
- **Invalid API Key**: Check your `.env` file for correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
