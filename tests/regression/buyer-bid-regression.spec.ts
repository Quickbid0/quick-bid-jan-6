import { test, expect } from '@playwright/test';

test.describe('Buyer Nightly Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        access_token: 'demo-token',
        token_type: 'bearer',
        user: { id: 'demo-buyer', email: 'buyer@test.in', user_metadata: { role: 'buyer', user_type: 'buyer' }, app_metadata: { role: 'buyer' } }
      }));
      localStorage.setItem('demo-user-role', 'buyer');
      localStorage.setItem('demo-user-type', 'buyer');
    });
  });

  test('Invalid bid shows user-facing error (no silent failure)', async ({ page }) => {
    await page.goto('/catalog');
    const viewBtn = page.getByRole('button', { name: /View details/i }).first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();
    await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);

    const placeBidById = page.getByTestId('place-bid-btn').first();
    const placeBidByRole = page.getByRole('button', { name: /^Place Bid$/i }).first();
    const canClickById = await placeBidById.isVisible().catch(() => false);
    const canClickByRole = await placeBidByRole.isVisible().catch(() => false);
    if (canClickById) {
      await placeBidById.click();
    } else if (canClickByRole) {
      await placeBidByRole.click();
    } else {
      test.skip(true, 'No Place Bid button; environment may lack eligible product');
    }

    const bidInput = page.locator('form').locator('input[type="number"]').first();
    await expect(bidInput).toBeVisible({ timeout: 10000 });
    await bidInput.fill('1');

    const confirmBid = page.getByTestId('confirm-bid').first();
    const confirmVisible = await confirmBid.isVisible().catch(() => false);
    if (!confirmVisible) {
      test.skip(true, 'Bid modal not available; auth or product eligibility missing');
    }
    await confirmBid.click();

    const errorVisible = await page
      .getByText(/minimum bid|required|invalid bid|Price updated/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });
});
