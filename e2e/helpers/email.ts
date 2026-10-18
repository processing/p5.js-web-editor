import { expect } from '../fixtures';
import { mailpitApiUrl } from './mailpit';

export async function getVerificationLink(email: string): Promise<string> {
  // Email delivery is async, so poll Mailpit until the message arrives
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
