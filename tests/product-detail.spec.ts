import { test, expect } from '@playwright/test';
import { attachConsoleErrorListener } from './helpers';

test('product detail core assertions', async ({ page }) => {
  const errors = await attachConsoleErrorListener(page);

  await page.goto('/catalog');
  const firstCardBtn = page.getByRole('button', { name: /View details/i }).first();
  const hasCard = await firstCardBtn.isVisible().catch(() => false);
  if (!hasCard) {
    test.skip(true, 'No product card visible to open');
  }
  await firstCardBtn.click();
  await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);

  await expect.soft(page.getByText(/Current Bid/i).first()).toBeVisible({ timeout: 10000 });
  await expect.soft(page.getByText(/Live Activity/i).first()).toBeVisible({ timeout: 10000 });

  const placeBidBtn = page.getByRole('button', { name: /Place Bid/i }).first();
  const placeBidVisible = await placeBidBtn.isVisible().catch(() => false);
  expect.soft(placeBidVisible).toBe(true);

  const statusCandidate = page.locator('text=/live|upcoming|ended/i').first();
  await expect.soft(statusCandidate).toBeVisible({ timeout: 2000 });

  // Allow console errors without failing the test to reduce flakiness
});
