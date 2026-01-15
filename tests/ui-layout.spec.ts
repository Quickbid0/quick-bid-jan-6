import { test, expect } from '@playwright/test';

test.describe('UI layout validation', () => {
  const demoSession = {
    user: {
      id: 'demo-user-uid',
      user_metadata: {
        name: 'Playwright Tester',
      },
    },
  };

  test('catalog hero, filters, and card grid align', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();
    await expect(page.locator('button:has-text("Filters")')).toBeVisible();
    await expect(page.locator('text=Discover Amazing Deals')).toBeVisible();
    await expect(page.locator('button:has-text("View details")').first()).toBeVisible();
  });

  test('product detail hero action column remains structured', async ({ page }) => {
    await page.goto('/catalog');
    await page.getByRole('button', { name: /View details/i }).first().click();
    await expect.soft(page.getByText('Current Bid').first()).toBeVisible({ timeout: 10000 });
    await expect.soft(page.getByText(/Buyer Readiness/i)).toBeVisible({ timeout: 10000 });

    const placeBidBtn = page.getByRole('button', { name: /Place Bid/i }).first();
    const placeBidVisible = await placeBidBtn.isVisible().catch(() => false);
    expect.soft(placeBidVisible).toBe(true);

    await expect.soft(page.getByRole('button', { name: /Wishlist|Wishlisted/i })).toBeVisible({ timeout: 10000 });
  });

  test('buyer dashboard keeps cards aligned when demo user is logged in', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        user: {
          id: 'demo-user-uid',
          user_metadata: {
            name: 'Playwright Tester',
          },
        },
      }));
      localStorage.setItem('demo-user-role', 'user');
      localStorage.setItem('demo-user-name', 'Playwright Tester');
      localStorage.setItem('demo-user-id', 'demo-user-uid');
    });
    await page.goto('/buyer/dashboard');
    await expect(page.getByRole('heading', { name: /Buyer Dashboard/i })).toBeVisible({ timeout: 10000 });
    await expect.soft(page.getByText(/Wallet Balance/i)).toBeVisible({ timeout: 5000 });
    await expect.soft(page.getByRole('link', { name: 'Browse auctions', exact: true })).toBeVisible({ timeout: 5000 });
  });
});
