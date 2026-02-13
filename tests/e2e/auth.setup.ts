import { test as setup } from '@playwright/test';

setup('admin auth', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'admin@quickbid.com');
  await page.fill('[data-testid="password-input"]', 'admin123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/admin/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});

setup('buyer auth', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'buyer@quickbid.com');
  await page.fill('[data-testid="password-input"]', 'buyer123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/buyer/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/buyer.json' });
});

setup('seller auth', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'seller@quickbid.com');
  await page.fill('[data-testid="password-input"]', 'seller123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/seller/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/seller.json' });
});
