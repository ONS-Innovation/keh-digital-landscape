import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';
import { cloudBlipCases } from './data/cloudBlipCases';

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
  await interceptAPIJsonCall({ page });
  await interceptAPICSVCall({ page });
  await page.goto('http://localhost:3000/radar');

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

test.describe('Check projects available under cloud infrastructure', () => {
  for (const {
    name,
    blipNumber,
    heading,
    projects,
    projectsCountText,
  } of cloudBlipCases) {
    test(`Check projects under ${name}`, async ({ page }) => {
      await interceptAPICall({ page });
      const radarInfrastructureText = await page.locator('text', {
        hasText: 'Infrastructure',
      });
      const blip = await page.locator('text', { hasText: blipNumber });
      await expect(radarInfrastructureText).toHaveClass(/quadrant-label-text/);
      await expect(blip).toHaveClass(/blip-number/);

      await page
        .locator('g')
        .filter({ hasText: blipNumber })
        .locator('circle')
        .first()
        .click();

      const blipInfo = page.getByRole('heading', { name: heading });
      const noOfProjects = page.getByText(projectsCountText);

      await expect(blipInfo).toBeVisible();
      await expect(noOfProjects).toBeVisible();

      for (const project of projects) {
        await expect(page.getByText(project)).toBeVisible();
      }
    });
  }

  test('Oracle Project does not appear under AWS or GCP blips', async ({
    page,
  }) => {
    await interceptAPICall({ page });

    // Click AWS blip
    await page
      .locator('g')
      .filter({ hasText: '1' })
      .locator('circle')
      .first()
      .click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();

    // Click GCP blip
    await page
      .locator('g')
      .filter({ hasText: '2' })
      .locator('circle')
      .first()
      .click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();
  });

  test('No Oracle blip is present', async ({ page }) => {
    await interceptAPICall({ page });

    // Try to find a blip with text 'Oracle' or blip number '3' (if that would be Oracle)
    const oracleBlip = page.locator('text', { hasText: 'Oracle' });
    await expect(oracleBlip).toHaveCount(0);

    // Or, if you use blip numbers:
    const blip3 = page.locator('text', { hasText: '3' });
    await expect(blip3).toHaveCount(0);
  });
});
