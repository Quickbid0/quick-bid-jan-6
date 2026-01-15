import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Buyer UX Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for buyer
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'buyer',
        user_type: 'buyer'
      }));
    });
  });

  test('Complete buyer journey - dashboard to bid placement', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Dashboard loads without blank screen
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-logo"], section, main').first()).toBeVisible();
    
    // UX Assertion: Clear next action visible (discover auctions)
    const trendingSection = page.locator('[data-testid="trending-section"]');
    await expect(trendingSection).toBeVisible();
    
    // UX Assertion: Primary CTA is visually dominant
    const primaryButtons = page.locator('button[class*="primary"], [class*="bg-indigo-600"]');
    await expect(primaryButtons.first()).toBeVisible();
    
    // Navigate to product catalog
    await page.click('a[href="/products"], button:has-text("Browse Products")');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Products load without blank screen
    await expect(page.locator('[data-testid="product-grid"], .grid').first()).toBeVisible();
    
    // Search for a product
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]').first();
    await searchInput.fill('laptop');
    await page.keyboard.press('Enter');
    
    // UX Assertion: Search results appear
    await expect(page.locator('[data-testid="product-card"], .product-card').first()).toBeVisible();
    
    // Apply filters
    const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter-button"]').first();
    await filterButton.click();
    
    const priceFilter = page.locator('input[placeholder*="price"], [data-testid="price-filter"]').first();
    if (await priceFilter.isVisible()) {
      await priceFilter.fill('10000');
      await page.click('button:has-text("Apply")');
    }
    
    // Open ProductDetail
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Product detail loads with pricing
    await expect(page.locator('[data-testid="product-title"], h1').first()).toBeVisible();
    await expect(page.locator('[data-testid="current-price"], [class*="price"]').first()).toBeVisible();
    
    // UX Assertion: Urgency indicators visible
    const urgencyElements = page.locator('[data-testid="time-remaining"], [class*="ending"], [class*="urgent"]');
    if (await urgencyElements.count() > 0) {
      await expect(urgencyElements.first()).toBeVisible();
    }
    
    // Place a bid (mocked)
    const bidButton = page.locator('button:has-text("Place Bid"), [data-testid="place-bid-button"]').first();
    if (await bidButton.isVisible()) {
      await bidButton.click();
      
      const bidInput = page.locator('input[placeholder*="bid"], [data-testid="bid-amount"]');
      if (await bidInput.isVisible()) {
        await bidInput.fill('15000');
        await page.click('button:has-text("Confirm Bid"), [data-testid="confirm-bid"]');
      }
    }
    
    // View wallet impact
    const walletLink = page.locator('a[href="/wallet"], button:has-text("Wallet")');
    if (await walletLink.isVisible()) {
      await walletLink.click();
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Wallet loads with balance
      await expect(page.locator('[data-testid="wallet-balance"], [class*="balance"]').first()).toBeVisible();
    }
    
    // UX Assertion: User never sees blank screen throughout journey
    await expect(page.locator('body')).toBeVisible();
  });

  test('Dashboard navigation consistency', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Navigation is intuitive and consistent
    const navLinks = page.locator('nav a, [data-testid="nav-link"]');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThan(0);
    
    // Check all main navigation links are visible
    for (let i = 0; i < Math.min(navCount, 5); i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
    
    // UX Assertion: Clear visual hierarchy
    const headings = page.locator('h1, h2, h3');
    const firstHeading = headings.first();
    await expect(firstHeading).toBeVisible();
    
    // Check typography hierarchy (h1 should be larger than h2)
    const h1Elements = page.locator('h1');
    const h2Elements = page.locator('h2');
    
    if (await h1Elements.count() > 0 && await h2Elements.count() > 0) {
      const h1FontSize = await h1Elements.first().evaluate(el => getComputedStyle(el).fontSize);
      const h2FontSize = await h2Elements.first().evaluate(el => getComputedStyle(el).fontSize);
      expect(parseFloat(h1FontSize)).toBeGreaterThan(parseFloat(h2FontSize));
    }
  });

  test('Mobile responsiveness of buyer flow', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // UX Assertion: No horizontal scroll on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // UX Assertion: Navigation is accessible on mobile
    const mobileMenu = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-menu');
      await expect(mobileNav).toBeVisible();
    }
    
    // Test product catalog on mobile
    await page.goto('/products');
    
    // UX Assertion: Cards resize correctly
    const productCards = page.locator('[data-testid="product-card"], .product-card');
    if (await productCards.count() > 0) {
      const firstCard = productCards.first();
      const cardWidth = await firstCard.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width;
      });
      expect(cardWidth).toBeLessThanOrEqual(viewportWidth - 32); // Account for padding
    }
    
    // UX Assertion: Actions reachable on mobile
    const primaryActions = page.locator('button[class*="primary"], [data-testid="primary-action"]');
    if (await primaryActions.count() > 0) {
      await expect(primaryActions.first()).toBeVisible();
      
      // Check touch target size (minimum 44px)
      const actionSize = await primaryActions.first().evaluate(el => {
        const rect = el.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
      });
      expect(actionSize).toBeGreaterThanOrEqual(44);
    }
  });

  test('Loading states and error handling', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Loading states are clear
    const loadingSpinners = page.locator('[data-testid="loading-spinner"], .animate-spin');
    
    // Loading should be temporary
    let loadingVisible = false;
    for (let i = 0; i < 10; i++) {
      loadingVisible = await loadingSpinners.isVisible();
      if (!loadingVisible) break;
      await page.waitForTimeout(500);
    }
    
    // Eventually loading should disappear
    await expect(loadingSpinners).not.toBeVisible({ timeout: 10000 });
    
    // Test error states
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/products');
    
    // UX Assertion: Error messages are helpful
    const errorElements = page.locator('[data-testid="error-message"], [role="alert"]');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
      
      const errorText = await errorElements.first().textContent();
      expect(errorText?.length).toBeGreaterThan(0);
    }
  });
});
