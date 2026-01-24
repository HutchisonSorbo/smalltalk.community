// tests/e2e/member-onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Member Onboarding Journey', () => {
    test('completes full onboarding flow successfully', async ({ page }) => {
        await page.goto('/onboarding');

        // Fill basic details
        await page.fill('input[name="firstName"]', 'Jane');
        await page.fill('input[name="lastName"]', 'Smith');
        await page.fill('input[name="email"]', 'jane@example.com');

        await page.click('button:has-text("Next")');

        // Privacy Consent
        await page.check('input[name="privacyConsent"]');
        await page.click('button:has-text("Submit")');

        // Should reach confirmation
        await expect(page).toHaveURL(/\/onboarding\/welcome/);
        await expect(page.locator('h1')).toContainText(/welcome/i);
    });
});
