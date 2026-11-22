/**
 * Base URL of the editor (e.g. https://editor.p5js.org), for links in emails,
 * redirects and OAuth callbacks.
 *
 * Always taken from EDITOR_URL, never from the request's Host header: that
 * header is client-controlled, so an attacker could otherwise get a genuine
 * reset or confirmation email sent whose link points at their own site.
 *
 * Trailing slashes are stripped so callers can append `/path` safely.
 * Throws if EDITOR_URL is unset rather than producing an `undefined/...` link.
 */
export function getEditorUrl(): string {
  const editorUrl = process.env.EDITOR_URL;
  if (!editorUrl) {
    throw new Error('EDITOR_URL missing from environment');
  }
  return editorUrl.replace(/\/+$/, '');
}
