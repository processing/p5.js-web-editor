import type { Page } from '@playwright/test';

/**
 * Dismisses the cookie consent banner if it is showing ("Allow essential"),
 * keeping Google Analytics in cookieless mode. No-op when the banner is
 * absent (e.g. consent was already stored earlier in the test).
 *
 * Note: uses document.querySelectorAll instead of page.locator as a
 * workaround for the banner buttons rendering beyond the viewport.
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      /allow essential/i.test(b.textContent ?? '')
    ) as HTMLElement | undefined;
    btn?.click();
  });
}
