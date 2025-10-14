import { test, expect } from 'playwright/test';
import { directorateData } from './data/directorateData';
import { csvData } from './data/csvData';

const setupRoutes = async ({ page, radarStatus = 500 }) => {
  await page.route('**/api/directorates/json', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(directorateData),
    });
  });

  await page.route('**/api/csv', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(csvData),
    });
  });

  await page.route('**/api/tech-radar/json', async route => {
    await route.fulfill({
      status: radarStatus,
      contentType: 'application/json',
      body: JSON.stringify({ error: `Forced ${radarStatus} error for test` }),
    });
  });
};

test.describe('Error toast appears on failed requests', () => {
  for (const status of [400, 500]) {
    test(`shows toast when radar JSON request returns ${status}`, async ({
      page,
    }) => {
      await setupRoutes({ page, radarStatus: status });
      await page.goto('http://localhost:3000/radar');

      // Expect our custom error toast to appear with a sensible message
      const toast = page.locator('.error-toast');
      await expect(toast.first()).toBeVisible();
      await expect(
        toast.filter({ hasText: 'An error occurred' }).first()
      ).toBeVisible();
      await expect(
        toast
          .filter({ hasText: `Request failed with status ${status}` })
          .first()
      ).toBeVisible();
    });
  }
});
