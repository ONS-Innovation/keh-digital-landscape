import { test, expect } from 'playwright/test';

const teamsDummyData = {
  frontend : {
    slug: 'frontend',
    name: 'Frontend Team',
    description: 'UI devs', 
    url: 'https://github.com/orgs/our-org/teams/frontend'
  } ,
}

const interceptAPICall = async({ page }) => {
  // Intercept and mock the teams API response with teamsDummyData
  await page.route('**/copilot/api/teams', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        teams: [
          { slug: teamsDummyData.frontend.slug, 
            name: teamsDummyData.frontend.name, 
            description: teamsDummyData.frontend.description, 
            url: teamsDummyData.frontend.url 
          },
        ],
        isAdmin: true,
        userTeamSlugs: ['frontend']
      }),
    });
  });

  await page.goto('http://localhost:3000/copilot/');

  // Clear all cookies
  await page.context().clearCookies();

  // Set a dummy authentication cookie to simulate logged-in user
  await page.context().addCookies([{
    name: 'githubUserToken',
    value: 'dummy-token',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  }]);
  await page.reload();

  // Go to Teams page
  await page.getByText('Team Usage').first().click();
}

test.describe('Teams search functionality with existing and non-existing teams', () => {
  test('search for frontend team (existing)', async ({ page }) => {
    // // Intercept and mock the teams API response
    await interceptAPICall({ page });

    // Search for a team
    await page.fill('input[placeholder="Search teams..."]', 'Frontend');
    
    // Assert the page title is correct
    await expect(page).toHaveTitle(/Digital Landscape - ONS/);
    
    // Assert that the "Frontend Team" is visible
    await expect(page.getByText('Frontend Team')).toBeVisible();

    // Find the visible "Frontend Team" card 
    // and assert it has class "team-card-name"
    // and the team card description is visible with UI devs
    // and the link is matches the mocked team url
    const frontendTeamDiv = page.locator('h3', { hasText: 'Frontend Team' });
    const frontendTeamDescription = page.locator('p', { hasText: 'UI devs' });
    const frontendTeamLink = page.locator('a', { hasText: 'View on GitHub' });
    await expect(frontendTeamDiv).toHaveClass(/team-card-name/);
    await expect(frontendTeamDescription).toHaveClass(/team-card-description/);
    await expect(frontendTeamLink).toHaveAttribute('href', teamsDummyData.frontend.url);
  });

  // To test for a non-existing team, we can search for "Backend" which is not in our mocked data teamsDummyData 
  test('search for backend team (non-existing) ', async ({ page }) => {
    // Intercept and mock the teams API response
    await interceptAPICall({page});

    // Search for a team
    await page.fill('input[placeholder="Search teams..."]', 'Backend');
    
    // Assert the page title is correct
    await expect(page).toHaveTitle(/Digital Landscape - ONS/);
    
    // Assert that the "Backend Team" is not visible
    await expect(page.getByText('Backend Team')).toHaveCount(0);

  });
});