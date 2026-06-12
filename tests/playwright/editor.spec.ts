import { test, expect, Page } from '@playwright/test';

async function dismissCookies(page: Page) {
  try {
    await page.waitForSelector('button', { timeout: 3_000 });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /allow all|allow essential/i.test(b.textContent ?? '')
      ) as HTMLElement | undefined;
      btn?.click();
    });
    await page.waitForTimeout(400);
  } catch {
    /* no banner */
  }
}

test.describe('p5.js Editor – Playwright E2E', () => {
  test('editor loads and has a sketch iframe', async ({ page }) => {
    await page.goto('http://localhost:8000', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000
    });
    await dismissCookies(page);
    await page.evaluate(() => {
      (document.querySelector(
        '[aria-label="Play sketch"]'
      ) as HTMLElement)?.click();
    });
    const iframeHandle = await page.waitForSelector('iframe', {
      timeout: 15_000
    });
    expect(iframeHandle).toBeTruthy();
  });

  test('can access iframe content frame', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await dismissCookies(page);
    await page.waitForSelector('iframe');
    const body = page.frameLocator('iframe').first().locator('body');
    await expect(body).toBeAttached({ timeout: 10_000 });
  });

  test('run button triggers sketch in iframe', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await dismissCookies(page);
    await page.evaluate(() => {
      (document.querySelector(
        '[aria-label="Play sketch"]'
      ) as HTMLElement)?.click();
    });
    await page.waitForSelector('iframe', { timeout: 10_000 });
    const iframeSrc = await page.locator('iframe').getAttribute('src');
    console.log('iframe src:', iframeSrc);
    expect(iframeSrc).toBeTruthy();
    await expect(page.locator('iframe')).toBeVisible({ timeout: 10_000 });
  });

  test.skip('sketch execution via postMessage', async () => {
    // FINDING: postMessage interception via page.evaluate() returns empty.
    // The sketch iframe (localhost:8002) sends messages via window.parent.parent
    // but these do not surface in Playwright's main page context.
    // Testing sketch output would require CDP or a dedicated message relay
    // — a candidate for GSoC implementation.
  });

  test('sketch console.log appears in editor console', async ({ page }) => {
    await page.goto('http://localhost:8000');

    await dismissCookies(page);

    await page.waitForFunction(() => {
      const wrapper = document.querySelector('.CodeMirror') as any;
      return !!wrapper?.CodeMirror;
    });

    await page.evaluate(
      (newCode) => {
        const cm = (document.querySelector('.CodeMirror') as any)?.CodeMirror;

        if (!cm) {
          throw new Error('CodeMirror not found');
        }

        cm.setValue(newCode);
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

        if (!store) {
          throw new Error('Redux store not found');
        }

        const selectedFile = store
          .getState()
          .files.find((f: any) => f.isSelectedFile);

        if (!selectedFile) {
          throw new Error('Selected file not found');
        }

        store.dispatch({
          type: 'UPDATE_FILE_CONTENT',
          id: selectedFile.id,
          content: newCode
        });
      },
      `
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  console.log('hi from sketch');
  noLoop();
}
`
    );

    await page.waitForTimeout(1000);

    await page.locator('#play-sketch').click();

    const openConsoleButton = page.locator('[aria-label="Open console"]');

    if (await openConsoleButton.isVisible()) {
      await openConsoleButton.click();
    }

    await expect
      .poll(() => page.locator('.preview-console__messages').textContent(), {
        timeout: 15000
      })
      .toContain('hi from sketch');
  });
});
