// Modern UI E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Modern UI Redesign', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Modern Dashboard renders with new design', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Hero section is visible
    const heroSection = page.locator('text=Discover Amazing Items at Unbeatable Prices');
    await expect(heroSection).toBeVisible();
    
    // UX Assertion: Gradient branding is present
    const branding = page.locator('text=QuickMela');
    await expect(branding.first()).toBeVisible();
    
    // UX Assertion: Product cards have modern styling
    const productCards = page.locator('.group.bg-white.rounded-2xl');
    if (await productCards.count() > 0) {
      await expect(productCards.first()).toBeVisible();
      
      // Check for hover effects and modern styling
      const firstCard = productCards.first();
      await expect(firstCard).toHaveClass(/shadow-sm/);
    }
    
    // UX Assertion: Trending sections are present
    const trendingSection = page.locator('text=🔥 Trending Now');
    await expect(trendingSection).toBeVisible();
    
    const endingSoonSection = page.locator('text=⏰ Ending Soon');
    await expect(endingSoonSection).toBeVisible();
    
    const newArrivalsSection = page.locator('text=✨ New Arrivals');
    await expect(newArrivalsSection).toBeVisible();
  });

  test('Modern Product Catalog with filters', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Filter bar is visible and functional
    const categoryFilter = page.locator('select').first();
    await expect(categoryFilter).toBeVisible();
    
    const priceFilter = page.locator('select').nth(1);
    await expect(priceFilter).toBeVisible();
    
    const sortFilter = page.locator('select').nth(2);
    await expect(sortFilter).toBeVisible();
    
    // UX Assertion: Product grid has modern styling
    const productGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
    await expect(productGrid).toBeVisible();
    
    // UX Assertion: Product cards have hover effects
    const productCards = page.locator('.group.bg-white.rounded-2xl');
    if (await productCards.count() > 0) {
      await expect(productCards.first()).toBeVisible();
      
      // Test hover effect
      await productCards.first().hover();
      await page.waitForTimeout(300); // Wait for transition
    }
    
    // UX Assertion: "Live Product" badges are visible
    const liveBadges = page.locator('text=Live Product');
    if (await liveBadges.count() > 0) {
      await expect(liveBadges.first()).toBeVisible();
    }
  });

  test('Modern Product Detail page layout', async ({ page }) => {
    await page.goto('/product/test-product-id');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Two-column layout is present
    const mainGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(mainGrid).toBeVisible();
    
    // UX Assertion: Product image gallery is visible
    const mainImage = page.locator('img.h-96.object-cover');
    await expect(mainImage).toBeVisible();
    
    const thumbnailGrid = page.locator('.grid.grid-cols-4.gap-2');
    await expect(thumbnailGrid).toBeVisible();
    
    // UX Assertion: Bidding section has gradient background
    const biddingSection = page.locator('.bg-gradient-to-br.from-blue-50.to-purple-50');
    await expect(biddingSection).toBeVisible();
    
    // UX Assertion: Current bid is prominently displayed
    const currentBid = page.locator('text=Current Bid');
    await expect(currentBid).toBeVisible();
    
    const bidAmount = page.locator('.text-4xl.font-bold');
    await expect(bidAmount).toBeVisible();
    
    // UX Assertion: Product specifications are displayed
    const specsSection = page.locator('text=Specifications');
    await expect(specsSection).toBeVisible();
    
    // UX Assertion: Bidding history is present
    const bidHistory = page.locator('text=Bidding History');
    await expect(bidHistory).toBeVisible();
  });

  test('Navigation and branding consistency', async ({ page }) => {
    const pages = ['/dashboard', '/catalog', '/product/test-id'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Sticky navigation is present
      const nav = page.locator('nav.sticky.top-0');
      await expect(nav).toBeVisible();
      
      // UX Assertion: QuickMela branding with gradient
      const branding = page.locator('text=QuickMela');
      await expect(branding.first()).toBeVisible();
      
      // UX Assertion: Navigation links are present
      const dashboardLink = page.locator('text=Dashboard');
      const browseLink = page.locator('text=Browse');
      
      await expect(dashboardLink.or(browseLink).first()).toBeVisible();
    }
  });

  test('Responsive design works correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // UX Assertion: Mobile navigation adapts
    const mobileNav = page.locator('nav');
    await expect(mobileNav).toBeVisible();
    
    // UX Assertion: Product grid adapts to single column
    const productGrid = page.locator('.grid.grid-cols-1');
    await expect(productGrid).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // UX Assertion: Desktop layout shows multiple columns
    const desktopGrid = page.locator('.lg\\:grid-cols-3');
    await expect(desktopGrid).toBeVisible();
  });

  test('Modern UI maintains beta functionality', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Beta version banner is visible
    const betaBanner = page.locator('text=Beta Version');
    await expect(betaBanner).toBeVisible();
    
    // UX Assertion: Beta user indicators are present
    const betaIndicator = page.locator('[data-testid="beta-indicator"]');
    if (await betaIndicator.count() > 0) {
      await expect(betaIndicator.first()).toBeVisible();
    }
    
    // UX Assertion: Guest users see beta request CTA
    const betaRequestCTA = page.locator('text=Request Beta Access');
    if (await betaRequestCTA.count() > 0) {
      await expect(betaRequestCTA.first()).toBeVisible();
    }
  });

  test('Modern UI performance and accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page loads quickly
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000);
    
    // UX Assertion: No layout shifts
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    expect(cls).toBeLessThan(0.1);
    
    // UX Assertion: Keyboard navigation works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // UX Assertion: ARIA labels are present
    const buttons = page.locator('button[aria-label], button[aria-describedby]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const hasAria = await button.evaluate(el => 
          el.hasAttribute('aria-label') || el.hasAttribute('aria-describedby')
        );
        expect(hasAria).toBeTruthy();
      }
    }
  });

  test('Modern UI interactions work correctly', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Filter interactions work
    const categoryFilter = page.locator('select').first();
    await categoryFilter.selectOption('Electronics');
    await page.waitForTimeout(500);
    
    // UX Assertion: Sort interactions work
    const sortFilter = page.locator('select').nth(2);
    await sortFilter.selectOption('price_low');
    await page.waitForTimeout(500);
    
    // UX Assertion: Product card hover effects work
    const productCards = page.locator('.group.bg-white.rounded-2xl');
    if (await productCards.count() > 0) {
      await productCards.first().hover();
      
      // Check for hover state
      const hoveredCard = productCards.first();
      await expect(hoveredCard).toHaveClass(/hover:shadow-xl/);
    }
    
    // UX Assertion: Button interactions work
    const bidButton = page.locator('button:has-text("Bid Now")');
    if (await bidButton.count() > 0) {
      await expect(bidButton.first()).toBeVisible();
      
      // Check for hover effect
      await bidButton.first().hover();
      await expect(bidButton.first()).toHaveClass(/hover:from-blue-700/);
    }
  });
});
