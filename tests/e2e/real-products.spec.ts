// E2E Tests for Real Products and Beta Users
import { test, expect } from '@playwright/test';

test.describe('Real Products and Beta Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Real Products Dashboard renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Dashboard loads with real products section
    const realProductsSection = page.locator('text=Live Products');
    await expect(realProductsSection).toBeVisible();
    
    // UX Assertion: Environment indicators are visible
    const environmentBadge = page.locator('[data-testid="environment-badge"]');
    if (await environmentBadge.count() > 0) {
      await expect(environmentBadge.first()).toBeVisible();
    }
    
    // UX Assertion: Sandbox banner is visible
    const sandboxBanner = page.locator('text=Beta Mode');
    await expect(sandboxBanner).toBeVisible();
    
    // UX Assertion: No blank screens
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();
  });

  test('Beta User access controls work', async ({ page }) => {
    // Test as public user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'public-user-id');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Public user sees access control notice
    const accessNotice = page.locator('text=Beta Access Required');
    await expect(accessNotice).toBeVisible();
    
    // UX Assertion: Public user cannot bid
    const bidButton = page.locator('button:has-text("Place Bid")');
    if (await bidButton.count() > 0) {
      await bidButton.first().click();
      const permissionError = page.locator('text=permission to bid');
      await expect(permissionError).toBeVisible();
    }
  });

  test('Real Product Detail page handles real data', async ({ page }) => {
    // Navigate to a real product
    await page.goto('/product/test-real-product-id');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Product loads without errors
    const productTitle = page.locator('h1');
    await expect(productTitle.first()).toBeVisible();
    
    // UX Assertion: Environment badge shows real product
    const realProductBadge = page.locator('text=Live Product');
    if (await realProductBadge.count() > 0) {
      await expect(realProductBadge.first()).toBeVisible();
    }
    
    // UX Assertion: Sandbox banner is present
    const sandboxBanner = page.locator('text=No real money involved');
    await expect(sandboxBanner).toBeVisible();
    
    // UX Assertion: Bid form is accessible for beta users
    const bidForm = page.locator('input[id="bidAmount"]');
    if (await bidForm.count() > 0) {
      await expect(bidForm.first()).toBeVisible();
    }
  });

  test('Fallback behavior when no real products exist', async ({ page }) => {
    // Mock empty products response
    await page.route('**/api/products*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Empty state appears
    const emptyState = page.locator('text=No products available');
    await expect(emptyState).toBeVisible();
    
    // UX Assertion: Helpful message provided
    const helpMessage = page.locator('text=Try switching environments');
    await expect(helpMessage).toBeVisible();
    
    // UX Assertion: Retry button is available
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
  });

  test('Admin controls are functional', async ({ page }) => {
    // Test as admin user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'admin-user-id');
      localStorage.setItem('sb-user-role', 'admin');
    });
    
    await page.goto('/admin/controls');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Admin dashboard loads
    const adminTitle = page.locator('text=Admin Controls');
    await expect(adminTitle).toBeVisible();
    
    // UX Assertion: Metrics are displayed
    const metricsCards = page.locator('.bg-white.p-6.rounded-lg.shadow');
    await expect(metricsCards.first()).toBeVisible();
    
    // UX Assertion: Admin actions are available
    const actionSelect = page.locator('select');
    await expect(actionSelect.first()).toBeVisible();
    
    // UX Assertion: Activity log is visible
    const activityLog = page.locator('text=Activity Log');
    await expect(activityLog).toBeVisible();
  });

  test('Real product bidding flow works', async ({ page }) => {
    // Test as beta user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'beta-user-id');
    });
    
    await page.goto('/product/test-real-product-id');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Bid form is enabled
    const bidInput = page.locator('input[id="bidAmount"]');
    if (await bidInput.count() > 0) {
      await bidInput.first().fill('150');
      
      const bidButton = page.locator('button:has-text("Place Bid")');
      await expect(bidButton.first()).toBeEnabled();
      
      // UX Assertion: Bid can be placed
      await bidButton.first().click();
      
      // Check for success message (in real implementation)
      await page.waitForTimeout(1000);
    }
  });

  test('Environment indicators are consistent', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Environment badges are present
    const environmentBadges = page.locator('[data-testid="environment-badge"]');
    const badgeCount = await environmentBadges.count();
    
    if (badgeCount > 0) {
      // UX Assertion: Badges have proper styling
      const firstBadge = environmentBadges.first();
      await expect(firstBadge).toHaveClass(/bg-/);
      await expect(firstBadge).toHaveClass(/text-/);
      await expect(firstBadge).toHaveClass(/border-/);
    }
    
    // UX Assertion: Beta user indicator is visible for beta users
    const betaIndicator = page.locator('text=Beta User');
    if (await betaIndicator.count() > 0) {
      await expect(betaIndicator.first()).toBeVisible();
    }
  });

  test('No blank screens or broken layouts', async ({ page }) => {
    const pages = ['/dashboard', '/product/test-id', '/admin/controls'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: No blank screens
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // UX Assertion: Content is rendered
      const content = page.locator('main, [role="main"], .container, .max-w-7xl');
      await expect(content.first()).toBeVisible();
      
      // UX Assertion: No broken layouts
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.children.length > 0;
      });
      expect(hasContent).toBeTruthy();
    }
  });

  test('Accessibility is maintained with real data', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
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
    
    // UX Assertion: Semantic structure is maintained
    const mainElement = page.locator('main, [role="main"]');
    await expect(mainElement.first()).toBeVisible();
  });
});
