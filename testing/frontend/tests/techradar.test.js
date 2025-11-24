import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';
import { nodeBlipCases } from './data/nodeBlipCases';
import { directorateData } from './data/directorateData';

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

test.describe('Check projects available under Tech Radar', () => {
  for (const {
    name,
    blipNumber,
    techId,
    heading,
    projects,
    projectsCountText,
  } of nodeBlipCases) {
    test(`Check projects under ${name}`, async ({ page }) => {
      await interceptAPICall({ page });
      const radarInfrastructureText = await page.locator('text', {
        hasText: 'Infrastructure',
      });
      const blip = await page.locator('text', { hasText: blipNumber });
      // Check whether the page has loaded the Tech Radar page
      await expect(radarInfrastructureText).toHaveClass(/quadrant-label-text/);
      await expect(blip).toHaveClass(/blip-number/);
      await page.locator(`g#blip-${techId}`).locator('circle').first().click();

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
    await page.locator('g#blip-test-aws').locator('circle').first().click();
    await expect(page.getByText('Oracle Project')).not.toBeVisible();

    // Click GCP blip
    await page.locator('g#blip-test-gcp').locator('circle').first().click();
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

test('Check that directorate dropdown is present and has expected options', async ({
  page,
}) => {
  await interceptAPICall({ page });

  // Check that the directorate selector is present
  const directorateSelector = page.locator('select#directorate-select');
  await expect(directorateSelector).toBeVisible();

  // Check that all the directorates are present
  const options = await directorateSelector.locator('option').all();
  const optionValues = await Promise.all(
    options.map(option => option.getAttribute('value'))
  );
  const optionTexts = await Promise.all(
    options.map(option => option.textContent())
  );

  const expectedValues = ['0', '1', '2'];

  const expectedOptionTexts = [
    'Digital Services (DS)',
    'Data Science Campus (DSC)',
    'Data Growth and Operations (DGO)',
  ];

  expect(optionValues).toEqual(expectedValues);
  expect(optionTexts).toEqual(expectedOptionTexts);

  // Check that the default selected option is Digital Services (the default set in directorateData.js)
  const selectedValue = await directorateSelector.inputValue();
  expect(selectedValue).toBe('0');
});

test('Check that R appears in trial for all directorates and in adopt for Data Science only', async ({
  page,
}) => {
  await interceptAPICall({ page });

  // Check that R is present
  const blipR = await page.locator('text', { hasText: '2' });
  await expect(blipR).toHaveCount(1);

  // Check that R is in trial for Digital Services
  const blipRContainer = page.locator('g#blip-test-r');
  const blipRCircle = blipRContainer.locator('circle').first();

  // To do this, the circle should have the trial class
  await expect(blipRCircle).toHaveClass(/trial/);

  // Get directorate selector
  const directorateSelector = page.locator('select#directorate-select');

  // Change to Data Science directorate
  await directorateSelector.selectOption('Data Science Campus (DSC)');

  // Check that R is in adopt for Data Science
  const blipRContainerDS = page.locator('g#blip-test-r');
  const blipRCircleDS = blipRContainerDS.locator('circle').first();

  // To do this, the circle should have the adopt class
  await expect(blipRCircleDS).toHaveClass(/adopt/);

  // Change to another directorate (DGO)
  // This is to check that DGO inherits the Digital Services position
  await directorateSelector.selectOption('Data Growth and Operations (DGO)');

  // Check that R is in trial for DGO
  const blipRContainerDGO = page.locator('g#blip-test-r');
  const blipRCircleDGO = blipRContainerDGO.locator('circle').first();

  // To do this, the circle should have the trial class
  await expect(blipRCircleDGO).toHaveClass(/trial/);
});

test('Check that C# is not on the radar for Digital Services and DGO, but is in adopt for Data Science', async ({
  page,
}) => {
  await interceptAPICall({ page });

  // Get directorate selector
  const directorateSelector = page.locator('select#directorate-select');

  // Make sure we start with Digital Services
  await directorateSelector.selectOption('Digital Services (DS)');

  // Check that C# is not present for Digital Services
  const blipC = await page.locator('g#blip-test-Csharp');
  await expect(blipC).toHaveCount(0);

  // Change to Data Science directorate
  await directorateSelector.selectOption('Data Science Campus (DSC)');

  // Check that C# is present for Data Science
  const blipC_DS = await page.locator('g#blip-test-Csharp');
  await expect(blipC_DS).toHaveCount(1);

  // Check that C# is in adopt for Data Science
  const blipCContainerDS = page.locator('g#blip-test-Csharp');
  const blipCCircleDS = blipCContainerDS.locator('circle').first();

  // To do this, the circle should have the adopt class
  await expect(blipCCircleDS).toHaveClass(/adopt/);

  // Change to another directorate (DGO)
  // This is to check that DGO inherits the Digital Services position
  await directorateSelector.selectOption('Data Growth and Operations (DGO)');

  // Check that C# is not present for DGO
  const blipC_DGO = await page.locator('g#blip-test-Csharp');
  await expect(blipC_DGO).toHaveCount(0);
});

test('Verify that highlighted technologies appear in the list for each directorate', async ({
  page,
}) => {
  await interceptAPICall({ page });

  const directorateSelector = page.locator('select#directorate-select');

  //
  // 1. Data Science Campus (DSC) – R
  //
  await directorateSelector.selectOption({
    label: 'Data Science Campus (DSC)',
  });

  const rItemDSC = page.getByRole('listitem', { name: 'R, adopt ring' });

  await expect(rItemDSC).toHaveCSS('border-left-width', '4px');
  await expect(rItemDSC).toHaveCSS('border-left-style', 'solid');
  await expect(rItemDSC).toHaveCSS('border-left-color', 'rgb(255, 127, 14)');

  //
  // 2. Data Growth and Operations (DGO) – PL/SQL highlighted
  //
  await directorateSelector.selectOption({
    label: 'Data Growth and Operations (DGO)',
  });

  const plsqlItemDGO = page.getByRole('listitem', {
    name: 'PL/SQL, adopt ring',
  });

  await expect(plsqlItemDGO).toHaveCSS('border-left-width', '4px');
  await expect(plsqlItemDGO).toHaveCSS('border-left-style', 'solid');
  await expect(plsqlItemDGO).toHaveCSS('border-left-color', 'rgb(44, 160, 44)');
});

test('Verify that blips on the radar get highlighted', async ({ page }) => {
  await interceptAPICall({ page });

  await page.pause();
  const directorateSelector = page.locator('select#directorate-select');

  // 1. Select DSC (R is ADOPT and should be highlighted)
  await directorateSelector.selectOption({
    label: 'Data Science Campus (DSC)',
  });

  // Radar blip (circle) for R
  const rBlipCircleDSC = page.locator('g#blip-test-r circle').first();
  await expect(rBlipCircleDSC).toHaveClass(/adopt/);

  // List item for R (accessible name uses uppercase ring in aria-label)
  const rListItemDSC = page.getByRole('listitem', { name: /R, ADOPT ring/i });
  await expect(rListItemDSC).toBeVisible();

  // Highlight (border-left) should be present
  const rBorderPresentDSC = await rListItemDSC.evaluate(el => {
    const s = getComputedStyle(el);
    return s.borderLeftStyle !== 'none' && parseFloat(s.borderLeftWidth) > 0;
  });
  expect(rBorderPresentDSC).toBe(true);

  // 2. Switch to Digital Services (DS) (R becomes TRIAL, should lose highlight)
  await directorateSelector.selectOption({ label: 'Digital Services (DS)' });

  const rBlipCircleDS = page.locator('g#blip-test-r circle').first();
  await expect(rBlipCircleDS).toHaveClass(/trial/);

  const rListItemDS = page.getByRole('listitem', { name: /R, TRIAL ring/i });
  await expect(rListItemDS).toBeVisible();

  const rBorderPresentDS = await rListItemDS.evaluate(el => {
    const s = getComputedStyle(el);
    return s.borderLeftStyle !== 'none' && parseFloat(s.borderLeftWidth) > 0;
  });
  expect(rBorderPresentDS).toBe(false);

  // 3. Switch to DGO (R remains TRIAL, still not highlighted)
  await directorateSelector.selectOption({
    label: 'Data Growth and Operations (DGO)',
  });

  const rBlipCircleDGO = page.locator('g#blip-test-r circle').first();
  await expect(rBlipCircleDGO).toHaveClass(/trial/);

  const rListItemDGO = page.getByRole('listitem', { name: /R, TRIAL ring/i });
  await expect(rListItemDGO).toBeVisible();

  const rBorderPresentDGO = await rListItemDGO.evaluate(el => {
    const s = getComputedStyle(el);
    return s.borderLeftStyle !== 'none' && parseFloat(s.borderLeftWidth) > 0;
  });
  expect(rBorderPresentDGO).toBe(false);
});
