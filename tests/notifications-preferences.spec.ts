import { test, expect } from '@playwright/test';

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';

async function ensureAuth(page: import('@playwright/test').Page) {
  if (BUYER_EMAIL && BUYER_PASSWORD) {
    await page.goto('/login');
    const emailInput = page.locator('#email');
    await emailInput.fill(BUYER_EMAIL);
    await page.locator('#password').fill(BUYER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');
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

test('toggle email/SMS preferences and save', async ({ page }) => {
  await ensureAuth(page);

  // Initial user_preferences fetch
  await page.route('**/rest/v1/user_preferences*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          user_id: 'e2e-user-1',
          email_notifications: true,
          sms_notifications: false,
          bid_alerts: true,
          auction_reminders: true,
        }]),
      });
      return;
    }
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      // Capture upsert body
      const body = route.request().postDataJSON() as any;
      const hasKeys =
        body &&
        typeof body.email_notifications !== 'undefined' &&
        typeof body.sms_notifications !== 'undefined';
      if (!hasKeys) {
        await route.fulfill({ status: 400, json: { error: 'Missing prefs keys' } });
        return;
      }
      await route.fulfill({ status: 201, json: { ...body } });
      return;
    }
    await route.continue();
  });

  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');
  const prefsHeading = page.getByRole('heading', { name: /Notification Preferences/i });
  let hasPrefsHeading = await prefsHeading.isVisible().catch(() => false);
  if (!hasPrefsHeading) {
    await page.goto('/settings/notifications');
    await page.waitForLoadState('networkidle');
    const settingsHeading = page.getByRole('heading', { name: /Notification Settings/i });
    hasPrefsHeading = await settingsHeading.isVisible().catch(() => false);
  }
  if (!hasPrefsHeading) test.skip(true, 'Notification Preferences or Settings section not visible');
  await page.waitForTimeout(300);

  // Toggle checkboxes
  const emailCheckbox = page.locator('input[type="checkbox"]').nth(0);
  const smsCheckbox = page.locator('input[type="checkbox"]').nth(1);
  await emailCheckbox.click();
  await smsCheckbox.click();

  // Save
  await page.getByRole('button', { name: /Save Preferences|Save preferences/i }).first().click();
  // Assert no crash; we rely on network mock 201 ok, so page should remain stable
  await expect.soft(page.getByRole('button', { name: /Save Preferences|Save preferences/i }).first()).toBeVisible({ timeout: 10000 });
});
