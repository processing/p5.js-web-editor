import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, loginAs, TestUser } from '../helpers/auth';

// Renders off state.ide.unsavedChanges (see UnsavedChangesIndicator.jsx).
const unsavedIndicator = (page: Page) =>
  page.getByRole('img', { name: 'Sketch has unsaved changes' });

// Covers the unsaved changes warning that appears when navigating away from the editor with unsaved changes.
test.describe('unsaved changes warning', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);

    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('function setup() {createCanvas(400, 400);}', {
      delay: 5
    });
    await expect(unsavedIndicator(page)).toBeVisible({ timeout: 10_000 });
  });

  const navigateToSketches = async (page: Page) => {
    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.locator('#account-sketches').click();
  };

  test('warns before navigating away from the editor with unsaved changes', async ({
    page
  }) => {
    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      return dialog.dismiss();
    });

    await navigateToSketches(page);

    expect(dialogMessage).toContain('You have unsaved changes');
  });

  test('blocks navigation if the warning is dismissed', async ({ page }) => {
    const urlBeforeNav = page.url();
    page.once('dialog', (dialog) => dialog.dismiss());

    await navigateToSketches(page);

    expect(page.url()).toBe(urlBeforeNav);
    await expect(page.locator('.editor-holder')).toBeVisible();
  });

  test('allows navigation if the warning is accepted', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept());

    await navigateToSketches(page);

    await expect(page).toHaveURL(new RegExp(`/${testUser.username}/sketches`), {
      timeout: 10_000
    });
  });

  test('does not appear when a sketch is saved before navigating', async ({
    page
  }) => {
    await page.locator('.editor-holder').click();
    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });
    await expect(unsavedIndicator(page)).toBeHidden();

    let dialogFired = false;
    page.once('dialog', (dialog) => {
      dialogFired = true;
      return dialog.accept();
    });

    await navigateToSketches(page);

    await expect(page).toHaveURL(new RegExp(`/${testUser.username}/sketches`), {
      timeout: 10_000
    });
    expect(dialogFired).toBe(false);
  });
});
