import { test, expect } from 'playwright/test';

// Function to intercept and mock the API call
const interceptAPICall = async ({ page }) => {
  // Function to intercept and mock the Address Book API call
  const interceptAddressBookAPICall = async ({ page }) => {
    await page.route('**/addressbook/api/request**', async route => {
      const url = new URL(route.request().url());
      const q = (url.searchParams.get('q') || '').trim();

      if (!q) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }

      const hasComma = q.includes(',');
      if (!hasComma && q.includes(' ')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }

      const toKey = v =>
        v
          .toLowerCase()
          .replace(/^mailto:/, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9@._-]/g, '');

      const tokens = (hasComma ? q.split(',') : [q])
        .map(t => toKey(t.trim()))
        .filter(Boolean);

      const resultsMap = new Map();

      const addUser = (key, user) => {
        const k = key || user.username;
        if (!resultsMap.has(k)) resultsMap.set(k, user);
      };

      for (const token of tokens) {
        if (token === 'username1' || token === 'user.name1@ons.gov.uk') {
          addUser('username1', {
            username: 'username1',
            email: 'user.name1@ons.gov.uk',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            url: 'https://github.com/username1',
            fullname: 'User Name1',
          });
          continue;
        }
        if (token === 'username2' || token === 'user.name2@ons.gov.uk') {
          addUser('username2', {
            username: 'username2',
            email: 'user.name2@ons.gov.uk',
            avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
            url: 'https://github.com/username2',
            fullname: 'User Name2',
          });
          continue;
        }
      }

      const response = Array.from(resultsMap.values());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  };

  await interceptAddressBookAPICall({ page });
  await page.goto('http://localhost:3000/addressbook');
};

test.beforeEach(async ({ page }) => {
  await interceptAPICall({ page });
});

// Sidebar icon highlighted
test('Address book icon is Highlighted', async ({ page }) => {
  // Choose address book icon on sidebar
  const sideBarIcon = page.getByRole('link', { name: 'Address Book' });

  // Expect the icon to be active
  await expect(sideBarIcon).toHaveClass('sidebar-link active');
});

// Input container is highlighted, when clicked.
test('Active input container is highlighted', async ({ page }) => {
  // Find Input container
  const inputContainer = page.getByLabel('Address book search');

  // Verify not focussed and CSS border-colour
  await expect(inputContainer).not.toBeFocused();
  await expect(inputContainer).toHaveCSS('border-color', 'rgb(228, 228, 231)');

  // Focus on the Input
  await inputContainer.focus();

  // Verify focus and CSS change
  await expect(inputContainer).toBeFocused();
  await expect(inputContainer).toHaveCSS('border-color', 'rgb(37, 99, 235)');
});

// Click search, with empty input, gives 'No results.'
test('Empty search, gives "No results."', async ({ page }) => {
  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Click on Search button with empty input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Click search, with vaild input but unknown username, gives 'No results.'
test('Valid search, Unknown username, gives "No results."', async ({
  page,
}) => {
  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('invalid-username-456');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Click search, with vaild input and valid username, gives proper result
test('Valid search, Known username, gives result', async ({ page }) => {
  // Input name
  const displayName = 'username1';

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the first user card (it does not exist initially)
  const userCard = page.locator('.user-card').first();

  // Assert it does not exist before clicking search
  await expect(userCard).toHaveCount(0);

  // Enter a valid username
  await inputContainer.fill(displayName);

  // Click on Search button with valid input
  await searchButton.click();

  // Now the user card should be rendered and visible
  await expect(userCard).toBeVisible();
});

// Two different queries, not comma seperated, gives 'No results.'
test('Different queries, Incorrect format, gives "No results."', async ({
  page,
}) => {
  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('username1 username2');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two different queries, comma seperated, gives result
test('Different queries, Correct format, gives result', async ({ page }) => {
  // Input name
  const displayNames = ['username1', 'username2'];

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the user cards (it does not exist initially)
  const userCards = page.locator('.user-card');

  // Assert it does not exist before clicking search
  await expect(userCards).toHaveCount(0);

  // Enter a valid username
  await inputContainer.fill(`${displayNames[0]}, ${displayNames[1]}`);

  // Click on Search button with valid input
  await searchButton.click();

  // Now the user cards should be rendered and visible
  await expect(userCards.nth(0)).toBeVisible();
  await expect(userCards.nth(1)).toBeVisible();
});

// Two of the same queries, not comma seperated, gives 'No results.'
test('Same queries, Incorrect format, gives "No results."', async ({
  page,
}) => {
  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('username1 username1');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two of the same queries, comma seperated, gives one result
test('Same queries, Correct format, gives one result', async ({ page }) => {
  // Input name
  const displayNames = ['username1', 'username1'];

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the user cards (it does not exist initially)
  const userCards = page.locator('.user-card');

  // Assert it does not exist before clicking search
  await expect(userCards).toHaveCount(0);

  // Enter a valid username
  await inputContainer.fill(`${displayNames[0]}, ${displayNames[1]}`);

  // Click on Search button with valid input
  await searchButton.click();

  // Now the first user card should be rendered and visible and the second should not be
  await expect(userCards.nth(0)).toBeVisible();
  await expect(userCards.nth(1)).not.toBeVisible();
});

// Two of the same queries different inputs (one email, one username) not comma seperated, gives 'No results.'
test('Same queries, Different inputs, Incorrect format, gives "No results."', async ({
  page,
}) => {
  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('username1 user.name1@ons.gov.uk');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two of the same queries, comma seperapted, gives one result
test('Same queries, Different inputs, Correct format, gives one result', async ({
  page,
}) => {
  // Input name
  const displayNames = ['username1', 'user.name1@ons.gov.uk'];

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the user cards (it does not exist initially)
  const userCards = page.locator('.user-card');

  // Assert it does not exist before clicking search
  await expect(userCards).toHaveCount(0);

  // Enter a valid username
  await inputContainer.fill(`${displayNames[0]}, ${displayNames[1]}`);

  // Click on Search button with valid input
  await searchButton.click();

  // Now the first user card should be rendered and visible and the second should not be
  await expect(userCards.nth(0)).toBeVisible();
  await expect(userCards.nth(1)).not.toBeVisible();
});
