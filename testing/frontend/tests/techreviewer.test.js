import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';
import { nodeBlipCases } from './data/nodeBlipCases';
import { directorateData } from './data/directorateData';

const extractNumber = phrase => {
  const match = phrase.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

// Function to intercept and mock the API call
const interceptAPICall = async ({ page }) => {
  // Function to intercept and mock the API radarData call
  const interceptAPIJsonCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/tech-radar/json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(radarData),
      });
    });
  };

  // Function to intercept and mock the API csvData call
  const interceptAPICSVCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(csvData),
      });
    });
  };

  const interceptAPIDirectoratesCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/directorates/json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(directorateData),
      });
    });
  };

  await interceptAPIJsonCall({ page });
  await interceptAPICSVCall({ page });
  await interceptAPIDirectoratesCall({ page });
  await page.goto('http://localhost:3000/review/dashboard');

  // Clear all cookies
  await page.context().clearCookies();

  // Set a dummy authentication cookie to simulate logged-in user
  await page.context().addCookies([
    {
      name: 'githubUserToken',
      value: 'dummy-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await page.reload();
};

test.describe('Check technologies and project count available under Tech Reviewer', () => {
  for (const { name, heading, projects, projectsCountText } of nodeBlipCases) {
    test(`Check projects under ${name}`, async ({ page }) => {
      await interceptAPICall({ page });
      const reviewerDashboardText = await page.getByRole('heading', {
        name: 'Reviewer Dashboard',
      });
      await expect(reviewerDashboardText).toBeVisible();

      // Click on Show Project Count Button
      const toggleProjectCountButton = page.getByRole('button', {
        name: 'Toggle Project Count',
      });
      await toggleProjectCountButton.click();

      // Click on the respective technology heading to expand
      await page.getByText(heading, { exact: true }).click();

      // Verify the number of projects displayed matches expected projects and count
      for (const project of projects) {
        const noOfProjects = page.getByText(projectsCountText);
        await expect(noOfProjects).toBeVisible();
        await expect(page.getByText(project, { exact: true })).toBeVisible();
      }
    });
  }
});
