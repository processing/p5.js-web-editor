/**
 * generate short slug for a given string
 * that can be used as a valid file name
 * in all operating systems
 * @param {String} string
 * @param {String} replacer (optional) character to replace invalid characters
 */
export function generateSlug(string, replacer) {
  // from here  https://serverfault.com/a/242134
  const INVALID_CHARS_REGEX = /[*/?:\\<>|"\u0000-\u001F]/g;
  const slug = string.replace(INVALID_CHARS_REGEX, replacer || '');

  return slug;
}

export default generateSlug;
