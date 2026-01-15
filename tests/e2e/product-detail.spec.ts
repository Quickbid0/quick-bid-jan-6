import { test, expect } from '@playwright/test';

test.describe('Product Detail Critical Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for product detail access
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('ProductDetail renders image gallery', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Page must not be empty
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // CRITICAL: Image gallery must be visible
    const imageGallery = page.locator('img[alt*="product"], .product-image, [data-testid*="image"]');
    await expect(imageGallery).toBeVisible();
    
    // Verify main product image
    const mainImage = page.locator('img').first();
    await expect(mainImage).toBeVisible();
    
    // Page should have meaningful content height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(400);
  });

  test('ProductDetail shows price hierarchy', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Price information must be visible
    const priceInfo = page.locator('text=/₹|Rs|price|bid/i, [data-testid*="price"]');
    await expect(priceInfo).toBeVisible();
    
    // Verify current bid is displayed
    const currentBid = page.locator('text=/current bid|₹[0-9]/i');
    await expect(currentBid).toBeVisible();
    
    // Verify price formatting
    const priceElements = page.locator('text=/₹[0-9]+/i');
    const priceCount = await priceElements.count();
    expect(priceCount).toBeGreaterThan(0);
  });

  test('ProductDetail shows primary CTA', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Primary CTA must be visible
    const primaryCTA = page.locator('button:has-text("Place Bid"), button:has-text("Join Auction"), [data-testid*="bid"], .btn-primary');
    await expect(primaryCTA).toBeVisible();
    
    // Verify CTA is clickable
    const isClickable = await primaryCTA.isEnabled();
    expect(isClickable).toBeTruthy();
    
    // CTA should be prominent (not hidden)
    const ctaVisible = await primaryCTA.isVisible();
    expect(ctaVisible).toBeTruthy();
  });

  test('ProductDetail never shows blank screen', async ({ page }) => {
    await page.goto('/product/1');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Multiple content elements must be present
    const contentElements = page.locator('h1, h2, h3, img, button, section, main');
    const elementCount = await contentElements.count();
    expect(elementCount).toBeGreaterThan(3);
    
    // Verify text content exists
    const textContent = page.locator('text=/product|price|bid|description|seller/i');
    const textCount = await textContent.count();
    expect(textCount).toBeGreaterThan(0);
    
    // Page should not be just a loading state
    const loadingIndicators = page.locator('.animate-spin, [data-testid*="loading"]');
    const loadingCount = await loadingIndicators.count();
    
    // If loading exists, content should also exist
    if (loadingCount > 0) {
      const content = page.locator('main, section, .product-content');
      await expect(content).toBeVisible();
    }
  });

  test('ProductDetail handles missing product gracefully', async ({ page }) => {
    await page.goto('/product/nonexistent');
    await page.waitForLoadState('networkidle');
    
    // Should show error state or redirect
    const currentUrl = page.url();
    
    // Either shows error page or redirects
    const hasError = await page.locator('text=/error|not found|404/i').count() > 0;
    const hasRedirected = !currentUrl.includes('/product/nonexistent');
    
    expect(hasError || hasRedirected).toBeTruthy();
  });
});
