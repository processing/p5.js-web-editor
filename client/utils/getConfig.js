function isTestEnvironment() {
  // eslint-disable-next-line no-use-before-define
  return getConfig('NODE_ENV', { warn: false }) === 'test';
}

/**
 * Returns config item from environment
 */
function getConfig(key, options = { warn: !isTestEnvironment() }) {
  if (key == null) {
    throw new Error('"key" must be provided to getConfig()');
  }

  const env =
    (typeof global !== 'undefined' ? global : window)?.process?.env || {};
  const value = env[key];

  if (value == null && options?.warn !== false) {
    console.warn(`getConfig("${key}") returned null`);
  }

  return value;
}

export default getConfig;
