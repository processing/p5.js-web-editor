/** Returns the env var's value, or throws if it is missing or empty —
 * so the constants below are `string`, not `string | undefined`. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env.e2e. Make sure it is set.`);
  }
  return value;
}

/** Test-user constants from .env.e2e (loaded by playwright.config.ts). */
export const usernamePrefix = requireEnv('E2E_TEST_USERNAME_PREFIX');
export const emailSuffix = requireEnv('E2E_TEST_EMAIL_SUFFIX');
export const password = requireEnv('E2E_TEST_PASSWORD');
