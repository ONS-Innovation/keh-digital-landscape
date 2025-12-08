import { test, expect } from 'playwright/test';
import { csvData } from './data/projectTechnology';

// Group definitions from ProjectModal.js
const groups = {
  languages: ['Language_Main', 'Language_Others', 'Language_Frameworks'],
  infrastructure: [
    'Infrastructure',
    'CICD',
    'Hosted',
    'Architectures',
    'Environments',
    'Publishing_Target',
  ],
  security: ['Source_Control'],
  quality: [],
  data: ['Datastores', 'Database_Technologies'],
  integrations: [],
  general: [
    'Project_Tools',
    'Code_Editors',
    'Communication',
    'Collaboration',
    'Incident_Management',
    'Documentation_Tools',
    'UI_Tools',
    'Diagram_Tools',
    'Miscellaneous',
  ],
  repos: ['Repo'],
};

// Translations for group titles
const groupTranslations = {
  languages: 'Languages & Frameworks',
  infrastructure: 'Infrastructure & Deployment',
  security: 'Security & Source Control',
  quality: 'Quality & Monitoring',
  data: 'Data Management',
  integrations: 'Integrations',
  general: 'General Information',
  repos: 'Repositories',
};

// Function to intercept and mock the API call
const interceptAPICall = async ({ page }) => {
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

  await interceptAPICSVCall({ page });
  await page.goto('http://localhost:3000/projects');

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

test.describe('Projects Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAPICall({ page });
  });

  for (let i = 0; i < csvData.length; i++) {
    test(`Test that ${csvData[i].Project}'s modal displays correct data`, async ({
      page,
    }) => {
      const projectItem = page.locator(csvData[i].ID);
      await expect(projectItem).toBeVisible();
      await projectItem.click();

      for (const [groupKey, fields] of Object.entries(groups)) {
        for (const field of fields) {
          const groupId = groupTranslations[groupKey]
            .toLowerCase()
            .replace(/[ _]/g, '-')
            .replace(/[^a-z0-9\-_]/g, '\\$&');
          const fieldId = field
            .toLowerCase()
            .replace(/[ _]/g, '-')
            .replace(/[^a-z0-9\-_]/g, '\\$&');
          const detailItem = page.locator(`#detail-${groupId}-${fieldId}`);

          const contents = detailItem.locator('p').first();

          // Some of the technology fields in the frontend modal do not exist in the CSV data
          // These should be treated as 'No data captured' for testing purposes
          // We log these instances for future reference

          // TODO: Should these fields exist in the frontend if they never get any data?
          if (csvData[i][field] === undefined) {
            await expect(contents).toHaveText('No data captured');
            continue;
          }

          if (csvData[i][field] === '') {
            await expect(contents).toHaveText('No data captured');
          } else if (field === 'Miscellaneous') {
            const miscItems = detailItem.locator('.misc-item');
            const miscData = csvData[i][field]
              .split(';')
              .map(item => item.trim());

            const miscCount = await miscItems.count();
            await expect(miscCount).toBe(miscData.length);

            // This for loop will only check the first half of the misc items to avoid duplicates
            for (let i = 0; i < miscCount; i++) {
              // Remove the space after the colon for comparison
              await expect(miscItems.nth(i)).toHaveText(
                miscData[i].replace(': ', ':')
              );
            }
          } else if (field === 'Repo') {
            // TODO: Implement repository list testing
            // TODO: Make repository list in the modal have a placeholder if No data
            continue;
          } else {
            await expect(contents).toHaveText(csvData[i][field]);
          }
        }
      }
    });
  }
});
