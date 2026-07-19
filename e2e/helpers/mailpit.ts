import { expect } from '../fixtures';

/**
 * Mailpit's default HTTP API port (https://mailpit.axllent.org/). Emails are
 * captured here instead of Mailgun (EMAIL_TRANSPORT=smtp in .env.e2e, on
 * Mailpit's default SMTP port :1025 — see server/utils/mail.ts).
 */
const MAILPIT_API = 'http://localhost:8025/api/v1';

/**
 * Polls Mailpit until a verification email arrives for `email` (delivery is
 * async), then returns the `/verify?t=<token>` link from its HTML body.
 */
export async function getVerificationLink(email: string): Promise<string> {
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
