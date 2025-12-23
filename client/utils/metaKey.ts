import { isMac } from './device';

/**
 * A string representing the meta key name used in keyboard shortcuts.
 * - `'Cmd'` on macOS
 * - `'Ctrl'` on other platforms
 */
const metaKey: string = isMac() ? 'Cmd' : 'Ctrl';

/**
 * A user-friendly symbol or label representing the meta key for display purposes.
 * - `'⌘'` on macOS
 * - `'Ctrl'` on other platforms
 */
const metaKeyName: string = isMac() ? '⌘' : 'Ctrl';

export { metaKey, metaKeyName };
