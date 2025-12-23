import { isMac } from './device';

describe('isMac', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    // Restore the original userAgent after each test
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  it('returns true when userAgent contains "Mac"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true
    });
    expect(isMac()).toBe(true);
  });

  it('returns false when userAgent does not contain "Mac"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true
    });
    expect(isMac()).toBe(false);
  });

  it('returns false when navigator agent is null', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: null,
      configurable: true
    });
    expect(isMac()).toBe(false);
  });

  it('returns false when navigator agent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true
    });
    expect(isMac()).toBe(false);
  });
});
