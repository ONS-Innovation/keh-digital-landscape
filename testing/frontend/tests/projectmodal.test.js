import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';
import { directorateData } from './data/directorateData';

/**
 * Adjust these to match your dataset & UI:
 * - TARGET_PROJECT_NAME should be the project item you click to open the modal.
 * - BLIP_TO_OPEN should be the blip you click first to reveal that project.
 *   (Use an id that already exists in your radar SVG like `g#blip-test-aws` or similar.)
 */
const TARGET_PROJECT_NAME = 'Empty Env Project';
const BLIP_TO_OPEN = 'g#blip-test-aws';

/**
 * Creates patched data so the target project shows empty fields,
 * which should render as "No Data Captured" in the modal.
 *
 * NOTE: Adapt the shape based on how your app pulls project data.
 * If your project modal is sourced primarily from csvData rows, patch there.
 * If it comes from radarData, patch there instead (or both).
 */
function makePatchedCsvData() {
  // Example patcher — adjust to your real csvData shape.
  // Common patterns:
  //  - csvData.rows: [{ Project, Environments, Miscellaneous, ... }]
  //  - csvData.projects: [{ name, Environments, Miscellaneous, ... }]
  const clone = JSON.parse(JSON.stringify(csvData));

  const patchRow = (row) => {
    // Match by project name (change key to your schema)
    if (
      row.Project?.trim() === TARGET_PROJECT_NAME ||
      row.name?.trim() === TARGET_PROJECT_NAME
    ) {
      row.Environments = '';        // triggers "No Data Captured"
      row.Miscellaneous = '';       // also triggers "No Data Captured" in special block
    }
    return row;
  };

  if (Array.isArray(clone.rows)) {
    clone.rows = clone.rows.map(patchRow);
  }
  if (Array.isArray(clone.projects)) {
    clone.projects = clone.projects.map(patchRow);
  }

  return clone;
}

function makePatchedRadarData() {
  // Optional: If your modal’s project object is sourced from radarData,
  // patch it similarly here. This is a no-op unless you rely on radarData.
  const clone = JSON.parse(JSON.stringify(radarData));

  // Example (adjust for your schema):
  // if (Array.isArray(clone.projects)) {
  //   clone.projects = clone.projects.map(p => {
  //     if (p.name === TARGET_PROJECT_NAME) {
  //       return { ...p, Environments: '', Miscellaneous: '' };
  //     }
  //     return p;
  //   });
  // }

  return clone;
}

// Intercept & mock APIs the same way you do in your other tests
const interceptAPICall = async ({ page }) => {
  const patchedCsv = makePatchedCsvData();
  const patchedRadar = makePatchedRadarData();

  await page.route('**/api/tech-radar/json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(patchedRadar),
    });
  });

  await page.route('**/api/csv', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(patchedCsv),
    });
  });

  await page.route('**/api/directorates/json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(directorateData),
    });
  });

  await page.goto('http://localhost:3000/radar');

  // Clear cookies then set a dummy auth cookie to simulate a logged-in user
  await page.context().clearCookies();
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

test.describe('Project Modal - "No Data Captured" UI (Playwright)', () => {
  test('shows "No Data Captured" for empty fields in the modal', async ({ page }) => {
    await interceptAPICall({ page });

    // 1) Open a blip to reveal project list
    await page.locator(BLIP_TO_OPEN).locator('circle').first().click();

    // 2) Click the specific project to open the modal
    //    Adjust selector based on how the project is rendered (button, link, list item).
    //    Using getByText exact=true to avoid partial matches.
    await page.getByText(TARGET_PROJECT_NAME, { exact: true }).click();

    // 3) Assert group title is visible (modal content)
    await expect(page.getByText('Infrastructure & Deployment')).toBeVisible();

    // 4) Assert the Environments field label is present
    await expect(page.getByText('Environments:')).toBeVisible();

    // 5) Assert the fallback text is shown
    await expect(page.getByText(/no data captured/i)).toBeVisible();

    // 6) Also check the special "Miscellaneous" block shows fallback
    await expect(page.getByText('Miscellaneous:')).toBeVisible();
    // Multiple instances likely (Environments + Miscellaneous)
    await expect(page.getByText(/no data captured/i)).toBeVisible();
  });

  test('search within modal still shows "No Data Captured" field when filtering by label', async ({ page }) => {
    await interceptAPICall({ page });

    // Open blip and project modal
    await page.locator(BLIP_TO_OPEN).locator('circle').first().click();
    await page.getByText(TARGET_PROJECT_NAME, { exact: true }).click();

    // Type in the modal’s search box
    const searchInput = page.getByPlaceholder('Search project details...');
    await searchInput.fill('environments');

    // Should still see the label + fallback
    await expect(page.getByText('Environments:')).toBeVisible();
    await expect(page.getByText(/no data captured/i)).toBeVisible();
  });

  test('collapsing the group hides label and fallback, expanding shows them again', async ({ page }) => {
    await interceptAPICall({ page });

    // Open blip and project modal
    await page.locator(BLIP_TO_OPEN).locator('circle').first().click();
    await page.getByText(TARGET_PROJECT_NAME, { exact: true }).click();

    const infraHeader = page.getByText('Infrastructure & Deployment');

    // Collapse
    await infraHeader.click();
    await expect(page.getByText('Environments:')).not.toBeVisible();
    await expect(page.getByText(/no data captured/i)).not.toBeVisible();

    // Expand
    await infraHeader.click();
    await expect(page.getByText('Environments:')).toBeVisible();
    await expect(page.getByText(/no data captured/i)).toBeVisible();
  });
});
