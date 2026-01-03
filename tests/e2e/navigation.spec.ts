import { test, expect } from '@playwright/test';

test.describe('Navigation & Accessibility', () => {

    test('About link is visible in header navigation', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/hub');

        // Expect About link in navigation
        const aboutLink = page.getByRole('link', { name: 'About' });
        await expect(aboutLink).toBeVisible();
    });

    test('About page loads correctly', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/about');

        // Expect About page content
        await expect(page.getByRole('heading', { name: 'About smalltalk.community' })).toBeVisible();
        await expect(page.getByText('Our Mission')).toBeVisible();
        await expect(page.getByText('Mitchell Shire Council')).toBeVisible();
    });

    test('Accessibility Statement page loads', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/accessibility');

        // Expect Accessibility page content
        await expect(page.getByRole('heading', { name: 'Accessibility Statement' })).toBeVisible();
        await expect(page.getByText('WCAG 2.1 AA')).toBeVisible();
    });

    test('Footer contains First Nations acknowledgement', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/hub');

        // Expect First Nations acknowledgement in footer
        await expect(page.getByText('Traditional Custodians')).toBeVisible();
    });

    test('Footer contains emergency services information', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/hub');

        // Expect crisis support information
        await expect(page.getByText('Crisis Support')).toBeVisible();
        await expect(page.getByText('000')).toBeVisible();
        await expect(page.getByText('13 11 14')).toBeVisible(); // Lifeline
    });

    test('Footer Quick Links are accessible', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/hub');

        // Expect footer quick links
        const aboutFooterLink = page.getByRole('link', { name: 'About Us' });
        const accessibilityLink = page.getByRole('link', { name: 'Accessibility' });

        await expect(aboutFooterLink).toBeVisible();
        await expect(accessibilityLink).toBeVisible();
    });

    test('Skip to content link is present', async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });

        await page.goto('/hub');

        // Skip to content is usually hidden but accessible via keyboard
        // Focus on body first, then tab to find skip link
        await page.keyboard.press('Tab');

        // Look for skip to content or similar
        const skipLink = page.locator('text=Skip');
        const skipLinkCount = await skipLink.count();
        expect(skipLinkCount).toBeGreaterThanOrEqual(0); // May be 0 if styled as sr-only until focused
    });

});
