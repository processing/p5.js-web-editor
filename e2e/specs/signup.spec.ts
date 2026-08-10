import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { usernamePrefix, emailSuffix, password } from '../helpers/test-user';
import { getVerificationLink } from '../helpers/email';

test.describe('signup and email verification', () => {
  test('can sign up and verify email via the emailed link', async ({
    page
  }) => {
    // Unique per run so the duplicate username/email check passes
    const uniqueId = `${usernamePrefix()}${Date.now()}`;
    const email = `${uniqueId}${emailSuffix()}`;

    await page.goto('/');
    await dismissCookieBanner(page);

    await page.locator('a[href="/signup"]').click();

    await page.locator('#username').fill(uniqueId);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password());
    await page.locator('#confirmPassword').fill(password());

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

  test('cannot sign up with an already-used username or email', async ({
    page
  }) => {
    const uniqueId = `${usernamePrefix()}${Date.now()}`;
    const email = `${uniqueId}${emailSuffix()}`;

    await page.goto('/');

    await dismissCookieBanner(page);

    await page.locator('a[href="/signup"]').click();

    await page.locator('#username').fill(uniqueId);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password());
    await page.locator('#confirmPassword').fill(password());

    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // Successful signup logs the user in and redirects to the editor
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 15_000
    });

    await page.locator(`button:has-text("${uniqueId}")`).click();
    await page.locator('#account-logout').click();

    await expect(page.locator('a[href="/signup"]')).toBeVisible({
      timeout: 5_000
    });
    await page.locator('a[href="/signup"]').click();

    // Fill the input field and move away, error appears on blur
    await page.locator('#username').fill(uniqueId);
    await page.locator('#email').click();
    await expect(
      page
        .locator('.form-error')
        .filter({ hasText: 'This username is already taken.' })
    ).toBeVisible({ timeout: 5_000 });
    await page.locator('#email').fill(email);
    await page.locator('#password').click();
    await expect(
      page
        .locator('.form-error')
        .filter({ hasText: 'This email is already taken.' })
    ).toBeVisible({ timeout: 5_000 });

    // Now fill passwords — email error will disappear but that's fine
    // we already asserted on it above
    await page.locator('#password').fill(password());
    await page.locator('#confirmPassword').fill(password());

    // Submit button should still be disabled due to duplicate username/email
    await expect(
      page.getByRole('button', { name: 'Sign Up', exact: true })
    ).toBeDisabled();
  });

  test('sketch persists and runs after unauthenticated user creates an account', async ({
    page
  }) => {
    const username = `${usernamePrefix()}${Date.now()}`;
    const email = `${username}${emailSuffix()}`;

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
    ].join('');

    await page.goto('/');
    await dismissCookieBanner(page);

    // Run sketch as unauthenticated user
    const editor = page.locator('.editor-holder');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(newCode, { delay: 5 });

    await page.locator('#play-sketch').click({ force: true });

    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('hi from sketch', { timeout: 15_000 });

    // Try to save the sketch, which should prompt login
    await editor.click();
    await page.keyboard.press('Control+S');

    await expect(
      page.getByText(
        'In order to save sketches, you must be logged in. Please Login or Sign Up.'
      )
    ).toBeVisible();

    // Click on the signup prompt
    await page.locator('a[href="/signup"]').last().click();
    await page.waitForURL('**/signup', { timeout: 10_000 });

    await expect(page.locator('h2.form-container__title')).toHaveText(
      'Sign Up'
    );

    await page.fill('input#username', username);
    await page.fill('input#email', email);
    await page.fill('input#password', password());
    await page.fill('input#confirmPassword', password());

    await expect(page.locator('button[type="submit"]')).toBeEnabled({
      timeout: 5_000
    });
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.pathname.endsWith('/signup'), {
      timeout: 15_000
    });
    await expect(page.locator(`text=${username}`).first()).toBeVisible({
      timeout: 10_000
    });

    // Run the same sketch again as authenticated user
    await expect(page.locator('.editor-holder')).toBeVisible();
    await page.locator('#play-sketch').click();

    await expect(
      page.locator('iframe[title="sketch preview"]')
    ).toHaveAttribute('src', /9002/, { timeout: 10_000 });

    await expect(
      page.locator('.preview-console__messages')
    ).toContainText('hi from sketch', { timeout: 20_000 });
  });
});
