const { test, expect } = require('@playwright/test');

test.describe('Editor Smoke Test', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.CodeMirror')).toBeVisible({ timeout: 15000 });
  });

  test('play button runs sketch', async ({ page }) => {
    const playButton = page.locator('#play-sketch');

    await expect(playButton).toBeVisible();
    await playButton.click({ force: true });

    // wait for preview trigger
    await page.waitForTimeout(2000);

    // ✅ ONLY reliable signal
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
  });

});