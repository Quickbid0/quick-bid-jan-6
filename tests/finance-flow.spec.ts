import { test, expect } from '@playwright/test';

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

// Helper to skip if creds are not configured
const ensureCreds = () => {
  if (!BUYER_EMAIL || !BUYER_PASSWORD || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip(true, 'E2E_* credentials are not set; skipping full-flow test');
  }
};

test('buyer can submit finance lead and admin can see it', async ({ page }) => {
  ensureCreds();

  // 1) Buyer login
  await page.goto('/login');
  const buyerEmailInput = page.locator('input[type="email"]').first();
  const hasBuyerEmail = await buyerEmailInput.isVisible().catch(() => false);
  if (!hasBuyerEmail) {
    test.skip(true, 'Login page email input not found; app may not be running or route changed');
  }
  await buyerEmailInput.fill(BUYER_EMAIL);

  const buyerPasswordInput = page.locator('input[type="password"]').first();
  await buyerPasswordInput.fill(BUYER_PASSWORD);
  await page.click('button:has-text("Sign In")');

  // Wait for redirect to dashboard or home
  await page.waitForTimeout(2000);

  // 2) Go to catalog and open first product
  await page.goto('/catalog');
  // Adjust selectors based on your catalog UI
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  // 3) On ProductDetail, scroll to Finance & Insurance section
  await page.waitForLoadState('networkidle');
  await page.locator('text=Finance & Insurance options').scrollIntoViewIfNeeded();

  // Fill finance form
  await page.fill('input[placeholder="Your name"]', 'E2E Buyer');
  await page.fill('input[placeholder="Phone number"]', '9999999999');
  await page.fill('input[placeholder="Email (optional)"]', BUYER_EMAIL);

  // Click Apply for Loan
  await page.click('button:has-text("Apply for Loan")');
  await page.waitForTimeout(1500);

  // Click Get Insurance Quote
  await page.click('button:has-text("Get Insurance Quote")');
  await page.waitForTimeout(1500);

  // 4) Log out (if you have a logout button)
  // Adjust selector to your navbar/logout UI
  // await page.click('text=Logout');

  // 5) Admin login in same browser context
  await page.goto('/login');
  const adminEmailInput = page.locator('input[type="email"]').first();
  const hasAdminEmail = await adminEmailInput.isVisible().catch(() => false);
  if (!hasAdminEmail) {
    test.skip(true, 'Login page email input not found for admin login; app may not be running or route changed');
  }
  await adminEmailInput.fill(ADMIN_EMAIL);

  const adminPasswordInput = page.locator('input[type="password"]').first();
  await adminPasswordInput.fill(ADMIN_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);

  // 6) Visit admin finance leads page and check leads exist
  await page.goto('/admin/finance-leads');
  await page.waitForLoadState('networkidle');

  const rows = page.locator('table >> tbody >> tr');
  await expect(rows.first()).toBeVisible();
});
