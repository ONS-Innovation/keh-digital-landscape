import { defineConfig } from 'playwright/test';

export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000, // Increase default test timeout to 60 seconds on CI (default is 30 seconds)
  expect: {
    timeout: process.env.CI ? 30_000 : 5_000, // Boost default expect timeout to 30 seconds on CI (default is 5 seconds)
  },
  retries: process.env.CI ? 2 : 0, // Retry failed tests twice on CI to account for flakiness

  workers: process.env.CI ? 1 : undefined, // Limit to 1 worker on CI for stability
});
