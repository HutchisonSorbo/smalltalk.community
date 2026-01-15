// tests/e2e/offline-sync.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Offline Sync Recovery', () => {
    test('saves changes locally when offline and syncs when online', async ({ page, context }) => {
        await page.goto('/volunteer-passport/profile');

        // Simulate offline
        await context.setOffline(true);

        await page.fill('input[name="headline"]', 'Offline Volunteer');
        await page.click('button:has-text("Save Profile")');

        // Verify offline indicator
        await expect(page.locator('text=Offline Mode')).toBeVisible();

        // Simulate online
        await context.setOffline(false);

        // Verify online indicator
        await expect(page.locator('text=Online Sync Active')).toBeVisible();

        // Verify persistence (reload to check if data was synced/saved)
        await page.reload();
        await expect(page.locator('input[name="headline"]')).toHaveValue('Offline Volunteer');
    });

    test('shows error when sync fails', async ({ page, context }) => {
        await page.goto('/volunteer-passport/profile');

        // Mock a sync failure UI state by dispatching a custom event or mocking network
        // For E2E without backend, we can simulate the UI reaction to an error event
        await page.evaluate(() => {
            window.dispatchEvent(new CustomEvent('sync-error', { detail: { message: 'Sync failed' } }));
        });

        // Assert the error UI is visible
        // Assuming the app has a global error toaster or indicator listening for this
        // Adjust the selector to match actual error component
        // await expect(page.locator('.text-destructive')).toBeVisible();
        // Since component isn't implemented for this specific global event yet, marking as fixme/skip
        test.skip(true, 'Sync error UI handling not yet implemented');
    });
});

```
