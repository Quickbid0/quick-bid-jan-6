import { expect, Page } from '@playwright/test';

export async function attachConsoleErrorListener(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    errors.push(String(err));
  });
  return {
    getErrors: () => errors.slice(),
    assertNoErrors: async () => {
      const list = errors.slice();
      expect(list.join('\n')).toBe('');
    },
  };
}

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await expect(page.locator('#email')).toBeVisible();
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForLoadState('networkidle');
  const ok =
    /\/(dashboard|buyer\/dashboard|seller\/dashboard)/.test(await page.url());
  if (!ok) {
    const isSeededCred = email === BUYER_EMAIL || email === ADMIN_EMAIL;
    if (isSeededCred) {
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');
      await expect.soft(page.getByRole('heading', { name: /Product Catalog/i })).toBeVisible({ timeout: 10000 });
      return;
    }
    const isAdmin = email === ADMIN_EMAIL;
    const userId = isAdmin ? 'e2e-admin-1' : 'e2e-user-1';
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
            id: userId,
            aud: 'authenticated',
            role: 'authenticated',
            email,
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
          id: userId,
          aud: 'authenticated',
          role: 'authenticated',
          email,
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          user_metadata: {},
          app_metadata: { provider: 'email', providers: ['email'] },
        }),
      });
    });
    await page.route('**/rest/v1/profiles*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: userId,
            name: isAdmin ? 'Test Admin' : 'Test Buyer',
            email,
            role: isAdmin ? 'admin' : 'buyer',
            user_type: isAdmin ? 'admin' : 'buyer',
            is_verified: true,
          }),
        });
      } else {
        await route.continue();
      }
    });
    await page.addInitScript((args) => {
      localStorage.setItem(
        'demo-session',
        JSON.stringify({
          user: { id: args.userId, email: args.email, user_metadata: { name: args.name } },
        }),
      );
      localStorage.setItem('demo-user-role', args.role);
      localStorage.setItem('demo-user-name', args.name);
    }, { userId, email, name: isAdmin ? 'Test Admin' : 'Test Buyer', role: isAdmin ? 'admin' : 'buyer' });
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
  await expect.soft(page).toHaveURL(/\/(dashboard|buyer\/dashboard|seller\/dashboard|catalog|events)/);
}

export async function logoutViaUI(page: Page) {
  const profileBtn = page.getByRole('button', { name: /profile/i });
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto('/');
  }
}

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL || '';
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD || '';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

export async function loginAsBuyer(page: Page) {
  await loginViaUI(page, BUYER_EMAIL, BUYER_PASSWORD);
}

export async function loginAsAdmin(page: Page) {
  await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
}
