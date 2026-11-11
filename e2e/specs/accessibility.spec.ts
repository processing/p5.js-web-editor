import { test, expect } from '../fixtures';
import {
  formatAccessibilityViolations,
  runAccessibilityScan
} from '../helpers/accessibility';
import { dismissCookieBanner } from '../helpers/cookie-banner';

test.describe('accessibility', () => {
  test('login page has no initial-state accessibility violations', async ({
    page
  }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);

    await expect(page.locator('h2.form-container__title')).toHaveText('Log In');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    const results = await runAccessibilityScan(page);

    expect(
      results.violations,
      formatAccessibilityViolations(results.violations)
    ).toEqual([]);
  });

  test('login page has no accessibility violations after invalid credentials', async ({
    page
  }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);

    await page.locator('input[name="email"]').fill('unknown-user@example.test');
    await page.locator('input[name="password"]').fill('invalid-password');
    await page.getByRole('button', { name: 'Log In' }).click();

    const error = page.locator('.form-error[aria-live="assertive"]');

    await expect(error).toBeVisible();
    await expect(error).toHaveText('Invalid email or password.');

    const results = await runAccessibilityScan(page);

    expect(
      results.violations,
      formatAccessibilityViolations(results.violations)
    ).toEqual([]);
  });
});
