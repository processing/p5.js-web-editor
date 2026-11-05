import { renderEmailConfirmation } from '../mail';

describe('renderEmailConfirmation', () => {
  const domain = 'https://editor.p5js.org';
  const link = 'https://editor.p5js.org/verify?t=token123';

  const result = renderEmailConfirmation({
    body: { domain, link },
    to: 'user@example.com'
  });

  it('includes the p5.js logo at a public absolute HTTPS URL', () => {
    expect(result.html).toContain(
      'src="https://editor.p5js.org/images/p5js-square-logo.png"'
    );
    expect(result.html).toContain('alt="p5.js"');
  });

  it('preserves the verification link, subject, and recipient', () => {
    expect(result.html).toContain(link);
    expect(result.subject).toBe('p5.js Email Verification');
    expect(result.to).toBe('user@example.com');
  });
});
