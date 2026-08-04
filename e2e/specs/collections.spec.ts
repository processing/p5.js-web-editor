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

    // Get the sketch name
    const name = await page
      .locator('button.editable-input__label')
      .textContent();
    expect(name).toBeTruthy();
    sketchName1 = name ?? '';

    // Open the collections page
    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-collections').click();

    await expect(page.locator('text=No Collections.')).toBeVisible({
      timeout: 5_000
    });

    // Create a new collection
    await page.locator('button:has-text("Create Collection")').click();

    collectionName = await page.locator('input#name').inputValue();
    await page
      .locator('button[type="submit"]:has-text("Create collection")')
      .click();

    // Confirm we're on the new collection page
    await expect(
      page.locator('button.editable-input__label').first()
    ).toContainText(collectionName, { timeout: 10_000 });
    await expect(page.locator('p.collection-empty-message')).toHaveText(
      'No sketches in collection'
    );
  });

  test('can add sketches to a collection', async () => {
    await page.locator('button:has-text("Add Sketch")').click();

    await expect(
      page.locator('.quick-add__item-name').filter({ hasText: sketchName1 })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .locator('button[aria-label="Add to collection"]')
      .first()
      .click();

    await page.locator('button[aria-label="Close Add Sketch overlay"]').click();

    // Confirm the sketch is in the collection
    await expect(
      page.locator('table.sketches-table').getByText(sketchName1)
    ).toBeVisible({ timeout: 5_000 });

    await page.locator('table.sketches-table').getByText(sketchName1).click();

    // Create a new sketch to add to the collection
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 5_000
    });

    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.locator('#file-new').click();

    const editor = page.locator('.editor-holder');
    await editor.click();

    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    const name = await page
      .locator('button.editable-input__label')
      .textContent();
    expect(name).toBeTruthy();
    sketchName2 = name ?? '';

    // Add the new sketch to the collection
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.locator('#file-add-to-collection').click();

    await expect(
      page.locator('.quick-add__item-name').filter({ hasText: collectionName })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .locator('button[aria-label="Add to collection"]')
      .first()
      .click();

    await expect(page.getByText(`Added to "${collectionName}"`)).toBeVisible({
      timeout: 10_000
    });

    // Close the overlay
    await page
      .locator('button[aria-label="Close Add to collection overlay"]')
      .click();

    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-collections').click();

    // Verify the collection has 2 sketches
    await expect(
      page
        .locator('tr')
        .filter({ hasText: collectionName })
        .locator('td')
        .nth(2)
    ).toHaveText('2');
  });

  test('can rename a collection', async () => {
    // Open the dropdown
    await page
      .locator('[aria-label="Toggle Open/Close collection options"]')
      .first()
      .click();

    // Click Rename
    await page.getByRole('menuitem').filter({ hasText: 'Rename' }).click();

    // The collection name becomes an input — fill it
    await page.locator('th input').first().click();
    await page.locator('th input').first().fill('renamed-collection');
    await page.locator('th input').first().press('Enter');

    collectionName = 'renamed-collection';

    // Verify the new name appears
    await expect(
      page.locator('table.sketches-table').getByText(collectionName)
    ).toBeVisible({ timeout: 5_000 });

    await page.locator(`a:has-text("${collectionName}")`).click();

    // Both sketches should still be in the collection after the rename
    await expect(
      page.locator('table.sketches-table').getByText(sketchName1)
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator('table.sketches-table').getByText(sketchName2)
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('p.collection-metadata__user').last()).toHaveText(
      '2 sketches'
    );
  });

  test('can remove a sketch from a collection', async () => {
    await page.locator(`a:has-text("${sketchName1}")`).click();

    // Confirm we're back in the editor and the sketch is loaded
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 5_000
    });
    await expect(
      page.locator('button.editable-input__label').first()
    ).toHaveText(sketchName1, { timeout: 5_000 });

    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.locator('#file-add-to-collection').click();

    await expect(
      page.locator('.quick-add__item-name').filter({ hasText: collectionName })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .locator('button[aria-label="Remove from collection"]')
      .first()
      .click();

    await expect(
      page.getByText(`Removed from "${collectionName}"`)
    ).toBeVisible({
      timeout: 10_000
    });

    // Close the overlay
    await page
      .locator('button[aria-label="Close Add to collection overlay"]')
      .click();

    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-collections').click();

    // sketch1 was removed but sketch2 is still in the collection
    await expect(
      page
        .locator('tr')
        .filter({ hasText: collectionName })
        .locator('td')
        .nth(2)
    ).toHaveText('1');
  });

  test('can delete a collection', async () => {
    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Open the dropdown for the collection
    await page
      .locator('[aria-label="Toggle Open/Close collection options"]')
      .first()
      .click();

    // Click delete
    await page.getByRole('menuitem').filter({ hasText: 'Delete' }).click();

    // Verify collection no longer exists in the table
    await expect(
      page.locator('table.sketches-table').getByText(collectionName)
    ).toHaveCount(0, { timeout: 5_000 });

    // Verify collection no longer exists in the table
    await expect(
      page.locator('table.sketches-table').getByText('renamed-collection')
    ).toHaveCount(0, { timeout: 5_000 });

    await expect(page.locator('text=No collections.')).toBeVisible({
      timeout: 5_000
    });
  });
});
