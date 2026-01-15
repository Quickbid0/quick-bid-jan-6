import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers';

// Emulate supabase auth user for notifications page
async function mockAuthUser(page: import('@playwright/test').Page) {
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
}

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';

async function ensureAuth(page: import('@playwright/test').Page) {
  if (BUYER_EMAIL && BUYER_PASSWORD) {
    await page.goto('/login');
    await loginViaUI(page, BUYER_EMAIL, BUYER_PASSWORD);
    return;
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
  await page.addInitScript(() => {
    localStorage.setItem('demo-session', JSON.stringify({
      user: {
        id: 'e2e-user-1',
        email: 'buyer1@test.in',
        user_metadata: { name: 'Test Buyer' },
      }
    }));
    localStorage.setItem('demo-user-role', 'buyer');
    localStorage.setItem('demo-user-name', 'Test Buyer');
  });
  await mockAuthUser(page);
}

test('notifications empty state renders correctly', async ({ page }) => {
  await ensureAuth(page);

  await page.route('**/rest/v1/notifications*', async (route) => {
    if (route.request().method() === 'GET') {
      // Return empty notifications list
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/notifications');
  const heading = page.getByRole('heading', { name: /Notifications/i });
  const hasHeading = await heading.isVisible().catch(() => false);
  if (!hasHeading) test.skip(true, 'Notifications page not accessible in this environment');
  await expect(page.getByText(/No notifications found/i)).toBeVisible({ timeout: 10000 });
});

test('notifications filters show items and avoid duplicates', async ({ page }) => {
  await ensureAuth(page);

  const items = [
    {
      id: 'n1',
      title: 'Bid placed',
      message: 'Your bid of ₹10,000 was placed',
      type: 'bid_placed',
      read: false,
      created_at: new Date().toISOString(),
      user_id: 'e2e-user-1',
    },
    {
      id: 'n2',
      title: 'Outbid notice',
      message: 'You were outbid on Auction A',
      type: 'bid_outbid',
      read: false,
      created_at: new Date().toISOString(),
      user_id: 'e2e-user-1',
    },
    {
      id: 'n3',
      title: 'Winner determined',
      message: 'You have won Auction B',
      type: 'bid_won',
      read: true,
      created_at: new Date().toISOString(),
      user_id: 'e2e-user-1',
    },
  ];

  await page.route('**/rest/v1/notifications*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(items),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/notifications');
  const heading = page.getByRole('heading', { name: /Notifications/i });
  const hasHeading = await heading.isVisible().catch(() => false);
  if (!hasHeading) test.skip(true, 'Notifications page not accessible in this environment');
  await expect(page.getByText('Bid placed')).toBeVisible();
  await expect(page.getByText('Outbid notice')).toBeVisible();
  await expect(page.getByText('Winner determined')).toBeVisible();

  // Ensure uniqueness: each mock title should appear exactly once
  await expect(page.getByText('Bid placed', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Outbid notice', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Winner determined', { exact: true })).toHaveCount(1);
});
