import { test, expect } from '@playwright/test';

test.describe('Middleware Routing', () => {

    test('Host: Local Music Network (Default) -> Loads Local Music Network App', async ({ page }) => {
        // Override headers for all requests
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'Local Music Network';
            route.continue({ headers });
        });

        await page.goto('/');

        // Expect to see Local Music Network Landing text
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

        // Expect NOT to see Local Music Network specific text
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
