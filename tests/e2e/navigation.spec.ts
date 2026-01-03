import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Navigation & Accessibility', () => {

    // DRY: Set up route interceptor for all tests in this describe block
    test.beforeEach(async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });
    });

    test('About link is visible in header navigation', async ({ page }) => {
        await page.goto('/hub');

        // Expect About link in navigation
        const aboutLink = page.getByRole('link', { name: 'About' });
        await expect(aboutLink).toBeVisible();
    });

    test('About page loads correctly', async ({ page }) => {
        await page.goto('/about');

        // Expect About page content
        await expect(page.getByRole('heading', { name: 'About smalltalk.community' })).toBeVisible();
        await expect(page.getByText('Our Mission')).toBeVisible();
        await expect(page.getByText('Mitchell Shire Council')).toBeVisible();
    });

    test('Accessibility Statement page loads', async ({ page }) => {
        await page.goto('/accessibility');

        // Expect Accessibility page content
        await expect(page.getByRole('heading', { name: 'Accessibility Statement' })).toBeVisible();
        await expect(page.getByText('WCAG 2.1 AA')).toBeVisible();
    });

    test('Footer contains First Nations acknowledgement', async ({ page }) => {
        await page.goto('/hub');

        // Expect First Nations acknowledgement in footer
        await expect(page.getByText('Traditional Custodians')).toBeVisible();
    });

    test('Footer contains emergency services information', async ({ page }) => {
        await page.goto('/hub');

        // Expect crisis support information
        await expect(page.getByText('Crisis Support')).toBeVisible();
        await expect(page.getByText('000')).toBeVisible();
        await expect(page.getByText('13 11 14')).toBeVisible(); // Lifeline
    });

    test('Footer Quick Links are accessible', async ({ page }) => {
        await page.goto('/hub');

        // Expect footer quick links
        const aboutFooterLink = page.getByRole('link', { name: 'About Us' });
        const accessibilityLink = page.getByRole('link', { name: 'Accessibility' });

        await expect(aboutFooterLink).toBeVisible();
        await expect(accessibilityLink).toBeVisible();
    });

    test('Skip to content link is present and functional', async ({ page }) => {
        await page.goto('/hub');

        // Focus on body first, then tab to find skip link
        await page.keyboard.press('Tab');

        // Find skip link - it should become visible when focused
        const skipLink = page.locator('[href="#main-content"], [href="#content"], a:has-text("Skip")').first();

        // Assert skip link exists and is focusable
        const skipLinkExists = await skipLink.count() > 0;
        expect(skipLinkExists).toBe(true);

        if (skipLinkExists) {
            // Check that the skip link is in the viewport (visible when focused)
            const boundingBox = await skipLink.boundingBox();
            expect(boundingBox).not.toBeNull();
        }
    });

});

test.describe('Automated Accessibility Scans', () => {

    test.beforeEach(async ({ page }) => {
        await page.route('**/*', route => {
            const headers = { ...route.request().headers() };
            headers['host'] = 'smalltalk.community';
            route.continue({ headers });
        });
    });

    test('Hub page should have no accessibility violations', async ({ page }) => {
        await page.goto('/hub');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Accessibility page should have no accessibility violations', async ({ page }) => {
        await page.goto('/accessibility');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('About page should have no accessibility violations', async ({ page }) => {
        await page.goto('/about');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

});
