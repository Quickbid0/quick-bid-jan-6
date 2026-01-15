import { test, expect } from '@playwright/test';

const SELLER_EMAIL = process.env.E2E_SELLER_EMAIL || '';
const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD || '';

const ensureSellerCreds = () => {
  if (!SELLER_EMAIL || !SELLER_PASSWORD) {
    test.skip(true, 'E2E_SELLER_* credentials are not set; skipping seller dashboard test');
  }
};

async function loginAsSeller(page: import('@playwright/test').Page) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"]').first();
  const hasEmail = await emailInput.isVisible().catch(() => false);
  if (!hasEmail) {
    test.skip(true, 'Login page email input not found; app may not be running or route changed');
  }
  await emailInput.fill(SELLER_EMAIL);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(SELLER_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForLoadState('networkidle');
}

// Ensure seller dashboard renders key widgets without crashing
test('seller dashboard renders stats and recent products', async ({ page }) => {
  ensureSellerCreds();

  await loginAsSeller(page);
  await page.goto('/seller/dashboard');

  // Assert we actually reached the Seller Dashboard
  await expect(page).toHaveURL(/\/seller\/dashboard/);
  const heading = page.getByText(/Seller Dashboard/i);
  await expect(heading).toBeVisible();

  // Stats cards
  await expect(page.getByText(/Total Products/i)).toBeVisible();
  await expect(page.getByText(/Active Auctions/i)).toBeVisible();
  await expect(page.getByText(/Total Revenue/i)).toBeVisible();

  // Recent products section; tolerate empty state
  await expect(page.getByText(/Recent Products/i)).toBeVisible();
});
