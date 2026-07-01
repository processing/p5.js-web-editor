import { test, expect } from '@playwright/test';

test.describe('p5.js Editor – Playwright E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for the page to be interactive before checking for the banner
    await page.waitForSelector('.CodeMirror', { timeout: 600_000 });

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

    await page.waitForSelector('.CodeMirror-code', { timeout: 600_000 });
    await page.click('.CodeMirror-code', { force: true });

    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(newCode, { delay: 5 });

    // Click Play
    await page.locator('#play-sketch').click({ force: true });

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
