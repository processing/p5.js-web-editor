const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8000',
    headless: true,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8000',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});