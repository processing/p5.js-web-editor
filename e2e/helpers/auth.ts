import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '../fixtures';
import { usernamePrefix, emailSuffix, password } from './env';

export interface TestUser {
  username: string;
  email: string;
}

/**
 * Creates a test user via a direct API call rather than the UI signup flow —
 * login doesn't require a verified email (see
 * server/controllers/user.controller/signup.ts), so this is a faster, more
 * focused way to get a test user for tests that aren't testing signup itself.
 */
export async function createTestUser(
  request: APIRequestContext
): Promise<TestUser> {
  const username = `${usernamePrefix()}${Date.now().toString(36)}`;
  const email = `${username}${emailSuffix()}`;

  const res = await request.post('/editor/signup', {
    headers: { 'Content-Type': 'application/json' },
    data: {
      username,
      email,
      password: password(),
      confirmPassword: password()
    }
  });

  if (!res.ok()) {
    throw new Error(
      `createTestUser: failed to create test user — ${res.status()}\n${await res.text()}`
    );
  }

  return { username, email };
}

/**
 * Logs in via the UI form. Assumes the page is already on /login.
 */
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', password());
  await expect(page.locator('button[type="submit"]')).toBeEnabled({
    timeout: 5_000
  });
  await page.click('button[type="submit"]');

  // Successful login redirects to the editor — a screen-visible signal
  // rather than asserting on the URL.
  await expect(page.locator('.editor-holder')).toBeVisible({
    timeout: 15_000
  });
}
