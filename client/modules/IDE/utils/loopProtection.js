export const NO_PROTECT_REGEX = /^\s*<!--\s*noprotect\s*-->\s*\n?/m;

export function hasNoProtect(src = '') {
  return NO_PROTECT_REGEX.test(src);
}

export function addNoProtect(src = '') {
  if (hasNoProtect(src)) return src;
  return `<!-- noprotect -->\n${src}`;
}

export function removeNoProtect(src = '') {
  return src.replace(NO_PROTECT_REGEX, '');
}

export function toggleLoopProtection(src = '', enabled) {
  return enabled ? removeNoProtect(src) : addNoProtect(src);
}

// Version/addon HTML rewrites serialize via documentElement.outerHTML, which
// drops comments outside <html> — including a leading <!-- noprotect -->.
export function preserveNoProtect(originalSrc = '', serializedSrc = '') {
  return hasNoProtect(originalSrc)
    ? addNoProtect(serializedSrc)
    : serializedSrc;
}
