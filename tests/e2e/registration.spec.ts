import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {

    test('should show registration form when switching to sign up mode', async ({ page }) => {
        await page.goto('/login');

        // Click to switch to sign up
        await page.getByRole('button', { name: /Don't have an account/i }).click();

        // Should show additional fields for registration
        await expect(page.getByText('Create an account')).toBeVisible();
        await expect(page.getByLabel('Account Type')).toBeVisible();
    });

    test('should show date of birth field for Individual account type', async ({ page }) => {
        await page.goto('/login');

        // Switch to sign up
        await page.getByRole('button', { name: /Don't have an account/i }).click();

        // Should show DOB for Individual (default)
        await expect(page.getByLabel('Date of Birth')).toBeVisible();
    });

    test('should show age warning for users under 18', async ({ page }) => {
        await page.goto('/login');

        // Switch to sign up
        await page.getByRole('button', { name: /Don't have an account/i }).click();

        // Enter a date that makes user under 18
        const today = new Date();
        const underageYear = today.getFullYear() - 15;
        const dateValue = `${underageYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        await page.getByLabel('Date of Birth').fill(dateValue);

        // Should show age warning dialog
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByText(/under 18/i)).toBeVisible();
    });

    test('should hide date of birth field for Business account type', async ({ page }) => {
        await page.goto('/login');

        // Switch to sign up
        await page.getByRole('button', { name: /Don't have an account/i }).click();

        // Change to Business
        await page.getByLabel('Account Type').selectOption('Business');

        // DOB should not be visible for business
        await expect(page.getByLabel('Date of Birth')).not.toBeVisible();

        // Organisation name should be visible
        await expect(page.getByLabel('Organisation Name')).toBeVisible();
    });

    test('should show other account type input when Other is selected', async ({ page }) => {
        await page.goto('/login');

        // Switch to sign up
        await page.getByRole('button', { name: /Don't have an account/i }).click();

        // Change to Other
        await page.getByLabel('Account Type').selectOption('Other');

        // Should show text input for specifying type
        await expect(page.getByPlaceholder('Please specify...')).toBeVisible();
    });

    test('should have captcha verification available', async ({ page }) => {
        await page.goto('/login');

        // Look for Turnstile captcha or its container
        // Note: Turnstile may not render in test environment, but the container should exist
        await expect(page.locator('text=Not seeing the security check?')).toBeVisible();
    });

    test('should have forgot password link on sign in form', async ({ page }) => {
        await page.goto('/login');

        // Should show forgot password link
        await expect(page.getByRole('button', { name: 'Forgot?' })).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('/login');

        // Click forgot password
        await page.getByRole('button', { name: 'Forgot?' }).click();

        // Should navigate to forgot password page
        await expect(page).toHaveURL(/forgot-password/);
    });

});
