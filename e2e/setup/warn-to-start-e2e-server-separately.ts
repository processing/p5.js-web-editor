/**
 * Pre-flight check if the e2e app server has already been started.
 *
 * Playwright's webServer will start one if not, but this logs a warning for better developer experience:
 * - The app takes a few minutes to start & its output is easily missed, especially in Playwright's UI mode.
 * - Recommend starting the server separately for more visibility.
 *
 * Advisory only: never throws, so it can never block the test run.
 */
export async function warnToStartE2eAppServerSeparately(): Promise<void> {
  const editorUrl = process.env.EDITOR_URL || 'http://localhost:9000';

  try {
    await fetch(editorUrl, { signal: AbortSignal.timeout(2000) });
  } catch {
    console.warn(
      `\n⚠️  [e2e] WARNING: No app server detected at ${editorUrl}.\n` +
        '   Playwright will start one for you, but the first webpack build is\n' +
        '   slow (a few minutes) and its output is hard to see from here.\n' +
        '   You may also end up with flakey tests that do not match CI behaviour.\n' +
        '   For more visibility, run `npm run start:e2e` in another terminal\n' +
        '   first — Playwright will detect and reuse it.\n'
    );
  }
}
