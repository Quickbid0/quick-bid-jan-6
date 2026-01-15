import { test, expect } from '@playwright/test';

test.describe('Support Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        access_token: 'demo-token',
        token_type: 'bearer',
        user: { id: 'demo-buyer', email: 'buyer@test.in', user_metadata: { role: 'buyer', user_type: 'buyer', name: 'Demo Buyer' }, app_metadata: { role: 'buyer' } }
      }));
      localStorage.setItem('demo-user-role', 'buyer');
      localStorage.setItem('demo-user-type', 'buyer');
      localStorage.setItem('demo-user-name', 'Demo Buyer');
    });
  });

  test('User support page renders and allows navigation', async ({ page }) => {
    await page.goto('/support');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    await page.waitForLoadState('networkidle');
    const headingVisible = await page.getByRole('heading', { name: /My Support Tickets/i }).isVisible().catch(() => false);
    expect.soft(headingVisible).toBeTruthy();
    const submitVisible = await page.getByRole('button', { name: /Submit Ticket/i }).isVisible().catch(() => false);
    expect.soft(submitVisible).toBeTruthy();
    await page.goto('/support/ticket-demo');
    await page.waitForLoadState('networkidle');
    const backLinkVisible = await page.getByText(/Back to tickets/i).first().isVisible().catch(() => false);
    expect.soft(backLinkVisible).toBeTruthy();
  });
});

test.describe('Admin Support Tickets', () => {
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

  test('Admin ticket desk and details route render', async ({ page }) => {
    await page.goto('/admin/tickets');
    const cookies = page.getByRole('button', { name: /Accept all/i });
    if (await cookies.isVisible().catch(() => false)) {
      await cookies.click();
    }
    const deskHeadingVisible = await page.getByRole('heading', { name: /Support Ticket Desk/i }).isVisible().catch(() => false);
    expect.soft(deskHeadingVisible).toBeTruthy();
    const columnVisible =
      (await page.getByText(/Open/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/In Progress/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/Waiting User/i).first().isVisible().catch(() => false)) ||
      (await page.getByText(/Resolved/i).first().isVisible().catch(() => false));
    expect.soft(columnVisible).toBeTruthy();
    await page.goto('/admin/support/ticket-demo');
    const backLinkVisible = await page.getByRole('link', { name: /Back to tickets/i }).isVisible().catch(() => false);
    expect.soft(backLinkVisible).toBeTruthy();
  });
});
