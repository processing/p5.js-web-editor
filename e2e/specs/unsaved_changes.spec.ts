import type { Dialog, Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, loginAs, TestUser } from '../helpers/auth';

/**
 * Renders off state.ide.unsavedChanges (see UnsavedChangesIndicator.jsx) —
 * the same state that gates both the <Prompt> and the beforeunload listener.
 */
const unsavedIndicator = (page: Page) =>
  page.getByRole('img', { name: 'Sketch has unsaved changes' });

test.describe('unsaved changes warning', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);
  });

  // Covers the <Prompt> in IDEView.jsx, which guards in-app navigation and
  // shows the app's own message via window.confirm(). The sibling
  // beforeunload handler (full page unload, e.g. reload/close) is a separate
  // guard on the same state, not covered here.
  // Note the Prompt deliberately allows /login, /signup and /feedback through
  // without warning, so this navigates to the user's sketches instead.
  test('warns before navigating away from the editor with unsaved changes', async ({
    page
  }) => {
    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('function setup() {createCanvas(400, 400);}', {
      delay: 5
    });

    // Wait for the app to actually register the unsaved change rather than
    // sleeping past CodeMirror's 1s debounce. This indicator renders off
    // state.ide.unsavedChanges — the same state that gates both guards.
    await expect(unsavedIndicator(page)).toBeVisible({ timeout: 10_000 });

    // Dismissing the warning should keep us in the editor
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.locator('#account-sketches').click();

    await expect
      .poll(() => dialogMessage)
      .toContain('You have unsaved changes');
    await expect(editor).toBeVisible();

    await page.waitForTimeout(1000);

    // Accepting it should let the navigation through
    page.once('dialog', (dialog) => dialog.accept());

    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.locator('#account-sketches').click();

    await expect(page).toHaveURL(new RegExp(`/${testUser.username}/sketches`), {
      timeout: 10_000
    });
  });
});
