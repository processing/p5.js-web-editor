import { test, expect } from './fixtures';

/**
 * Signup + email verification flow.
 *
 * Emails are captured by Mailpit (https://mailpit.axllent.org/), a local fake
 * SMTP server, instead of Mailgun (EMAIL_TRANSPORT=smtp in .env.e2e), on
 * Mailpit's default ports (SMTP :1025, HTTP API :8025).
 *
 * Both Mailpit and the app (with .env.e2e config, on port 9000) are started
 * automatically by playwright.config.ts (webServer). The only local one-time
 * setup is `brew install mailpit`. On CI, Mailpit runs as a service container
 * (see e2e.yml) and is reused.
 */

// Mailpit's default HTTP API port (also health-checked in playwright.config.ts)
const MAILPIT_API = 'http://localhost:8025/api/v1';

async function getVerificationLink(email: string): Promise<string> {
  // Email delivery is async, so poll Mailpit until the message arrives
  let messageId: string | undefined;
  await expect
    .poll(
      async () => {
        const res = await fetch(
          `${MAILPIT_API}/search?query=${encodeURIComponent(`to:${email}`)}`
        );
        const data = await res.json();
        messageId = data.messages?.[0]?.ID;
        return messageId;
      },
      {
        message: `Expected a verification email to ${email} to arrive in Mailpit`,
        timeout: 15_000
      }
    )
    .toBeTruthy();

  const res = await fetch(`${MAILPIT_API}/message/${messageId}`);
  const message = await res.json();
  const match = (message.HTML as string).match(
    /href="(http[^"]*\/verify\?t=[^"]+)"/
  );
  expect(
    match,
    'Expected the email to contain a /verify?t=<token> link'
  ).toBeTruthy();
  return match![1];
}

test.describe('signup and email verification', () => {
  test('can sign up and verify email via the emailed link', async ({
    page
  }) => {
    // Unique per run so the duplicate username/email check passes
    const uniqueId = `e2e${Date.now()}`;
    const email = `${uniqueId}@example.com`;
    const password = 'e2e-Test-Password-1';

    await page.goto('/signup');

    // Dismiss cookie banner if it appears (see editor.spec.ts for why querySelectorAll)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /allow essential|allow all/i.test(b.textContent ?? '')
      ) as HTMLElement | undefined;
      btn?.click();
    });

    await page.locator('#username').fill(uniqueId);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);

    // The submit button stays disabled until the async duplicate
    // username/email check resolves; click() auto-waits for enabled
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // Successful signup logs the user in and redirects to the editor
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 15_000
    });

    // "Receive" the verification email and click its link
    const verificationLink = await getVerificationLink(email);
    await page.goto(verificationLink);

    // On success the verify page flashes a message for ~1s and then redirects
    // home, so asserting on the message races the redirect. The redirect only
    // happens for a valid token (invalid tokens stay on /verify showing an
    // error), so assert the redirect, then the durable outcome via the API.
    await expect(page).toHaveURL('/', { timeout: 15_000 });

    const session = await page.request.get('/editor/session');
    expect((await session.json()).verified).toBe('verified');
  });
});
