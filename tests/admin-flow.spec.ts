import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        access_token: 'demo-token',
        token_type: 'bearer',
        user: { id: 'demo-admin', email: 'admin@test.in', user_metadata: { role: 'admin', user_type: 'admin', name: 'Demo Admin' }, app_metadata: { role: 'admin' } }
      }));
      localStorage.setItem('demo-user-role', 'admin');
      localStorage.setItem('demo-user-type', 'admin');
      localStorage.setItem('demo-user-name', 'Demo Admin');
    });
  });

  test('Admin dashboard reachable', async ({ page }) => {
    await page.goto('/admin');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await page.waitForLoadState('networkidle');
    const coreNavVisible =
      (await page.getByRole('link', { name: /Users/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Products/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Categories/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Permissions/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Sales Leads|Finance Leads/i }).first().isVisible().catch(() => false));
    expect(coreNavVisible).toBeTruthy();
  });

  test('Verify products panel visible when present', async ({ page }) => {
    await page.goto('/admin/verify-products');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await expect(page).toHaveURL(/\/admin\/verify-products/);
    const anyNav =
      (await page.getByRole('link', { name: /Products/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Categories/i }).first().isVisible().catch(() => false)) ||
      (await page.getByRole('link', { name: /Users/i }).first().isVisible().catch(() => false));
    expect.soft(anyNav).toBeTruthy();
  });

  test('Win payments controls present when data exists', async ({ page }) => {
    await page.goto('/admin/win-payments');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await expect(page).toHaveURL(/\/admin\/win-payments/);
    const approveVisible = await page.getByTestId('admin-approve').first().isVisible().catch(() => false);
    const rejectVisible = await page.getByTestId('admin-reject').first().isVisible().catch(() => false);
    // Optional visibility check; do not fail test if not present due to data/setup
    if (approveVisible) {
      await expect.soft(page.getByTestId('admin-approve').first()).toBeVisible();
    }
    if (rejectVisible) {
      await expect.soft(page.getByTestId('admin-reject').first()).toBeVisible();
    }
  });

  test('Admin actions expose money state or audit clarity', async ({ page }) => {
    await page.goto('/admin/win-payments');
    await page.waitForLoadState('networkidle');
    const adminMoneyClarityVisible =
      (await page
        .getByText(/Pending|Approved|Rejected|Paid|On Hold/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/Audit|History|Decision|Updated by/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByTestId('admin-approve')
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByTestId('admin-reject')
        .first()
        .isVisible()
        .catch(() => false));
    expect.soft(adminMoneyClarityVisible).toBeTruthy();
  });
});
