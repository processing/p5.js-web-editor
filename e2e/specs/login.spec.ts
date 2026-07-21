import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { usernamePrefix, emailSuffix, password } from '../helpers/env';

test.describe('login', () => {
  const testUser = {
    username: `${usernamePrefix()}${Date.now().toString(36)}`,
    email: ''
  };
  testUser.email = `${testUser.username}${emailSuffix()}`;

  // Created via a direct API call rather than the UI signup flow login
  // doesn't require a verified email (see server/controllers/user.controller
  // /signup.ts), so this is a faster, more focused way to get a test user.
  test.beforeAll(async ({ request }) => {
    const res = await request.post('/editor/signup', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: testUser.username,
        email: testUser.email,
        password: password(),
        confirmPassword: password()
      }
    });

    if (!res.ok()) {
      throw new Error(
        `beforeAll: failed to create test user — ${res.status()}\n${await res.text()}`
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
  });

  test('existing user can log in with username and password', async ({
    page
  }) => {
    await expect(page.locator('h2.form-container__title')).toHaveText('Log In');

    // Passport's usernameField is 'email' the input accepts either
    // username or email as the value but the field name is 'email'
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', password());

    await expect(page.locator('button[type="submit"]')).toBeEnabled({
      timeout: 5_000
    });
    await page.click('button[type="submit"]');

    // Successful login redirects to the editor. A screen-visible signal
    // rather than asserting on the URL.
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 15_000
    });

    await expect(page.locator('a[href="/login"]')).toHaveCount(0, {
      timeout: 5_000
    });
    await expect(
      page.locator(`text=${testUser.username}`).first()
    ).toBeVisible({ timeout: 5_000 });

    // logout flow
    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-logout').click();
    await expect(page.locator('a[href="/login"]')).toBeVisible({
      timeout: 5_000
    });
    await expect(page.locator(`text=${testUser.username}`)).toHaveCount(0, {
      timeout: 5_000
    });
  });
});
