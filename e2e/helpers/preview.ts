import type { Page } from '@playwright/test';
import { expect } from '../fixtures';

/**
 * Waits until the editor's preview iframe (the separate Preview app on
 * PREVIEW_URL) is listening for messages, so that clicking Play will
 * actually run the sketch.
 *
 * Why: Play posts the sketch to the preview iframe with a fire-and-forget
 * postMessage (see startSketch() in client/modules/IDE/actions/ide.js). If
 * the preview app hasn't mounted its message listener yet — e.g. right after
 * a full page load — the message is dropped and the sketch never runs. The
 * iframe's `src` is set immediately, so checking it proves nothing.
 *
 * How: the same handshake FullView.jsx uses — keep posting REGISTER to the
 * preview until it echoes REGISTER back, which it only does once its
 * listener is attached. The IDE console ignores these echoes.
 */
export async function waitForPreviewReady(
  page: Page,
  timeout = 10_000
): Promise<void> {
  const preview = page.locator('iframe[title="sketch preview"]');
  await expect(preview).toBeAttached({ timeout });
  await preview.evaluate(
    (frame: HTMLIFrameElement, ms: number) =>
      new Promise<void>((resolve, reject) => {
        const { origin } = new URL(frame.src);
        const ping = () =>
          frame.contentWindow?.postMessage({ type: 'REGISTER' }, origin);
        const cleanup = () => {
          window.clearInterval(interval);
          window.clearTimeout(timer);
          window.removeEventListener('message', onMessage);
        };
        const onMessage = (e: MessageEvent) => {
          if (e.origin === origin && e.data?.type === 'REGISTER') {
            cleanup();
            resolve();
          }
        };
        const interval = window.setInterval(ping, 100);
        const timer = window.setTimeout(() => {
          cleanup();
          reject(new Error(`Preview iframe not ready after ${ms}ms`));
        }, ms);
        window.addEventListener('message', onMessage);
        ping();
      }),
    timeout
  );
}
