import { test, expect } from 'playwright/test';
import { csvData } from './data/projectTechnology';
import { mockRepositoryData } from './data/repositoryData';

// Group definitions from ProjectModal.js
const groups = {
  languages: [
    'Language_Main',
    'Language_Others',
    'Language_Frameworks',
    'Testing_Frameworks',
  ],
  infrastructure: [
    'Infrastructure',
    'CICD',
    'Cloud_Services',
    'Containers',
    'Hosted',
    'Architectures',
    'Environments',
    'Publishing_Target',
  ],
  security: ['IAM_Services', 'Source_Control', 'Branching_Strategy'],
  quality: ['Static_Analysis', 'Code_Formatter', 'Monitoring'],
  data: ['Datastores', 'Database_Technologies', 'Data_Output_Formats'],
  integrations: ['Integrations_ONS', 'Integrations_External'],
  general: [
    'Project_Area',
    'DST_Area',
    'Project_Tools',
    'Other_Tools',
    'Datasets_Used',
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
const interceptAPICall = async ({ page }, repositoryData = null) => {
  // Intercept and mock the CSV API response
  await page.route('**/api/csv', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(csvData),
    });
  });

  // Optionally intercept repository API if data is provided
  if (repositoryData !== null) {
    await page.route('**/api/repository/project/json*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(repositoryData),
      });
    });
  }

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

          if (csvData[i][field] === '' && field !== 'Repo') {
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
            continue;
          } else {
            await expect(contents).toHaveText(csvData[i][field]);
          }
        }
      }
    });
  }
});

test.describe('Repository Section Tests', () => {
  // Filter projects that have ONSDigital repos
  const onsDigitalProjects = csvData.filter(project =>
    project.Repo.includes('github.com/ONSDigital')
  );

  // Intercept API call for mock repository data
  test.beforeEach(async ({ page }) => {
    await interceptAPICall({ page }, mockRepositoryData);
  });

  test.describe('Tests for the repositories accordion', () => {
    test('Repositories accordion exists and is visible when a project with repos is clicked', async ({
      page,
    }) => {
      // Click on Sample Project 4 (which has ONSDigital repo)
      const projectItem = page.locator('#project-sample-project-4');
      await expect(projectItem).toBeVisible();
      await projectItem.click();

      // Check that Repositories accordion header exists
      const repoAccordion = page.locator('.accordion-header', {
        hasText: 'Repositories',
      });
      await expect(repoAccordion).toBeVisible();
    });

    test('Repositories accordion expands and collapses correctly', async ({
      page,
    }) => {
      // Click on Sample Project 4
      const projectItem = page.locator('#project-sample-project-4');
      await projectItem.click();

      // Wait for the accordion to appear
      const repoAccordion = page.locator('.accordion-header', {
        hasText: 'Repositories',
      });
      await expect(repoAccordion).toBeVisible();

      // Repositories should be expanded by default
      const repoGrid = page.locator('.repo-grid');
      await expect(repoGrid).toBeVisible();

      // Click to collapse
      await repoAccordion.click();
      await expect(repoGrid).not.toBeVisible();

      // Click to expand again
      await repoAccordion.click();
      await expect(repoGrid).toBeVisible();
    });
  });

  test.describe('Tests that utilise ONSDigital repository data', () => {
    // Loop through each project that has ONSDigital repos and test that it displays correct repo card details
    for (let i = 0; i < onsDigitalProjects.length; i++) {
      test(`${onsDigitalProjects[i].Project} displays correct repo card details`, async ({
        page,
      }) => {
        // Click on the project
        const projectItem = page.locator(onsDigitalProjects[i].ID);
        await expect(projectItem).toBeVisible();
        await projectItem.click();

        // Wait for repo grid to appear
        const repoGrid = page.locator('.repo-grid');
        await expect(repoGrid).toBeVisible();

        // Should have exactly the number of repo cards as the number of repositories
        // in mockRepositoryData for the respective project that has ONSDigital repos
        const repoCards = page.locator('.repo-card');
        const count = await repoCards.count();
        await expect(count).toBe(mockRepositoryData.repositories.length);

        // Verify the repo card has detailed information
        const firstCard = repoCards.first();

        // Check repo name exists
        const repoName = firstCard.locator('.repo-name');
        await expect(repoName).toBeVisible();

        // Check repo badges (visibility and archived status)
        const badges = firstCard.locator('.repo-badge');
        await expect(badges).toHaveCount(2);

        // Check language labels exist
        const languageLabels = firstCard.locator('.language-label');
        await expect(languageLabels).toHaveCount(
          mockRepositoryData.repositories[0].technologies.languages.length
        );

        // Check language bars exist
        const languageBars = firstCard.locator('.language-bar');
        await expect(languageBars).toHaveCount(
          mockRepositoryData.repositories[0].technologies.languages.length
        );
      });
    }
  });

  test.describe('Tests that utilise non-ONSDigital repository data', () => {
    test('Non-ONSDigital repos display without detailed information', async ({
      page,
    }) => {
      // Click on Sample Project 1 (which has non-ONSDigital repo)
      const projectItem = page.locator('#project-sample-project');
      await expect(projectItem).toBeVisible();
      await projectItem.click();

      // Wait for repo grid to appear
      const repoGrid = page.locator('.repo-grid');
      await expect(repoGrid).toBeVisible();

      // Should have at least one repo card (the non-ONSDigital one)
      const repoCards = page.locator('.repo-card');
      const count = await repoCards.count();
      await expect(count).toBeGreaterThan(0);

      // Check that the non-ONSDigital repo displays with basic info
      const firstCard = repoCards.first();
      await expect(firstCard).toBeVisible();

      // Should have a badge indicating it's from GitHub or GitLab
      const badge = firstCard.locator('.repo-badge');
      await expect(badge).toBeVisible();
    });
  });

  test.describe('Tests that utilise empty repository data', () => {
    test('Placeholder message appears when project.Repo is empty', async ({
      page,
    }) => {
      // Click on Sample Project 3 (which has empty Repo field)
      const projectItem = page.locator('#project-sample-project-3');
      await expect(projectItem).toBeVisible();
      await projectItem.click();

      // Expand repositories section if collapsed
      const repoAccordion = page.locator('.accordion-header', {
        hasText: 'Repositories',
      });
      await expect(repoAccordion).toBeVisible();

      // Check for placeholder message
      const placeholderMessage = page.locator('.repo-info-loading');
      await expect(placeholderMessage).toBeVisible();
      await expect(placeholderMessage).toContainText(
        'No repository information available'
      );
    });
  });
});
