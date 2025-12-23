import { test, expect } from '@playwright/test';

test.describe('Middleware Routing', () => {

    test('Host: vic.band (Default) -> Loads Vic Band App', async ({ page }) => {
        // Override headers for all requests
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'vic.band';
            route.continue({ headers });
        });

        await page.goto('/');

        // Expect to see Vic Band Landing text
        await expect(page.getByText('Where Victorian Music Connects')).toBeVisible();
        await expect(page.getByText('Join the largest verified community')).toBeVisible();
    });

    test('Host: smalltalk.community -> Loads Hub Landing', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/');

        // Expect to see Hub Landing text (The new branding)
        await expect(page.getByRole('heading', { name: 'smalltalk.community', exact: true })).toBeVisible();

        // Expect NOT to see Vic Band specific text
        await expect(page.getByText('Where Victorian Music Connects')).not.toBeVisible();
    });

    test('Host: smalltalk.community -> /login (Passthrough)', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/login');

        // Should see the Sign In form
        await expect(page.getByText('Sign in to your account')).toBeVisible();
    });

});
