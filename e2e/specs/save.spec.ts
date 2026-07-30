import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, loginAs, TestUser } from '../helpers/auth';

test.describe('save sketch', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);
  });

  test('logged in user can save, rename, edit code, and delete a sketch', async ({
    page
  }) => {
    // Write and run the initial sketch
    const initialCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '}',
      '',
      'function draw() {',
      '  background(220);',
      "  console.log('initial log');",
      '  noLoop();',
      '}'
    ].join('');

    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(initialCode, { delay: 5 });

    await page.locator('#play-sketch').click({ force: true });
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('initial log', { timeout: 10_000 });

    // Save the sketch
    const sketchName = await page
      .locator('button.editable-input__label')
      .textContent();
    expect(sketchName).toBeTruthy();

    await editor.click();
    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    // Go to sketches page and open the sketch
    // Note: navigating via the nav dropdown (commented below) is flaky,
    // the dropdown sometimes does not respond to clicks consistently
    // await page.locator(`button:has-text("${testUser.username}")`).click();
    // await page.locator('#account-sketches').click();

    // Using page.goto() directly as a reliable alternative.
    await page.goto(`/${testUser.username}/sketches`);

    await page
      .locator('table.sketches-table')
      .getByText(sketchName ?? '')
      .click();

    // Confirm we're back on the right sketch
    await expect(
      page.locator('button.editable-input__label')
    ).toContainText(sketchName ?? '', { timeout: 10_000 });

    // Change the code
    const updatedCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      '}',
      '',
      'function draw() {',
      '  background(220);',
      "  console.log('updated log');",
      '  noLoop();',
      '}'
    ].join('');

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(updatedCode, { delay: 5 });
    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    // Rename the sketch
    await page.locator('button.editable-input__label').click();
    await page.locator('input.editable-input__input').fill('renamed-sketch');
    await page.locator('input.editable-input__input').press('Enter');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    // Navigate away and come back via sketches page
    await page.goto(`/${testUser.username}/sketches`);

    // Confirm renamed sketch appears in the table
    await expect(
      page.locator('table.sketches-table').getByText('renamed-sketch')
    ).toBeVisible({ timeout: 10_000 });
    await page
      .locator('table.sketches-table')
      .getByText('renamed-sketch')
      .click();

    // Run the updated sketch and verify changed log
    await page.locator('#play-sketch').click({ force: true });
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('updated log', { timeout: 10_000 });

    await page.goto(`/${testUser.username}/sketches`);

    await expect(page.locator('table.sketches-table')).toBeVisible({
      timeout: 10_000
    });

    // Delete the sketch
    page.on('dialog', (dialog) => dialog.accept());
    await page
      .locator('[aria-label="Toggle Open/Close Sketch Options"]')
      .click();
    await page.getByRole('menuitem').filter({ hasText: 'Delete' }).click();

    await expect(page.locator('text=No Sketches')).toBeVisible({
      timeout: 5_000
    });
  });
});
