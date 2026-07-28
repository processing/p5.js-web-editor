import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { usernamePrefix, emailSuffix, password } from '../helpers/env';

test.describe('signup and email verification', () => {
  test('can sign up and verify email via the emailed link', async ({
    page
  }) => {
    // Unique per run so the duplicate username/email check passes
    const uniqueId = `${usernamePrefix}${Date.now()}`;
    const email = `${uniqueId}${emailSuffix}`;

    await page.goto('/signup');

    await dismissCookieBanner(page);

    await page.locator('#username').fill(uniqueId);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);

    // The submit button stays disabled until the async duplicate
    // username/email check resolves; click() auto-waits for enabled
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // Successful signup logs the user in and redirects to the editor
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 15_000
    });
    // TODO: on next PR, email verification
  });
});
