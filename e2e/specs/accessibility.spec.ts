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
});
