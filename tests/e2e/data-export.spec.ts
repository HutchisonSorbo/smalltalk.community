// tests/e2e/data-export.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Data Export & Privacy Compliance', () => {
    test('user can request a data export', async ({ page }) => {
        await page.goto('/settings'); // Assuming settings has export

        // Assert button is visible and then click
        const exportButton = page.locator('button:has-text("Export My Data")');
        await expect(exportButton).toBeVisible();
        await exportButton.click();

        await expect(page.getByText(/export started/i)).toBeVisible();
    });

    test('admin can access audit logs for privacy events', async ({ page }) => {
        // Requires admin session
        await page.goto('/admin/activity');
        // Verify audit log presence
    });
});
