# Vercel Deployment and Supabase Guide

## Node.js Version Configuration

> [!IMPORTANT]
> The Node.js version is controlled in **two places** that must be kept in sync:
>
> - `package.json` → `"engines": { "node": "22.x" }` (takes precedence)
> - Vercel Project Settings → General → Node.js Version

### Current Configuration

| Setting                  | Value  | Purpose                                          |
|--------------------------|--------|--------------------------------------------------|
| `package.json` engines   | `22.x` | Primary source of truth, enforced during builds  |
| Vercel Project Settings  | `22.x` | Should match package.json to avoid warnings      |

### Keeping Versions in Sync

If you update the Node.js version:

1. **Update `package.json`** first:

   ```json
   "engines": {
     "node": "22.x"
   }
   ```

2. **Update Vercel Project Settings**:
   - Go to Vercel Dashboard → Project → Settings → General
   - Scroll to "Node.js Version"
   - Select the matching version (e.g., `22.x`)
   - **Trigger a new deployment** for changes to take effect

> [!NOTE]
> The `package.json` engines field **overrides** Vercel Project Settings.
> If they don't match, you'll see a warning but the build will use the `package.json` value.

---

## 1. Pushing Changes to Vercel

Vercel automatically deploys when you push to the `main` branch of your GitHub repository.

### Step-by-Step

1. **Commit your changes** (I will do this).
2. **Push to GitHub**:

    ```bash
    git push origin main
    ```

3. **Monitor Deployment**:
    - Go to your Vercel Dashboard.
    - You should see a new "Building" deployment.
    - If it fails, check the logs.

## 2. Syncing Database Schema (Supabase)

The `drizzle-kit push` command updates your live Supabase database to match your code schema. This must be done whenever you change `schema.ts`.

### Option A: Run Locally (Recommended)

You need the `DATABASE_URL` environment variable set locally (in `.env`).

```bash
npm run db:push
```

*Note: You may be prompted to confirm changes. Press Enter to confirm.*

### Option B: Run via Vercel (Advanced)

You can configure the "Build Command" in Vercel settings to run this, but it's risky for production databases. It's better to run migrations/pushes manually from your local machine to control the process.

## 3. Configuring Supabase Auth

For the Sign-Up flow to work with the new fixes:

1. **Go to Supabase Dashboard**.
2. Navigate to **Authentication** -> **URL Configuration**.
3. Under **Redirect URLs**, add the following:
    - `https://your-vercel-domain.com/api/auth/callback` (Production)
    - `http://localhost:3000/api/auth/callback` (Local Development)
4. Click **Save**.

## 4. Debugging Emails

If emails are still not arriving:

1. Open the Browser Console (F12) on the Login page.
2. Attempt Sign Up.
3. Check the Console Logs for "Sign up result".
    - If `data.user` is present and `identities` is not empty, Supabase *tried* to send the email.
    - If `data.user` is present but `identities` is empty, the user might already exist.
    - Check the `error` object if present.
4. Check Supabase **Authentication** -> **Logs** (SMTP logs) to see if emails are bouncing or hitting limits.
