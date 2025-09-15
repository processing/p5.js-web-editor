import { isTestEnvironment } from './checkTestEnv';

/**
 * Function to retrieve env vars, with no error handling.
 * @returns String value of env variable or undefined if not found.
 */
export function getEnvVar(key: string): string | undefined {
  const configSource = global ?? window;
  const env = configSource?.process?.env ?? {};

  return env[key];
}

interface GetConfigOptions {
  warn?: boolean;
  nullishString?: boolean;
}

const DEFAULT_GET_CONFIG_OPTIONS: GetConfigOptions = {
  warn: !isTestEnvironment,
  nullishString: false
};

/**
 * Returns a string config value from environment variables.
 * Logs a warning if the value is missing, if `warn` is true in options
 *
 * @param key - The environment variable key to fetch.
 * @param options - Optional settings:
 *   - `warn`: whether to warn if the value is missing (default `true` unless in test env).
 *   - `nullishString`: if true, returns `''` instead of `undefined` when missing.
 * @returns String value of the env var, or `''` or `undefined` if missing.
 */
export function getConfig(
  key: string,
  options: GetConfigOptions = {}
): string | undefined {
  if (!key) {
    throw new Error('"key" must be provided to getConfig()');
  }

  // override default options with param options
  const { warn, nullishString } = {
    ...DEFAULT_GET_CONFIG_OPTIONS,
    ...options
  };

  const value = getEnvVar(key);

  // value == null when the key is not present in the env file
  // value === '' when the key is present but is empty (eg. TEST_CONFIG_VALUE=)
  if (value == null || value === '') {
    const notFoundMessage = `getConfig("${key}") returned null or undefined`;

    // warn or continue if no value found:
    if (warn) {
      console.warn(notFoundMessage);
    }
    return nullishString ? '' : undefined;
  }

  return value;
}
