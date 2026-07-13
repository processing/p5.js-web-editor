import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

const baseURL = process.env.EDITOR_URL || 'http://localhost:9000';
// Mailpit's default HTTP API port; SMTP is on :1025 (see server/utils/mail.ts)
const mailPitBaseURL = 'http://localhost:8025';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Drops the e2e database before each run so tests start from a clean slate */
  globalSetup: './e2e/global-setup',
  /* Timeout per individual test (w/ before & after hooks). Make CI longer than default 30s to accomodate */
  timeout: process.env.CI ? 60_000 : 30_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /**
   * Servers auto-started before the tests (reused if already running):
   *
   * 1. Mailpit — local mail catcher for signup/verification emails, on its
   *    default ports. Requires the binary locally (`brew install mailpit`);
   *    on CI an already-running service container is reused instead.
   * 2. The app — started with .env.e2e config on dedicated ports (9000/9002),
   *    so reuseExistingServer can never latch onto a regular dev server on
   *    8000 (which would point at the real dev database and Mailgun).
   *    First start compiles webpack from scratch, hence the long timeout.
   */
  webServer: [
    {
      name: 'Mailpit',
      command: 'mailpit',
      url: `${mailPitBaseURL}/api/v1/info`,
      reuseExistingServer: true,
      timeout: 15_000
    },
    {
      name: 'App server',
      command: 'npm run start',
      env: { ENV_FILE: '.env.e2e' },
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
      stdout: 'pipe'
    }
  ],

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] }
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] }
    // }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ]
});
