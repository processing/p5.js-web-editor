import { p5Versions } from './p5Versions';

/** Display / sort label used when the sketch does not use a single known CDN version. */
export const CUSTOM_P5_VERSION = 'Custom';

const P5_SCRIPT_SRC_PATTERNS = [
  /https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/p5\.js\/([^/]+)\/p5\.(?:min\.)?js/g,
  /https?:\/\/cdn\.jsdelivr\.net\/npm\/p5@([^/]+)\/lib\/p5\.(min\.)?js/g
];

const knownVersions = new Set(
  p5Versions.map((v) => (typeof v === 'string' ? v : v.version))
);

/**
 * Detect the p5.js library version from an index.html source string.
 * Matches the editor VersionPicker behavior: only a single recognized CDN
 * version resolves to that version string; otherwise returns "Custom".
 *
 * @param {string | null | undefined} html
 * @returns {string}
 */
export function detectP5VersionFromHtml(html) {
  if (!html || typeof html !== 'string') {
    return CUSTOM_P5_VERSION;
  }

  const found = [];

  P5_SCRIPT_SRC_PATTERNS.forEach((pattern) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match = regex.exec(html);
    while (match !== null) {
      if (knownVersions.has(match[1])) {
        found.push(match[1]);
      }
      match = regex.exec(html);
    }
  });

  if (found.length === 1) {
    return found[0];
  }

  return CUSTOM_P5_VERSION;
}

/**
 * Detect p5.js version from a project files array.
 *
 * @param {Array<{ name?: string, content?: string }> | null | undefined} files
 * @returns {string}
 */
export function detectP5VersionFromFiles(files) {
  if (!Array.isArray(files)) {
    return CUSTOM_P5_VERSION;
  }

  const indexFile = files.find((file) => file && file.name === 'index.html');
  return detectP5VersionFromHtml(indexFile && indexFile.content);
}

/**
 * Compare two p5 version labels for sorting.
 * Numeric semver-ish compare for known versions; "Custom" sorts last.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareP5Versions(a, b) {
  if (a === b) {
    return 0;
  }
  if (a === CUSTOM_P5_VERSION) {
    return 1;
  }
  if (b === CUSTOM_P5_VERSION) {
    return -1;
  }

  const partsA = String(a)
    .split('.')
    .map((part) => Number(part) || 0);
  const partsB = String(b)
    .split('.')
    .map((part) => Number(part) || 0);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (partsA[i] || 0) - (partsB[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}
