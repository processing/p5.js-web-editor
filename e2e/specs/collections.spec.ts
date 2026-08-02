import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, TestUser, loginAs } from '../helpers/auth';

test.describe('Collections tests', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);
  });

  test('logged in user can manage collections', async ({ page }) => {
    // Save the initial sketch
    const editor = page.locator('.editor-holder');
    await editor.click();

    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    //  Get the sketch name
    const sketchName = await page
      .locator('button.editable-input__label')
      .textContent();
    expect(sketchName).toBeTruthy();

    // Open the collections page
    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-collections').click();

    await expect(page.locator('text=No Collections.')).toBeVisible({
      timeout: 5_000
    });

    // Create a new collection
    await page.locator('button:has-text("Create Collection")').click();

    const collectionName = await page.locator('input#name').inputValue();
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

    // Add the sketch to the collection
    await page.locator('button:has-text("Add Sketch")').click();

    await expect(
      page
        .locator('.quick-add__item-name')
        .filter({ hasText: sketchName ?? '' })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .locator('button[aria-label="Add to collection"]')
      .first()
      .click();

    await page.locator('button[aria-label="Close Add Sketch overlay"]').click();

    // Confirm the sketch is in the collection
    await expect(
      page.locator('table.sketches-table').getByText(sketchName ?? '')
    ).toBeVisible({ timeout: 5_000 });
    // Rename the collection
    await page
      .locator('button[aria-label^="Edit"][aria-label$="value"]')
      .first()
      .click();
    await page
      .locator('input.editable-input__input')
      .first()
      .fill('renamed-collection');
    await page.locator('input.editable-input__input').first().press('Enter');

    // Confirm the sketch is in the collection
    await expect(
      page.locator('table.sketches-table').getByText(sketchName ?? '')
    ).toBeVisible({ timeout: 5_000 });

    await expect(page.locator('p.collection-metadata__user').last()).toHaveText(
      '1 sketch'
    );

    await page.locator(`a:has-text("${sketchName}")`).click();

    // Confirm we're back in the editor and the sketch is loaded
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 5_000
    });
    await expect(
      page.locator('button.editable-input__label').first()
    ).toHaveText(sketchName ?? '', { timeout: 5_000 });

    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.locator('#file-add-to-collection').click();

    await expect(
      page
        .locator('.quick-add__item-name')
        .filter({ hasText: 'renamed-collection' })
    ).toBeVisible({ timeout: 5_000 });

    await page
      .locator('button[aria-label="Remove from collection"]')
      .first()
      .click();

    await expect(
      page.getByText(`Removed from "renamed-collection"`)
    ).toBeVisible({
      timeout: 10_000
    });

    // Close the overlay
    await page
      .locator('button[aria-label="Close Add to collection overlay"]')
      .click();

    await page.locator(`button:has-text("${testUser.username}")`).click();
    await page.locator('#account-collections').click();

    // Verify the sketch count is 0
    await expect(
      page
        .locator('tr')
        .filter({ hasText: 'renamed-collection' })
        .locator('td')
        .nth(2)
    ).toHaveText('0');

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
      page.locator('table.sketches-table').getByText('renamed-collection')
    ).toHaveCount(0, { timeout: 5_000 });

    await expect(page.locator('text=No collections.')).toBeVisible({
      timeout: 5_000
    });
  });
});
