import { test as base, expect } from '@playwright/test';

/**
 * Shared e2e test setup. Specs should import { test, expect } from here
 * instead of '@playwright/test'.
 *
 * - Hide Redux DevTools (see client/store.ts) by stubbing
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ = () => {};
    });
    await use(page);
  }
});

export { expect };
