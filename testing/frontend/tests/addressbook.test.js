import { test, expect } from 'playwright/test';

const pageLink = 'http://localhost:3000/addressbook';

// Sidebar icon highlighted
test('Address book icon is Highlighted', async ({ page }) => {
  await page.goto(pageLink);

  // Choose address book icon on sidebar
  const sideBarIcon = page.getByRole('link', { name: 'Address Book' });

  // Expect the icon to be active
  await expect(sideBarIcon).toHaveClass('sidebar-link active');
});

// Input container is highlighted, when clicked.
test('Active input container is highlighted', async ({ page }) => {
  await page.goto(pageLink);

  // Find Input container
  const inputContainer = page.getByLabel('Address book search');

  // Verify not focussed and CSS border-colour
  await expect(inputContainer).not.toBeFocused();
  await expect(inputContainer).toHaveCSS('border-color', 'rgb(229, 231, 235)');

  // Focus on the Input
  await inputContainer.focus();

  // Verify focus and CSS change
  await expect(inputContainer).toBeFocused();
  await expect(inputContainer).toHaveCSS('border-color', 'rgb(37, 99, 235)');
});

// Click search, with empty input, gives 'No results.'
test('Empty search, gives "No results."', async ({ page }) => {
  await page.goto(pageLink);

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
  await page.goto(pageLink);

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
  await page.goto(pageLink);

  // Input name
  const displayName = 'cooper-wright';

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
  await page.goto(pageLink);

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('cooper-wright totaldwarf03');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two different queries, comma seperated, gives result
test('Different queries, Correct format, gives result', async ({ page }) => {
  await page.goto(pageLink);

  // Input name
  const displayNames = ['cooper-wright', 'totaldwarf03'];

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
  await page.goto(pageLink);

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('cooper-wright cooper-wright');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two of the same queries, comma seperated, gives one result
test('Same queries, Correct format, gives one result', async ({ page }) => {
  await page.goto(pageLink);

  // Input name
  const displayNames = ['cooper-wright', 'cooper-wright'];

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
  await page.goto(pageLink);

  // Find the Input container
  const inputContainer = page.getByLabel('Address book search');

  // Find Search button
  const searchButton = page.getByLabel('Submit search');

  // Locator for the "No results." text (it does not exist initially)
  const resultText = page.getByText('No results.', { exact: true });

  // Assert it does not exist before clicking search
  await expect(resultText).toHaveCount(0);

  // Enter an invalid username
  await inputContainer.fill('cooper-wright cooper.wright@ons.gov.uk');

  // Click on Search button with input
  await searchButton.click();

  // Now the result text should be rendered and visible
  await expect(resultText).toBeVisible();
});

// Two of the same queries, comma seperated, gives one result
test('Same queries, Different inputs, Correct format, gives one result', async ({
  page,
}) => {
  await page.goto(pageLink);

  // Input name
  const displayNames = ['cooper-wright', 'cooper.wright.ons.gov.uk'];

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

