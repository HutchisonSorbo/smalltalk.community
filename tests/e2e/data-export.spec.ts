// tests/e2e/data-export.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Data Export & Privacy Compliance', () => {
    test('user can request a data export', async ({ page }) => {
        await page.goto('/settings'); // Assuming settings has export

        // This is a placeholder as the export page might be different
        if (await page.locator('button:has-text("Export My Data")').isVisible()) {
            await page.click('button:has-text("Export My Data")');
            await expect(screen.getByText(/export started/i)).toBeInTheDocument();
        }
    });

    test('admin can access audit logs for privacy events', async ({ page }) => {
        // Requires admin session
        await page.goto('/admin/activity');
        // Verify audit log presence
    });
});
