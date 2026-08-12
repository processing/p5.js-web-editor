import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { password } from '../helpers/test-user';
import { createTestUser, TestUser } from '../helpers/auth';

test.describe('login', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('existing user can log in with username and password', async ({
    page
  }) => {
    await page.locator('a[href="/login"]').click();

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
