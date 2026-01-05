import { defineConfig } from 'playwright/test';

export default defineConfig({
  timeout: 60_000, // Boost default timeout to 60 seconds (default is 30 seconds)
  expect: {
    timeout: 15_000, // Boost default expect timeout to 15 seconds (default is 5 seconds)
  },
  retries: 1, // Retry failed tests once to account for flakiness
});
