import { test, expect } from '@playwright/test';
import { attachConsoleErrorListener, loginViaUI, logoutViaUI } from './helpers';

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

test('critical path buyer and admin', async ({ page }) => {
  const errors = await attachConsoleErrorListener(page);

  if (!BUYER_EMAIL || !BUYER_PASSWORD || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip(true, 'E2E_* credentials are not set');
  }

  await page.goto('/login');
  await loginViaUI(page, BUYER_EMAIL, BUYER_PASSWORD);
  await expect.soft(page).toHaveURL(/\/(dashboard|buyer\/dashboard)/);

  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: /Product Catalog/i })).toBeVisible();
  const firstCardBtn = page.getByRole('button', { name: /View details/i }).first();
  await firstCardBtn.click();
  await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);

  const placeBidBtn = page.getByRole('button', { name: /Place Bid/i }).first();
  const canBid = await placeBidBtn.isVisible().catch(() => false);
  if (canBid) {
    await placeBidBtn.click();
    await expect.soft(page.getByText(/Bid .* placed/i)).toBeVisible({ timeout: 5000 });
  }

  await page.goto('/buyer/dashboard');
  await expect.soft(page.getByRole('heading', { name: /Buyer Dashboard/i })).toBeVisible({ timeout: 10000 });
  const payNowBtn = page.getByRole('button', { name: /Pay Now/i }).first();
  const hasPayNow = await payNowBtn.isVisible().catch(() => false);
  expect.soft(hasPayNow).toBeTruthy();

  await logoutViaUI(page);
  await expect(page).toHaveURL(/\/login/);

  await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect.soft(page).toHaveURL(/\/admin/);
  await page.goto('/admin/win-payments');
  await expect.soft(page.getByRole('heading', { name: /Win Payments/i })).toBeVisible({ timeout: 10000 });
  const pendingRow = page.locator('text=/Pending|pending verification/i').first();
  const hasPending = await pendingRow.isVisible().catch(() => false);
  if (hasPending) {
    const approveBtn = page.getByRole('button', { name: /Approve Payment/i }).first();
    if (await approveBtn.isVisible().catch(() => false)) {
      await approveBtn.click();
      await expect.soft(page.getByText(/Payment approved|Approved/i)).toBeVisible({ timeout: 5000 });
    }
  }

  await errors.assertNoErrors();
});
