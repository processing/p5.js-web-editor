import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, TestUser, loginAs } from '../helpers/auth';

test.describe.serial('collection lifecycle', () => {
  let testUser: TestUser;
  let page: Page;
  let sketchName1: string;
  let sketchName2: string;
  let collectionName: string;

  test.beforeAll(async ({ browser, request }) => {
    testUser = await createTestUser(request);

    // A single page shared across this describe.serial block (instead of the
    // per-test `page` fixture) so each test below can build on the previous
    // one's state (same sketch/collection, still logged in).
    page = await browser.newPage();
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ = () => {};
    });

    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('can create a collection', async () => {
    // Save the initial sketch
    const editor = page.locator('.editor-holder');
    await editor.click();

    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    // Get the sketch name. ProjectName.jsx gives this button a static
    // "Edit sketch name" aria-label (unlike the collection name editor,
    // which uses the dynamic default), so we search by that and read the
    // sketch name from its text content instead.
    const name = await page
      .getByRole('button', { name: 'Edit sketch name' })
      .textContent();
    expect(name).toBeTruthy();
    sketchName1 = name ?? '';

    // Open the collections page
    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.getByRole('menuitem', { name: 'My Collections' }).click();

    await expect(page.getByText('No Collections.')).toBeVisible({
      timeout: 5_000
    });

    // Create a new collection
    await page
      .getByRole('button', { name: 'Create collection', exact: true })
      .click();

    collectionName = await page
      .getByRole('textbox', { name: 'name' })
      .inputValue();
    // The form's submit button has the same accessible name as the toolbar
    // button that opened it (still present behind the overlay), so the role
    // query is scoped to the form itself to disambiguate.
    await page
      .locator('form')
      .getByRole('button', { name: 'Create collection', exact: true })
      .click();

    // Confirm we're on the new collection page
    await expect(
      page.getByRole('button', { name: collectionName })
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('No sketches in collection')).toBeVisible();
  });

  test('can add sketches to a collection', async () => {
    await page.getByRole('button', { name: 'Add Sketch', exact: true }).click();

    await expect(page.getByText(sketchName1)).toBeVisible({ timeout: 5_000 });

    await page
      .getByRole('button', { name: 'Add to collection', exact: true })
      .first()
      .click();

    await page
      .getByRole('button', { name: 'Close Add Sketch overlay' })
      .click();

    // Confirm the sketch is in the collection
    const sketchesTable = page.getByRole('table');
    await expect(
      sketchesTable.getByRole('link', { name: sketchName1 })
    ).toBeVisible({ timeout: 5_000 });

    await sketchesTable.getByRole('link', { name: sketchName1 }).click();

    // Create a new sketch to add to the collection
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 5_000
    });

    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'New' }).click();

    const editor = page.locator('.editor-holder');
    await editor.click();

    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    const name = await page
      .getByRole('button', { name: 'Edit sketch name' })
      .textContent();
    expect(name).toBeTruthy();
    sketchName2 = name ?? '';

    // Add the new sketch to the collection
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page
      .getByRole('menuitem', { name: 'Add to Collection', exact: true })
      .click();

    await expect(page.getByText(collectionName)).toBeVisible({
      timeout: 5_000
    });

    await page
      .getByRole('button', { name: 'Add to collection', exact: true })
      .first()
      .click();

    // The item's toggle flips to "Remove from collection" once the add lands.
    // Asserting on that rather than the toast, which only shows for 1500ms.
    await expect(
      page.getByRole('button', { name: 'Remove from collection', exact: true })
    ).toBeVisible({ timeout: 10_000 });

    // Close the overlay
    await page
      .getByRole('button', { name: 'Close Add to collection overlay' })
      .click();

    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.getByRole('menuitem', { name: 'My Collections' }).click();

    // Verify the collection has 2 sketches
    await expect(
      page.getByRole('row', { name: collectionName }).getByRole('cell').nth(2)
    ).toHaveText('2');
  });

  test('can rename a collection', async () => {
    // Open the dropdown
    await page
      .getByRole('button', { name: 'Toggle Open/Close collection options' })
      .first()
      .click();

    // Click Rename
    await page.getByRole('menuitem').filter({ hasText: 'Rename' }).click();

    // The collection name becomes an input — fill it. No aria-label on this
    // one, so it's scoped to the table to disambiguate from the page's
    // "Search collections..." textbox.
    const renameInput = page.getByRole('table').getByRole('textbox');
    await renameInput.click();
    await renameInput.fill('renamed-collection');
    await renameInput.press('Enter');

    collectionName = 'renamed-collection';

    // Verify the new name appears
    await expect(page.getByRole('link', { name: collectionName })).toBeVisible({
      timeout: 5_000
    });

    await page.getByRole('link', { name: collectionName }).click();

    // Both sketches should still be in the collection after the rename
    const sketchesTable = page.getByRole('table');
    await expect(
      sketchesTable.getByRole('link', { name: sketchName1 })
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      sketchesTable.getByRole('link', { name: sketchName2 })
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('2 sketches')).toBeVisible();
  });

  test('can remove a sketch from a collection', async () => {
    await page.getByRole('link', { name: sketchName1 }).click();

    // Confirm we're back in the editor and the sketch is loaded
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 5_000
    });
    await expect(
      page.getByRole('button', { name: 'Edit sketch name' })
    ).toHaveText(sketchName1, { timeout: 5_000 });

    await page.getByRole('menuitem', { name: 'File' }).click();
    await page
      .getByRole('menuitem', { name: 'Add to Collection', exact: true })
      .click();

    await expect(page.getByText(collectionName)).toBeVisible({
      timeout: 5_000
    });

    await page
      .getByRole('button', { name: 'Remove from collection', exact: true })
      .first()
      .click();

    // The toggle flips back to "Add to collection" once the removal lands.
    // Asserting on that rather than the toast, which only shows for 1500ms.
    await expect(
      page.getByRole('button', { name: 'Add to collection', exact: true })
    ).toBeVisible({ timeout: 10_000 });

    // Close the overlay
    await page
      .getByRole('button', { name: 'Close Add to collection overlay' })
      .click();

    await page.getByRole('menuitem', { name: testUser.username }).click();
    await page.getByRole('menuitem', { name: 'My Collections' }).click();

    // sketch1 was removed but sketch2 is still in the collection
    await expect(
      page.getByRole('row', { name: collectionName }).getByRole('cell').nth(2)
    ).toHaveText('1');
  });

  test('can delete a collection', async () => {
    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Open the dropdown for the collection
    await page
      .getByRole('button', { name: 'Toggle Open/Close collection options' })
      .first()
      .click();

    // Click delete
    await page.getByRole('menuitem').filter({ hasText: 'Delete' }).click();

    // Verify collection no longer exists in the table
    await expect(
      page.getByRole('link', { name: collectionName })
    ).toHaveCount(0, { timeout: 5_000 });

    await expect(page.getByText('No collections.')).toBeVisible({
      timeout: 5_000
    });
  });
});
