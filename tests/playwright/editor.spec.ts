import { test, expect } from '@playwright/test';

test.describe('p5.js Editor – Playwright E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be interactive before checking for the banner
    await page.waitForSelector('.CodeMirror', { timeout: 120_000 });

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
    ].join('\n');

    // Wait for CodeMirror to be ready
    await page.waitForFunction(
      () => {
        const wrapper = document.querySelector('.CodeMirror') as any;
        return (wrapper?.CodeMirror?.getValue?.() ?? '').length > 0;
      },
      { timeout: 30_000 }
    );

    // Update code via CodeMirror API + Redux dispatch
    // (confirmed working approach from earlier diagnostic work)
    await page.evaluate((code) => {
      const cm = (document.querySelector('.CodeMirror') as any).CodeMirror;
      cm.setValue(code);
      cm.refresh();

      const root = document.querySelector('#root') as any;
      const fiberKey = Object.keys(root).find((k) =>
        k.startsWith('__reactContainer')
      );
      let node = root[fiberKey];
      let store: any = null;
      while (node) {
        if (node.memoizedProps?.store) {
          store = node.memoizedProps.store;
          break;
        }
        node = node.child;
      }
      if (!store) throw new Error('Redux store not found');

      const selectedFile = store
        .getState()
        .files.find((f: any) => f.isSelectedFile);
      if (!selectedFile) throw new Error('No selected file');

      store.dispatch({
        type: 'UPDATE_FILE_CONTENT',
        id: selectedFile.id,
        content: code
      });
    }, newCode);

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
