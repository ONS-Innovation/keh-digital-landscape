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
  await expect(page.locator('.bug-modal-content')).toBeVisible();

  // Verify modal header elements
  await expect(page.locator('.bug-modal-header')).toBeVisible();
  await expect(page.locator('.bug-modal-close-button')).toBeVisible();

  // Verify GitHub button is present
  await expect(
    page.getByRole('button', { name: 'Continue to GitHub' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue to GitHub' })
  ).toHaveClass(/bug-modal-action-button/);

  // Verify divider is present
  await expect(page.locator('.bug-modal-divider')).toBeVisible();

  // Verify email paragraph is present
  await expect(
    page.getByText('Alternatively, you can email us directly about this issue.')
  ).toBeVisible();
  await expect(page.locator('.bug-modal-email-text')).toBeVisible();

  // Verify email button is present with correct classes
  await expect(page.getByRole('button', { name: 'Send Email' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send Email' })).toHaveClass(
    /bug-modal-action-button/
  );
  await expect(page.getByRole('button', { name: 'Send Email' })).toHaveClass(
    /bug-modal-email-button/
  );

  // Close the modal using the close button
  await page.locator('.bug-modal-close-button').click();

  // Verify modal is closed
  await expect(page.locator('.modal-overlay')).toHaveCount(0);
});
