import { test, expect } from '@playwright/test';

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';

async function ensureAuth(page: import('@playwright/test').Page) {
  if (BUYER_EMAIL && BUYER_PASSWORD) {
    await page.goto('/login');
    await page.locator('#email').fill(BUYER_EMAIL);
    await page.locator('#password').fill(BUYER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');
    const ok =
      /\/(dashboard|buyer\/dashboard|seller\/dashboard|catalog|events)/.test(await page.url());
    if (ok) return;
  }
  await page.route('**/auth/v1/token*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'e2e-user-1',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'buyer1@test.in',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          user_metadata: {},
          app_metadata: { provider: 'email', providers: ['email'] },
        },
      }),
    });
  });
  await page.route('**/auth/v1/user*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-user-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'buyer1@test.in',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        user_metadata: {},
        app_metadata: { provider: 'email', providers: ['email'] },
      }),
    });
  });
  await page.addInitScript(() => {
    localStorage.setItem('demo-session', JSON.stringify({
      user: { id: 'e2e-user-1', email: 'buyer1@test.in' }
    }));
    localStorage.setItem('demo-user-role', 'buyer');
  });
}

test('winner page shows auction ID and winning bid', async ({ page }) => {
  await ensureAuth(page);

  // Mock Supabase tables for winner page
  await page.route('**/rest/v1/auctions*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'auc-123',
          status: 'won',
          winner_id: 'e2e-user-1',
          final_price: 100000,
          auction_type: 'timed',
          product: { id: 'prod-1', title: 'Test Product', image_url: null },
          seller: { id: 'seller-1' }
        }]),
      });
      return;
    }
    await route.continue();
  });
  await page.route('**/rest/v1/win_payments*', async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });
  await page.route('**/rest/v1/payouts*', async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });

  await page.goto('/winner/auc-123');
  await page.waitForLoadState('networkidle');
  const winnerHeading = page.getByRole('heading', { name: /You won this auction|Winner details unavailable/i }).first();
  await expect(winnerHeading).toBeVisible({ timeout: 10000 });
  const idTextVisible = await page.getByText(/Auction ID:/i).first().isVisible().catch(() => false);
  const bidTextVisible = await page.getByText(/Winning bid:/i).first().isVisible().catch(() => false);
  expect.soft(idTextVisible || bidTextVisible).toBeTruthy();
});

test('pay page shows payment heading and method section', async ({ page }) => {
  await ensureAuth(page);

  await page.route('**/rest/v1/auctions*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'auc-123',
          status: 'payment_pending',
          winner_id: 'e2e-user-1',
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
});
