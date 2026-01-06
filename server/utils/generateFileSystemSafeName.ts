/**
 * generate file system safe string for a given name
 * that can be used as a valid file name
 * in all operating systems
 * @param {String} originalName
 * @param {String} replacer (optional) character to replace invalid characters
 */
export function generateFileSystemSafeName(
  originalName: string,
  replacer: string
) {
  // from here  https://serverfault.com/a/242134
  const INVALID_CHARS_REGEX = /[*/?:\\<>|"\u0000-\u001F]/g; // eslint-disable-line
  const slug = originalName.replace(INVALID_CHARS_REGEX, replacer || '');

  return slug;
}
