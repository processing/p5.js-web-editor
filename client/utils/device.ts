/**
 * Checks if the user's OS is macOS based on the `navigator.userAgent` string.
 * This is the preferred method over `navigator.platform`, which is now deprecated:
 *   - see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform
 */
export function isMac(): boolean {
  return navigator?.userAgent?.toLowerCase().includes('mac') ?? false;
}
