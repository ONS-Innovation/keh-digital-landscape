import { defineConfig } from 'playwright/test';

export default defineConfig({
  timeout: 60_000, // Boost default timeout to 60 seconds (default is 30 seconds)
  expect: {
    timeout: 30_000, // Boost default expect timeout to 30 seconds (default is 5 seconds)
  },
  retries: 2, // Retry failed tests twice to account for flakiness
});
