import { test, expect } from '@playwright/test';

test.describe('editor page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // initial pageload check to fail fast:
    await expect(page.locator('a.skip_link[href="#play-sketch"]')).toHaveText(
      'Skip to Play Sketch'
    );

    // Dismiss cookie banner if it appears
    // Note: we do document.querySelectorAll instead of page.locator as workaround due to the buttons on the banner being beyond the viewport
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /allow essential|allow all/i.test(b.textContent ?? '')
      ) as HTMLElement | undefined;
      btn?.click();
    });

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
      '}',
      '',
      'function draw() {',
      '  background(220);',
      "  console.log('hi from sketch');",
      '  noLoop();',
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
    ).toHaveAttribute('src', /8002/, { timeout: 10_000 });

    // Assert console output
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('hi from sketch', { timeout: 15_000 });
  });
});
