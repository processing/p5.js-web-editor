/**
 * Returns config item from environment
 */
export default function getConfig(key) {
  if (key == null) {
    throw new Error('"key" must be provided to getConfig()');
  }

  const __process = (typeof global !== 'undefined' ? global : window).process;
  const value = __process.env[key];

  if (value == null) {
    console.warn(`getConfig("${key}") returned null`);
  }

  return value;
}
