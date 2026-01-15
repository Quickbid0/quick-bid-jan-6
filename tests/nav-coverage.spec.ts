import { test, expect } from '@playwright/test';

async function injectRole(page: import('@playwright/test').Page, role: 'admin' | 'user' | 'seller') {
  await page.addInitScript((r) => {
    const demo = {
      access_token: 'demo-token',
      token_type: 'bearer',
      user: {
        id: `demo-${r}`,
        email: `${r}@demo.com`,
        user_metadata: { role: r, user_type: r, name: `Demo ${r}` },
        app_metadata: { role: r },
      },
    };
    localStorage.setItem('demo-session', JSON.stringify(demo));
    localStorage.setItem('demo-user-role', r);
    localStorage.setItem('demo-user-type', r);
    localStorage.setItem('demo-user-name', `Demo ${r}`);
  }, role);
}

async function expectNoFlowLinks(page: import('@playwright/test').Page) {
  const patterns = ['/product/', '/winner/', '/pay/', '/checkout/', '/verify-'];
  for (const p of patterns) {
    const flowLinks = page.locator(`a[href*="${p}"]`);
    await expect(flowLinks).toHaveCount(0);
  }
}

test.describe('Navigation coverage by role', () => {
  test('admin sidebar includes core links; flow routes absent', async ({ page }) => {
    await injectRole(page, 'admin');
    await page.goto('/admin/sales');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: /Analytics/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Finance Leads/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Investments/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Marketing/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Employees/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Locations/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Content Moderation/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Settings/i }).first()).toBeVisible();

    await expectNoFlowLinks(page);
  });

  test('buyer dashboard shows value links; flow routes absent', async ({ page }) => {
    await injectRole(page, 'user');
    await page.goto('/buyer/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Buyer Dashboard/i }).first()).toBeVisible();
    await expect(page.getByText(/Market Analytics/i).first()).toBeVisible();
    await expect(page.getByText(/Reports/i).first()).toBeVisible();
    await expect(page.getByText(/Security Center/i).first()).toBeVisible();
    await expect(page.locator('a[href="/events"]').first()).toBeVisible();
    await expect(page.locator('a[href="/invest/dashboard"]').first()).toBeVisible();

    await expectNoFlowLinks(page);
  });

  test('seller dashboard includes Seller Center quick action', async ({ page }) => {
    await injectRole(page, 'seller');
    await page.goto('/seller/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Seller Dashboard/i }).first()).toBeVisible();
    await expect(page.getByTestId('seller-center-link').first()).toBeVisible();
    await expectNoFlowLinks(page);
  });
});
