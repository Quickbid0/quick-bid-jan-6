import { test, expect } from '@playwright/test';

test.describe('Product Catalog Critical Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for catalog access
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Catalog page renders product grid', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Page must not be empty
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // CRITICAL: Product grid must be visible
    const productGrid = page.locator('.grid, .flex-grid, [class*="grid"]');
    await expect(productGrid).toBeVisible();
    
    // Verify product cards exist
    const productCards = page.locator('[data-testid*="auction-card"], .bg-white.rounded-xl');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Page should have meaningful content
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(500);
  });

  test('Clicking product card opens ProductDetail', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Find first product card
    const firstCard = page.locator('[data-testid*="auction-card"], .bg-white.rounded-xl').first();
    await expect(firstCard).toBeVisible();
    
    // Click on the card
    await firstCard.click();
    
    // CRITICAL: Should navigate to product detail
    await page.waitForURL('**/product/**');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/product/');
    
    // Verify product detail page content
    const productDetail = page.locator('h1, .product-title, [data-testid*="product"]');
    await expect(productDetail).toBeVisible();
  });

  test('Catalog handles empty state gracefully', async ({ page }) => {
    // Mock empty catalog response
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] })
      });
    });
    
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Page should not be blank
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should show empty state OR search filters
    const emptyState = page.locator('text=/No products|Empty|No results/i');
    const filters = page.locator('input[placeholder*="Search"], .filter, select');
    
    const hasContent = await emptyState.count() > 0 || await filters.count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('Catalog never shows only loading spinner', async ({ page }) => {
    await page.goto('/catalog');
    
    // Loading should disappear within reasonable time
    const loadingSpinner = page.locator('[data-testid*="loading"], .animate-spin');
    
    try {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    } catch (error) {
      throw new Error('Catalog stuck in loading state - regression detected');
    }
    
    // Content should appear
    const content = page.locator('main, section, .grid');
    await expect(content).toBeVisible();
  });
});
