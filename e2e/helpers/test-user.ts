import { requireEnv } from './require-env';

/** Test-user constants from .env.e2e (loaded by playwright.config.ts). */
export const usernamePrefix = () => requireEnv('E2E_TEST_USERNAME_PREFIX');
export const emailSuffix = () => requireEnv('E2E_TEST_EMAIL_SUFFIX');
export const password = () => requireEnv('E2E_TEST_PASSWORD');
