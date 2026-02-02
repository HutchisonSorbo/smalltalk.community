import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('CommunityOS Accessibility', () => {
    test('app launcher should have no accessibility violations', async ({ page }) => {
        await page.goto('/communityos');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('generic app view should be accessible', async ({ page }) => {
        // Test with the events app as a representative
        await page.goto('/communityos?app=events');
        await page.waitForLoadState('networkidle');

        // Check the main view
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);

        // Check the edit modal if possible
        const addBtn = page.getByRole('button', { name: /Add Event/i });
        if (await addBtn.isVisible()) {
            await addBtn.click();

            // Wait for modal to be visible and have an accessible name
            const modal = page.getByRole('dialog');
            await modal.waitFor({ state: 'visible' });

            const modalResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();
            expect(modalResults.violations).toEqual([]);
        }
    });
});
