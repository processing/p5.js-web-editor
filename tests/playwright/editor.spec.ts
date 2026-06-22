import { test, expect } from '@playwright/test';

test.describe('p5.js Editor – Playwright E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be interactive before checking for the banner
    await page.waitForSelector('.CodeMirror', { timeout: 30_000 });

    // Dismiss cookie banner via JS — handles the case where the button
    // is outside the viewport due to the Redux DevTools sidebar
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /allow essential|allow all/i.test(b.textContent ?? '')
      ) as HTMLElement | undefined;
      btn?.click();
    });

    await page.waitForTimeout(400);
  });

  test('can execute code from the editor by clicking the Play button', async ({
    page
  }) => {
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
    ].join(''); // Avoid newlines to prevent autocomplete from inserting unnecessary brackets

    // Wait for CodeMirror to be ready
    const editor = page.locator('.CodeMirror');
    await expect(editor).toBeVisible({ timeout: 30_000 });
    await editor.click();

    await page.keyboard.press('Control+A');
    await page.keyboard.type(newCode, { delay: 5 });

    await page.waitForTimeout(500);

    // Click Play
    await page.locator('#play-sketch').click();

    // Wait for the sketch iframe to confirm the sketch actually started
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('iframe')).some((f) =>
          (f as HTMLIFrameElement).src.includes('8002')
        ),
      { timeout: 10_000 }
    );

    // Assert console output
    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('hi from sketch', { timeout: 15_000 });
  });
});
