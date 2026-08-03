import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';

test.describe('editor page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // initial pageload check to fail fast:
    await expect(page.locator('a.skip_link[href="#play-sketch"]')).toHaveText(
      'Skip to Play Sketch'
    );

    await dismissCookieBanner(page);

    // wait for page to fully load with all main IDE components:
    await expect(page.locator('#play-sketch')).toBeVisible(); // play button
    await expect(page.locator('iframe[title="sketch preview"]')).toBeVisible(); // sketch preview
    await expect(page.locator('.preview-console')).toBeVisible(); // editor console
    await expect(page.locator('.editor-holder')).toBeVisible(); // editor -- NOTE: .editor-holder .CodeMirror cannot be found on CI for some reason, so we are using .editor-holder instead.
  });

  test('can run sketch code written in the editor', async ({ page }) => {
    const newCode = [
      'function setup() {',
      '  createCanvas(400, 400);',
      ' frameRate(10);',
      '}',
      '',
      'function draw() {',
      '  background(220);',
      "  console.log('hi from sketch');",
      '}'
    ].join(''); // Purposely joining without '\n' to avoid triggering the autocomplete with keyboard.type & creating extra brackets

    // Find editor text area, clear default code & type in the new code
    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(newCode, { delay: 5 }); // Purposely using .type instead of .insert (.insert does not work with the redux state management)

    // Click Play
    await page.locator('#play-sketch').click({ force: true });

    // Wait for the sketch iframe src to confirm the sketch actually started
    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    // Assert console output
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('hi from sketch', { timeout: 15_000 });

    // Let sketch run for 2 seconds
    await page.waitForTimeout(2000);

    const logRow = page
      .locator('.preview-console__messages [data-method="log"]')
      .filter({ hasText: 'hi from sketch' })
      .last();
    const countDiv = logRow.locator('div').first();
    const count = Number(await countDiv.textContent());

    // Wide tolerance: exact frame count depends on browser/CI scheduling, not just frameRate(10) math.
    // Ideally its supposed to be 20 frames in 2 seconds.
    expect(count).toBeGreaterThan(15);
    expect(count).toBeLessThan(30);

    // Stop the sketch
    await page.locator('[aria-label="Stop sketch"]').click();

    // Wait and confirm count is frozen
    await page.waitForTimeout(1000);
    await expect(countDiv).toHaveText(count.toString());
  });

  test('unauthenticated users cannot save sketches', async ({ page }) => {
    // Verify save option is disabled in File menu
    await page.getByRole('menuitem', { name: 'File' }).click();

    const saveButton = page.locator('#file-save');

    await expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    await expect(saveButton).toHaveAttribute(
      'aria-label',
      'Log in to save your sketch'
    );

    // Close menu if needed
    await page.keyboard.press('Escape');

    // Attempt save via keyboard shortcut
    await page.locator('.editor-holder').click();
    // 'Control' (not ControlOrMeta): the app's isMac() checks the user agent,
    // which the Desktop Chrome device emulates as Windows — so the app-level
    // save shortcut expects Ctrl+S on every host, including Macs.
    await page.keyboard.press('Control+S');

    // Verify login prompt appears
    await expect(
      page.getByText(
        'In order to save sketches, you must be logged in. Please Login or Sign Up.'
      )
    ).toBeVisible();
  });
});
