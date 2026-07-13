import { test as base, expect } from '@playwright/test';

/**
 * Shared e2e test setup. Specs should import { test, expect } from here
 * instead of '@playwright/test'.
 *
 * In development the app renders the Redux DevTools dock monitor whenever the
 * browser has no Redux DevTools extension (see showReduxDevTools in
 * client/store.ts) — which is always the case in Playwright's clean browser.
 * Stubbing the extension global before the app loads keeps the dock monitor
 * from rendering over the UI during tests.
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
