import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { createTestUser, loginAs, TestUser } from '../helpers/auth';

test.describe.serial('sketch lifecycle', () => {
  let testUser: TestUser;
  let page: Page;
  let sketchName: string;

  test.beforeAll(async ({ browser, request }) => {
    testUser = await createTestUser(request);

    // A single page shared across this describe.serial block (instead of the
    // per-test `page` fixture) so each test below can build on the previous
    // one's state (same sketch, still logged in).
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

  const editor = () => page.locator('.editor-holder');

  test('can save a sketch', async () => {
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

    await editor().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(initialCode, { delay: 5 });

    await page.locator('#play-sketch').click({ force: true });
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('initial log', { timeout: 10_000 });

    const name = await page
      .locator('button.editable-input__label')
      .textContent();
    expect(name).toBeTruthy();
    sketchName = name ?? '';

    await editor().click();
    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });
  });

  test('can reopen and edit a saved sketch', async () => {
    // Using page.goto() directly rather than the nav dropdown — the dropdown
    // sometimes does not respond to clicks consistently.
    await page.goto(`/${testUser.username}/sketches`);

    await page.locator('table.sketches-table').getByText(sketchName).click();

    // Confirm we're back on the right sketch
    await expect(
      page.locator('button.editable-input__label')
    ).toContainText(sketchName, { timeout: 10_000 });

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

    await editor().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(updatedCode, { delay: 5 });
    // Wait for the unsaved changes indicator to appear, then save the sketch.
    await expect(
      page.getByRole('img', { name: 'Sketch has unsaved changes' })
    ).toBeVisible();
    await page.keyboard.press('Control+S');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });
  });

  test('can rename a sketch and the update persists', async () => {
    await page.locator('button.editable-input__label').click();
    await page.locator('input.editable-input__input').fill('renamed-sketch');
    await page.locator('input.editable-input__input').press('Enter');
    await expect(page.getByText('Sketch saved.')).toBeVisible({
      timeout: 10_000
    });

    // Navigate away and come back via the sketches page
    await page.goto(`/${testUser.username}/sketches`);

    // Confirm renamed sketch appears in the table
    await expect(
      page.locator('table.sketches-table').getByText('renamed-sketch')
    ).toBeVisible({ timeout: 10_000 });
    await page
      .locator('table.sketches-table')
      .getByText('renamed-sketch')
      .click();

    // Confirm the reopened sketch has actually loaded before playing it
    await expect(
      page.locator('button.editable-input__label')
    ).toContainText('renamed-sketch', { timeout: 10_000 });

    // Run the renamed sketch and verify the edited code persisted
    await page.locator('#play-sketch').click({ force: true });
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('updated log', { timeout: 10_000 });
  });

  test('can delete a sketch', async () => {
    await page.goto(`/${testUser.username}/sketches`);
    await expect(page.locator('table.sketches-table')).toBeVisible({
      timeout: 10_000
    });

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
