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
  await page.pause();

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
      // Check whether the page has loaded the Tech Radar page
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
        await expect(page.getByText(project, { exact: true })).toBeVisible();
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
      .filter({ hasText: '3' }) // We need to change these so they come from cloudBlipCases.js
      .locator('circle')
      .first()
      .click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();

    // Click GCP blip
    await page
      .locator('g')
      .filter({ hasText: '4' }) // We need to change these so they come from cloudBlipCases.js
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
    const blip40 = page.locator('text', { hasText: '40' });
    await expect(blip40).toHaveCount(0);
  });
});

// Multiple Directorate Support

test('Check that directorate dropdown is present and has expected options', async ({ page }) => {
  await interceptAPICall({ page });

  // Check that the directorate selector is present
  const directorateSelector = page.getByRole('combobox', {
    name: 'Select directorate',
  });
  await expect(directorateSelector).toBeVisible();

  // Check that all the directorates are present
  const options = await directorateSelector.locator('option').all();
  const optionValues = await Promise.all(options.map(option => option.getAttribute('value')));
  const expectedValues = ['Digital Services', 'Data Science', 'DGO'];

  expect(optionValues).toEqual(expectedValues);

  // Check that the default selected option is Digital Services
  const selectedValue = await directorateSelector.inputValue();
  expect(selectedValue).toBe('Digital Services');
});

test('Check that R appears in trial for all directorates and in adopt for Data Science only', async ({ page }) => {
  await interceptAPICall({ page });

  // Check that R is present
  const blipR = await page.locator('text', { hasText: '2' });
  await expect(blipR).toHaveCount(1);

  // Check that R is in trial for Digital Services
  const blipRContainer = page.locator('g').filter({ hasText: '2' });
  const blipRCircle = blipRContainer.locator('circle').first();

  // To do this, the circle should have the trial class
  await expect(blipRCircle).toHaveClass(/trial/);

  // Change to Data Science directorate
  await page.getByRole('combobox').selectOption('Data Science');

  // Check that R is in adopt for Data Science
  const blipRContainerDS = page.locator('g').filter({ hasText: '2' });
  const blipRCircleDS = blipRContainerDS.locator('circle').first();

  // To do this, the circle should have the adopt class
  await expect(blipRCircleDS).toHaveClass(/adopt/);

  // Change to another directorate (DGO)
  // This is to check that DGO inherits the Digital Services position
  await page.getByRole('combobox').selectOption('DGO');

  // Check that R is in trial for DGO
  const blipRContainerDGO = page.locator('g').filter({ hasText: '2' });
  const blipRCircleDGO = blipRContainerDGO.locator('circle').first();

  // To do this, the circle should have the trial class
  await expect(blipRCircleDGO).toHaveClass(/trial/);
});

// TODO: Fix and enable this test

// test('Check that C is not on the radar for Digital Services and DGO, but is in adopt for Data Science', async ({ page }) => {
//   await interceptAPICall({ page });

//   // Check that C is not present for Digital Services
//   const blipC = await page.locator('text', { hasText: 'C' });
//   await expect(blipC).toHaveCount(0);

//   // Change to Data Science directorate
//   await page.getByRole('combobox').selectOption('Data Science');

//   // Check that C is present for Data Science
//   const blipC_DS = await page.locator('text', { hasText: 'C' });
//   await expect(blipC_DS).toHaveCount(1);

//   // Check that C is in adopt for Data Science
//   const blipCContainerDS = page.locator('g').filter({ hasText: 'C' });
//   const blipCCircleDS = blipCContainerDS.locator('circle').first();

//   // To do this, the circle should have the adopt class
//   await expect(blipCCircleDS).toHaveClass(/adopt/);

//   // Change to another directorate (DGO)
//   // This is to check that DGO inherits the Digital Services position
//   await page.getByRole('combobox').selectOption('DGO');

//   // Check that C is not present for DGO
//   const blipC_DGO = await page.locator('text', { hasText: 'C' });
//   await expect(blipC_DGO).toHaveCount(0);
// });
