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

test('Technology cards show coloured border for directorate-specific positions', async ({
  page,
}) => {
  await interceptAPICall({ page });

  // 'technology-name': {
  //  'ring': [
  //      'directorate-1',
  //      'directorate-2',
  //  ]
  //}

  const techPositionMap = {};
  for (const dir of Object.keys(reviewPositionCases)) {
    const positions = reviewPositionCases[dir];
    for (const position of Object.keys(positions)) {
      for (const techId of positions[position]) {
        if (!techPositionMap[techId]) techPositionMap[techId] = {};
        if (!techPositionMap[techId][position]) {
          techPositionMap[techId][position] = new Set();
        }
        techPositionMap[techId][position].add(dir);
      }
    }
  }

  const directorateSelect = page.locator('#directorate-select');

  for (const dir of Object.keys(reviewPositionCases)) {
    await directorateSelect.selectOption(dir);

    const positions = reviewPositionCases[dir];
    for (const position of Object.keys(positions)) {
      for (const techId of positions[position]) {
        // Directorate-specific if only this directorate has tech in this position
        const isDirectorateSpecific =
          techPositionMap[techId] &&
          techPositionMap[techId][position] &&
          techPositionMap[techId][position].size === 1;

        if (!isDirectorateSpecific) continue;

        // Use attribute selector so techIds with "/" etc. don't break CSS
        const safeDomId = `technology-${techId}`;
        const card = page.locator(`[id="${safeDomId}"]`);
        await expect(card).toBeVisible();

        // Read computed border colour & width
        const borderInfo = await card.evaluate(el => {
          const style = window.getComputedStyle(el);
          const color = style.borderLeftColor || style.borderColor;
          const width = style.borderLeftWidth || style.borderWidth;
          return {
            borderColor: color,
            borderWidth: width,
          };
        });

        const { borderColor, borderWidth } = borderInfo;

        // Border should exist and be non-transparent
        expect(borderWidth).not.toBe('0px');
        expect(borderColor).not.toMatch(
          /transparent|rgba\(0,\s*0,\s*0,\s*0\)/i
        );

        // Resolve expected directorate highlight color from directorateData for the currently selected directorate (dir)
        const dirList = directorateData?.directorates ?? [];
        const expectedDir = dirList.find(
          d => String(d.id) === String(dir) || d.name === dir
        );

        const expectedColorRaw = expectedDir?.color;

        // Normalize expected color to computed rgb(...) to compare with getComputedStyle value
        const normalizeToRgb = color => {
          if (!color) return null;
          // Already rgb/rgba
          if (/^rgb(a)?\(/i.test(color)) return color.toLowerCase();
          // Hex (#rrggbb or #rgb)
          const hex = color.replace('#', '').toLowerCase();
          const to255 = h => parseInt(h.length === 1 ? h + h : h, 16);
          const r = to255(hex.length === 3 ? hex[0] : hex.slice(0, 2));
          const g = to255(hex.length === 3 ? hex[1] : hex.slice(2, 4));
          const b = to255(hex.length === 3 ? hex[2] : hex.slice(4, 6));
          return `rgb(${r}, ${g}, ${b})`;
        };

        const expectedBorderColor = normalizeToRgb(expectedColorRaw);

        // If we have an expected color, assert it; otherwise just assert a non-transparent border exists
        if (expectedBorderColor) {
          expect(borderColor.toLowerCase()).toBe(expectedBorderColor);
        } else {
          expect(borderColor).not.toMatch(
            /transparent|rgba\(0,\s*0,\s*0,\s*0\)/i
          );
        }

        // Optional: specific check for R by tech id, but using directorateData color instead of hardcoded
        if (techId.toLowerCase() === 'test-r' || techId.toLowerCase() === 'r') {
          expect(borderWidth).toBe('2px');
          if (expectedBorderColor) {
            expect(borderColor.toLowerCase()).toBe(expectedBorderColor);
          }
        }

        if (techId.toLowerCase() === 'test-pl/sql') {
          expect(borderWidth).toBe('2px');
          if (expectedBorderColor) {
            expect(borderColor.toLowerCase()).toBe(expectedBorderColor);
          }
        }
      }
    }
  }
});
