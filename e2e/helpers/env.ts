/** Returns the env var's value, or throws if it is missing or empty —
 * so the constants below are `string`, not `string | undefined`. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env.e2e. Make sure it is set.`);
  }
  return value;
}

/**
 * Test-user constants from .env.e2e (loaded by playwright.config.ts).
 * Lazy (functions, not eager consts): playwright.config.ts also imports
 * requireEnv from this file (via mailpit.ts, for the Mailpit webServer
 * command), and CommonJS runs a module's whole body on import regardless of
 * which export is used — eager consts here would call requireEnv before
 * loadEnv() has loaded .env.e2e.
 */
export const usernamePrefix = () => requireEnv('E2E_TEST_USERNAME_PREFIX');
export const emailSuffix = () => requireEnv('E2E_TEST_EMAIL_SUFFIX');
export const password = () => requireEnv('E2E_TEST_PASSWORD');
