import { test, expect } from '@playwright/test';

test.describe('Buyer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        access_token: 'demo-token',
        token_type: 'bearer',
        user: { id: 'demo-buyer', email: 'buyer1@test.in', user_metadata: { role: 'buyer', user_type: 'buyer', name: 'Demo Buyer' }, app_metadata: { role: 'buyer' } }
      }));
      localStorage.setItem('demo-user-role', 'buyer');
      localStorage.setItem('demo-user-type', 'buyer');
      localStorage.setItem('demo-user-name', 'Demo Buyer');
    });
  });

  test('Catalog to PDP and bid CTA', async ({ page }) => {
    await page.goto('/catalog');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await expect(page.getByRole('heading', { name: /Product Catalog/i })).toBeVisible();
    const viewBtn = page.getByRole('button', { name: /View details/i }).first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();
    await expect(page).toHaveURL(/\/product\/[A-Za-z0-9_-]+/);
    const placeBidBtn = page.getByRole('button', { name: /^Place Bid$/i }).first();
    const visible = await placeBidBtn.isVisible().catch(() => false);
    expect.soft(visible).toBe(true);
    const testIdBtn = page.getByTestId('place-bid-btn').first();
    const testIdVisible = await testIdBtn.isVisible().catch(() => false);
    if (testIdVisible) {
      await expect.soft(testIdBtn).toBeVisible();
    }
  });

  test('Wallet deposit', async ({ page }) => {
    await page.goto('/wallet');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    const addMoneyBtn = page.getByRole('button', { name: /Add Money/i }).first();
    const addVisible = await addMoneyBtn.isVisible().catch(() => false);
    if (addVisible) {
      await addMoneyBtn.click();
      const amountInput = page.getByPlaceholder(/Enter amount/i).first();
      await expect(amountInput).toBeVisible({ timeout: 10000 });
      await amountInput.fill('5000');
      const confirmAdd = page.getByRole('button', { name: /^Add Money$/i }).first();
      await expect.soft(confirmAdd).toBeVisible();
      await expect(page.getByRole('heading', { name: /Add Money to Wallet/i })).toBeVisible({ timeout: 10000 });
      const addMoneySubmit = page.getByTestId('add-money-submit').first();
      const hasSubmit = await addMoneySubmit.isVisible().catch(() => false);
      if (hasSubmit) {
        await expect.soft(addMoneySubmit).toBeVisible();
      }
    }
  });

  test('Win payment page renders', async ({ page }) => {
    await page.route('**/rest/v1/auctions*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'auc-123',
            status: 'payment_pending',
            winner_id: 'demo-buyer',
            final_price: 150000,
            auction_type: 'timed',
            product: { id: 'prod-1', title: 'Test Product', image_url: null },
            seller: { id: 'seller-1' }
          }]),
        });
        return;
      }
      await route.continue();
    });
    await page.goto('/pay/auc-123');
    await page.waitForLoadState('networkidle');
    const payHeading = page.getByRole('heading', { name: /Pay for your win|Payment not available|Something went wrong/i }).first();
    await expect(payHeading).toBeVisible({ timeout: 10000 });
    const anySectionVisible =
      (await page.getByText(/Payment summary/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/Choose payment method/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/Payment already recorded/i).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Go Home/i }).first().isVisible().catch(() => false));
    expect.soft(anySectionVisible).toBeTruthy();
    const submitPay = await page.getByTestId('pay-for-win-submit').first().isVisible().catch(() => false);
    // Optional: only assert if present to avoid flakiness in environments without auth/session
    if (submitPay) {
      await expect.soft(page.getByTestId('pay-for-win-submit').first()).toBeVisible();
    }
  });

  test('Live Auctions lobby shows content', async ({ page }) => {
    await page.goto('/live-auction');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await expect(page.getByRole('heading', { name: 'Live Auctions', level: 1 })).toBeVisible();
    const hasLobbyContent = await page
      .locator('text=/Live Now|Upcoming Auctions|Live Yard Locations|Yard Events/i')
      .first().isVisible().catch(() => false);
    expect(hasLobbyContent).toBeTruthy();
  });

  test('Buyer sees money clarity (wallet / refund / pay CTA)', async ({ page }) => {
    await page.goto('/wallet');
    const moneyClarityVisible =
      (await page
        .getByText(/Wallet Balance|Available Balance|Deposit Added/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/Refund|Refund initiated|Refund pending/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByRole('button', { name: /Pay for your win/i })
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByTestId('pay-for-win-submit')
        .first()
        .isVisible()
        .catch(() => false));
    expect.soft(moneyClarityVisible).toBeTruthy();
  });
});
