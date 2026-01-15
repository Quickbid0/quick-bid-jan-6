import { test, expect } from '@playwright/test';
import { attachConsoleErrorListener } from './helpers';

test('catalog filters and navigation', async ({ page }) => {
  const errors = await attachConsoleErrorListener(page);

  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: /Product Catalog/i })).toBeVisible();
  const firstCardBtn = page.locator('button:has-text("View details")').first();
  await expect.soft(firstCardBtn).toBeVisible();

  await page.getByRole('button', { name: /Filters/i }).click();
  await expect(page.locator('select').filter({ has: page.locator('option', { hasText: 'All Types' }) }).first()).toBeVisible({ timeout: 10000 });
  const categorySelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Vehicles' }) }).first();
  await categorySelect.selectOption({ label: 'Vehicles' });
  await expect.soft(page.locator('button:has-text("View details")').first()).toBeVisible();

  const auctionTypeSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Live Auctions' }) }).first();
  const hasAuctionSelect = await auctionTypeSelect.count();
  if (hasAuctionSelect > 0) {
    await auctionTypeSelect.selectOption({ label: 'Live Auctions' });
  } else {
    await page.locator('select').nth(7).selectOption({ label: 'Live Auctions' });
  }
  await expect.soft(page.getByRole('button', { name: /View details/i }).first()).toBeVisible();

  const canOpen = await firstCardBtn.isVisible().catch(() => false);
  if (canOpen) {
    await firstCardBtn.click();
    await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);
  }

  // Timed Auctions coverage
  await page.goto('/catalog');
  await page.getByRole('button', { name: /Filters/i }).click();
  const auctionTypeSelect2 = page.locator('select').filter({ has: page.locator('option', { hasText: 'Timed Auctions' }) }).first();
  if (await auctionTypeSelect2.count() > 0) {
    await auctionTypeSelect2.selectOption({ label: 'Timed Auctions' });
    const timedCard = page.getByRole('button', { name: /View details/i }).first();
    if (await timedCard.isVisible().catch(() => false)) {
      await timedCard.click();
      await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);
      await expect.soft(page.getByRole('button', { name: /Place Bid/i }).first()).toBeVisible({ timeout: 5000 });
    }
  }

  // Tender Auctions coverage
  await page.goto('/catalog');
  await page.getByRole('button', { name: /Filters/i }).click();
  const auctionTypeSelect3 = page.locator('select').filter({ has: page.locator('option', { hasText: 'Tender Auctions' }) }).first();
  if (await auctionTypeSelect3.count() > 0) {
    await auctionTypeSelect3.selectOption({ label: 'Tender Auctions' });
    const tenderCard = page.getByRole('button', { name: /View details/i }).first();
    if (await tenderCard.isVisible().catch(() => false)) {
      await tenderCard.click();
      await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);
      await expect.soft(page.getByRole('button', { name: /Place Bid/i }).first()).toBeVisible({ timeout: 5000 });
    }
  }
});
