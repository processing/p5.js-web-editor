import { defineConfig, devices } from '@playwright/test';

// DO NOT REMOVE: makes sure that playwright is always run with the e2e env overrides. See loadEnv.js
process.env.APP_ENV = 'e2e';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./loadEnv')();

const EDITOR_URL = process.env.EDITOR_URL || 'http://localhost:9000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
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
    baseURL: EDITOR_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      name: 'app (e2e env)',
      command: 'npm run start:e2e',
      url: EDITOR_URL,
      /** CI > e2e.yml starts up the e2e app server separately for more logging */
      reuseExistingServer: true,
      /** stream the app server's startup logs into the terminal running Playwright */
      stdout: 'pipe',
      stderr: 'pipe',
      /** First start compiles webpack from scratch, hence the long timeout. */
      timeout: 180_000
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
