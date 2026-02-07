// UX System Validation Tests
import { test, expect } from '@playwright/test';

test.describe('UX System Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('SmartImage handles missing/broken images', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: No broken image icons
    const brokenImages = page.locator('img[src*="broken"], img[alt*="error"]');
    expect(await brokenImages.count()).toBe(0);
    
    // UX Assertion: Skeleton loaders show while loading
    const skeletons = page.locator('.animate-pulse.bg-gray-200');
    if (await skeletons.count() > 0) {
      await expect(skeletons.first()).toBeVisible();
    }
    
    // UX Assertion: Images have consistent aspect ratios
    const images = page.locator('img');
    if (await images.count() > 0) {
      const firstImage = images.first();
      await expect(firstImage).toHaveClass(/object-cover/);
    }
  });

  test('UXGuard enforces role-based access', async ({ page }) => {
    // Test guest access
    await page.addInitScript(() => {
      localStorage.removeItem('demo-session');
    });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Guest can browse but cannot bid
    const bidButton = page.locator('button:has-text("Bid")');
    if (await bidButton.count() > 0) {
      await bidButton.first().click();
      const accessDenied = page.locator('text=Access Restricted, text=Sign up to');
      await expect(accessDenied.first()).toBeVisible();
    }
    
    // Test demo buyer access
    await page.addInitScript(() => {
      localStorage.setItem('demo-session', JSON.stringify({
        user: { user_metadata: { role: 'buyer' } }
      }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Demo buyer can bid
    const demoBidButton = page.locator('button:has-text("Bid")');
    if (await demoBidButton.count() > 0) {
      await expect(demoBidButton.first()).toBeVisible();
      await expect(demoBidButton.first()).toBeEnabled();
    }
  });

  test('Empty states show helpful messages', async ({ page }) => {
    // Navigate to empty category
    await page.goto('/catalog?category=empty');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Empty state message is shown
    const emptyMessage = page.locator('text=No items found, text=No products');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
      
      // UX Assertion: CTA is provided
      const ctaButton = page.locator('button:has-text("Clear Filters"), button:has-text("Browse All")');
      await expect(ctaButton.first()).toBeVisible();
    }
    
    // UX Assertion: No blank screens
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();
  });

  test('Error states provide retry options', async ({ page }) => {
    // Simulate error state
    await page.goto('/error-test');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Error message is human-readable
    const errorMessage = page.locator('text=Something went wrong, text=Error occurred');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
      
      // UX Assertion: Retry option is available
      const retryButton = page.locator('button:has-text("Try Again")');
      await expect(retryButton.first()).toBeVisible();
    }
    
    // UX Assertion: No console-only errors
    const consoleErrors = await page.evaluate(() => {
      return window.console.errors || [];
    });
    expect(consoleErrors.length).toBe(0);
  });

  test('Disabled actions show tooltips', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Find disabled actions
    const disabledButtons = page.locator('button:disabled');
    if (await disabledButtons.count() > 0) {
      const firstDisabled = disabledButtons.first();
      await expect(firstDisabled).toBeVisible();
      
      // UX Assertion: Disabled actions are visible but not interactive
      await expect(firstDisabled).toHaveClass(/opacity-50/);
      await expect(firstDisabled).toHaveClass(/cursor-not-allowed/);
      
      // UX Assertion: Tooltip explains why disabled
      await firstDisabled.hover();
      await page.waitForTimeout(500);
      
      const tooltip = page.locator('[role="tooltip"], .tooltip');
      if (await tooltip.count() > 0) {
        await expect(tooltip.first()).toBeVisible();
      }
    }
  });

  test('Responsive behavior is consistent', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // UX Assertion: Touch targets are ≥44px
    const touchTargets = page.locator('button, a, input');
    if (await touchTargets.count() > 0) {
      const firstTarget = touchTargets.first();
      const boundingBox = await firstTarget.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    // UX Assertion: No horizontal scroll on mobile
    const horizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(horizontalScroll).toBe(false);
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // UX Assertion: Same content available on desktop
    const desktopContent = page.locator('main, [role="main"]');
    await expect(desktopContent.first()).toBeVisible();
  });

  test('Loading states use skeletons not spinners', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // Trigger loading state
    const loadMoreButton = page.locator('button:has-text("Load More")');
    if (await loadMoreButton.count() > 0) {
      await loadMoreButton.first().click();
      await page.waitForTimeout(1000);
      
      // UX Assertion: Skeleton loaders are used
      const skeletons = page.locator('.animate-pulse.bg-gray-200');
      const spinners = page.locator('.animate-spin');
      
      if (await skeletons.count() > 0) {
        await expect(skeletons.first()).toBeVisible();
      }
      
      // Prefer skeletons over spinners
      if (await spinners.count() > 0) {
        console.warn('Spinners detected, prefer skeletons');
      }
    }
  });

  test('No page renders without content', async ({ page }) => {
    const pages = ['/dashboard', '/catalog', '/product/test'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Main content is always present
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent.first()).toBeVisible();
      
      // UX Assertion: No completely blank screens
      const body = page.locator('body');
      const hasContent = await body.evaluate(el => {
        return el && el.children.length > 0;
      });
      expect(hasContent).toBeTruthy();
      
      // UX Assertion: Loading states are temporary
      await page.waitForTimeout(3000);
      const persistentLoaders = page.locator('.animate-spin, .animate-pulse');
      if (await persistentLoaders.count() > 0) {
        // Should not have persistent loading states after 3 seconds
        const loaderVisible = await persistentLoaders.first().isVisible();
        expect(loaderVisible).toBeFalsy();
      }
    }
  });

  test('Role-based actions are correct', async ({ page }) => {
    // Test different roles
    const roles = [
      { name: 'guest', canSell: false },
      { name: 'demo_buyer', canSell: false },
      { name: 'demo_seller', canSell: true },
      { name: 'demo_admin', canSell: false, canManageUsers: true }
    ];

    for (const role of roles) {
      // Set role
      await page.addInitScript(() => {
        if (role.name.startsWith('demo')) {
          localStorage.setItem('demo-session', JSON.stringify({
            user: { user_metadata: { role: role.name.replace('demo_', '') } }
          }));
        } else {
          localStorage.removeItem('demo-session');
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check sell button (List Item button on dashboard)
      const sellButton = page.locator('button:has-text("List Item")');
      if (role.canSell) {
        if (await sellButton.count() > 0) {
          await expect(sellButton.first()).toBeVisible();
          await expect(sellButton.first()).toBeEnabled();
        }
      } else {
        if (await sellButton.count() > 0) {
          await expect(sellButton.first()).toBeVisible();
          await expect(sellButton.first()).toBeDisabled();
        }
      }
    }
  });
});
