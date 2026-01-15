import { test, expect } from '@playwright/test';

const SELLER_EMAIL = process.env.E2E_SELLER_EMAIL || '';
const SELLER_PASSWORD = process.env.E2E_SELLER_PASSWORD || '';

const ensureSellerCreds = () => {
  if (!SELLER_EMAIL || !SELLER_PASSWORD) {
    test.skip(true, 'E2E_SELLER_* credentials are not set; skipping individual badge test');
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

// Low-flakiness check: when a non-company seller has products, the "Individual Seller" badge should appear
// This relies on seed scripts giving seller1@test.in at least one product and user_type != 'company'.
test('seller dashboard shows Individual Seller badge when products exist', async ({ page }) => {
  ensureSellerCreds();

  await loginAsSeller(page);
  await page.goto('/seller/dashboard');

  // Ensure we are on the seller dashboard
  await expect(page).toHaveURL(/\/seller\/dashboard/);

  // The badge text should be visible when the seller is an individual with products
  const badge = page.getByText(/Individual Seller/i).first();
  await expect(badge).toBeVisible();
});
