import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';
import { reviewPositionCases } from './data/reviewPositionCases';
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

test('Check technologies appear in the correct areas for different directorates', async ({
  page,
}) => {
  await interceptAPICall({ page });

  // Get the directorate select element
  const directorateSelect = page.locator('#directorate-select');

  for (const directorate of Object.keys(reviewPositionCases)) {
    // Select the directorate
    await directorateSelect.selectOption(directorate);

    // Get the expected positions for this directorate
    const expectedPositions = reviewPositionCases[directorate];

    for (const position of Object.keys(expectedPositions)) {
      const expectedTechnologies = expectedPositions[position];

      // Get the technologies in this position
      const technologyContainer = page.locator(`.${position}-box`);
      const technologyElements = technologyContainer.locator(`.draggable-item`);
      const technologyIds = await technologyElements.evaluateAll(elements =>
        elements.map(el => el.id)
      );

      for (const techId of expectedTechnologies) {
        // Check that the technology is present in this position
        expect(technologyIds).toContain(`technology-${techId}`);
      }
    }
  }
});
