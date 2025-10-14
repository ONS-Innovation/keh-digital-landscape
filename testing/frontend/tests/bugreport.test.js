import { test, expect } from 'playwright/test';

test('Sidebar Report a Bug button opens and closes the modal', async ({
  page,
}) => {
  await page.goto('http://localhost:3000');

  // Open the bug report modal via the Sidebar button (aria-label based)
  await page.getByRole('button', { name: 'Open report bug modal' }).click();

  // Verify modal is visible
  await expect(
    page.getByRole('heading', { name: 'Report a Bug' })
  ).toBeVisible();
  await expect(page.locator('.modal-overlay')).toBeVisible();
  await expect(page.locator('.modal-content')).toBeVisible();

  // Close the modal using the close button
  await page.locator('.modal-close-button').click();

  // Verify modal is closed
  await expect(page.locator('.modal-overlay')).toHaveCount(0);
});
