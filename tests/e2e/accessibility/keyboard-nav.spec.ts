// tests/accessibility/keyboard-nav.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
    test('header menu should be navigable via keyboard', async ({ page }) => {
        await page.goto('/');

        // Tab through the page
        await page.keyboard.press('Tab');

        // Verify focus on first link or button
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['A', 'BUTTON']).toContain(activeElement);
    });

    test('form fields should be reachable via tab', async ({ page }) => {
        await page.goto('/onboarding');

        await page.keyboard.press('Tab');
        const focusedName = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.name);
        expect(focusedName).toBeDefined();
    });
});
