import { expect } from '../fixtures';
import { requireEnv } from './env';

/**
 * Mailpit addresses derived from the MAILPIT_*_PORT vars in .env.e2e. Emails
 * are captured here instead of Mailgun (EMAIL_TRANSPORT=smtp in .env.e2e,
 * on MAILPIT_SMTP_PORT — see server/utils/mail.ts).
 */
export const mailpitSmtpPort = () => requireEnv('MAILPIT_SMTP_PORT');
export const mailpitUiPort = () => requireEnv('MAILPIT_UI_PORT');
export const mailpitApiUrl = () => `http://localhost:${mailpitUiPort()}/api/v1`;

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
          `${mailpitApiUrl()}/search?query=${encodeURIComponent(`to:${email}`)}`
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

  const res = await fetch(`${mailpitApiUrl()}/message/${messageId}`);
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
