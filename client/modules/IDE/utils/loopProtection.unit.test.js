import {
  addNoProtect,
  hasNoProtect,
  preserveNoProtect,
  removeNoProtect,
  toggleLoopProtection
} from './loopProtection';

describe('loopProtection helpers', () => {
  const html = `<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>`;
  const withNoProtect = `<!-- noprotect -->\n${html}`;

  describe('hasNoProtect', () => {
    it('is true when a leading noprotect comment exists', () => {
      expect(hasNoProtect(withNoProtect)).toBe(true);
    });

    it('is false when the comment is absent', () => {
      expect(hasNoProtect(html)).toBe(false);
    });
  });

  describe('addNoProtect / removeNoProtect', () => {
    it('prepends the comment once', () => {
      expect(addNoProtect(html)).toBe(withNoProtect);
      expect(addNoProtect(withNoProtect)).toBe(withNoProtect);
    });

    it('strips the comment', () => {
      expect(removeNoProtect(withNoProtect)).toBe(html);
      expect(removeNoProtect(html)).toBe(html);
    });
  });

  describe('toggleLoopProtection', () => {
    it('removes noprotect when protection is enabled', () => {
      expect(toggleLoopProtection(withNoProtect, true)).toBe(html);
    });

    it('adds noprotect when protection is disabled', () => {
      expect(toggleLoopProtection(html, false)).toBe(withNoProtect);
    });
  });

  describe('preserveNoProtect', () => {
    it('restores noprotect after a rewrite that dropped it', () => {
      expect(preserveNoProtect(withNoProtect, html)).toBe(withNoProtect);
    });

    it('does not insert noprotect when the original had none', () => {
      expect(preserveNoProtect(html, html)).toBe(html);
    });

    it('does not duplicate noprotect when the rewrite kept it', () => {
      expect(preserveNoProtect(withNoProtect, withNoProtect)).toBe(
        withNoProtect
      );
    });
  });
});
