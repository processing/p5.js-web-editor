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
