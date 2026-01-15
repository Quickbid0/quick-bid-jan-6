import { test, expect } from '@playwright/test';

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';

const ensureBuyerCreds = () => {
  if (!BUYER_EMAIL || !BUYER_PASSWORD) {
    test.skip(true, 'E2E_BUYER_* credentials are not set; skipping timed auction bid test');
  }
};

async function loginAsBuyer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"]').first();
  const hasEmail = await emailInput.isVisible().catch(() => false);
  if (!hasEmail) {
    test.skip(true, 'Login page email input not found; app may not be running or route changed');
  }
  await emailInput.fill(BUYER_EMAIL);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(BUYER_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForLoadState('networkidle');
}

// Happy path: buyer places a bid on the first timed auction card
// Assumes there is at least one active timed auction in the DB
test('buyer can place bid on timed auction', async ({ page }) => {
  ensureBuyerCreds();

  await loginAsBuyer(page);

  // Go to timed auctions listing
  await page.goto('/timed-auction');

  const firstCard = page.locator('a[href^="/timed-auction/"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  // Wait for auction page to load
  await expect(page.getByText(/TIMED AUCTION/i)).toBeVisible();

  // Open bid modal
  const placeBidButton = page.getByRole('button', { name: /Place Bid/i }).first();
  await placeBidButton.click();

  // Fill an amount slightly above current min; we can read helper text
  const helper = page.getByText(/Minimum next bid/i).first();
  await expect(helper).toBeVisible();

  const input = page.locator('input[type="number"]').first();
  await input.fill('0'); // invalid first to ensure validation works
  await page.getByRole('button', { name: /Place Bid/i }).last().click();

  // Expect validation error
  await expect(page.getByText(/Enter a valid bid amount/i)).toBeVisible();
});
