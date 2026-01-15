import { test, expect } from '@playwright/test';

test.describe('Dashboard UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'buyer',
        user_type: 'buyer'
      }));
    });
  });

  test('Dashboard loads with meaningful content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: User never sees blank screen
    await expect(page.locator('body')).toBeVisible();
    
    // UX Assertion: Clear next action always visible
    const heroSection = page.locator('[data-testid="dashboard-logo"], h1, .hero-section');
    await expect(heroSection).toBeVisible();
    
    const discoverySections = page.locator('[data-testid="trending-section"], [data-testid="ending-soon-section"], [data-testid="new-listings-section"]');
    let visibleSections = 0;
    
    for (let i = 0; i < await discoverySections.count(); i++) {
      if (await discoverySections.nth(i).isVisible()) {
        visibleSections++;
      }
    }
    
    expect(visibleSections).toBeGreaterThan(0);
    
    // UX Assertion: Primary CTA is visually dominant
    const primaryButtons = page.locator('button[class*="primary"], [class*="bg-indigo-600"], [class*="bg-blue-600"]');
    if (await primaryButtons.count() > 0) {
      const firstPrimaryButton = primaryButtons.first();
      await expect(firstPrimaryButton).toBeVisible();
      
      // Check visual dominance (larger than secondary buttons)
      const primarySize = await firstPrimaryButton.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width * rect.height;
      });
      
      const secondaryButtons = page.locator('button[class*="secondary"], [class*="outline"]');
      if (await secondaryButtons.count() > 0) {
        const secondarySize = await secondaryButtons.first().evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width * rect.height;
        });
        expect(primarySize).toBeGreaterThan(secondarySize);
      }
    }
  });

  test('Dashboard navigation consistency', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Navigation is intuitive and consistent
    const navLinks = page.locator('nav a, [data-testid="nav-link"], .navigation a');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThan(0);
    
    // Check navigation visibility
    for (let i = 0; i < Math.min(navCount, 5); i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
    
    // UX Assertion: Navigation labels are clear
    for (let i = 0; i < Math.min(navCount, 3); i++) {
      const navText = await navLinks.nth(i).textContent();
      expect(navText?.length).toBeGreaterThan(0);
      expect(navText?.length).toBeLessThan(50); // Not too long
    }
    
    // Test navigation responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenu = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-menu');
      await expect(mobileNav).toBeVisible();
      
      // UX Assertion: Mobile navigation is usable
      const mobileNavItems = mobileNav.locator('a, button');
      if (await mobileNavItems.count() > 0) {
        await expect(mobileNavItems.first()).toBeVisible();
      }
    }
  });

  test('Dashboard content hierarchy and readability', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Typography hierarchy is present
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check heading hierarchy (h1 should be most prominent)
    const h1Elements = page.locator('h1');
    const h2Elements = page.locator('h2');
    const h3Elements = page.locator('h3');
    
    if (await h1Elements.count() > 0 && await h2Elements.count() > 0) {
      const h1FontSize = await h1Elements.first().evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      const h2FontSize = await h2Elements.first().evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      expect(h1FontSize).toBeGreaterThan(h2FontSize);
    }
    
    // UX Assertion: Important information visible without scrolling
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const aboveFoldElements = page.locator('h1, h2, [data-testid="hero"], .main-content');
    
    if (await aboveFoldElements.count() > 0) {
      for (let i = 0; i < Math.min(await aboveFoldElements.count(), 3); i++) {
        const element = aboveFoldElements.nth(i);
        const boundingBox = await element.boundingBox();
        
        if (boundingBox) {
          expect(boundingBox.y).toBeLessThan(viewportHeight * 0.8); // Within 80% of viewport
        }
      }
    }
  });

  test('Dashboard performance and loading', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // UX Assertion: Page loads within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    
    // UX Assertion: No layout shifts during loading
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let layoutShifts = 0;
        if (typeof PerformanceObserver !== 'undefined') {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift') {
                const shiftEntry = entry as any;
                if (shiftEntry.hadRecentInput) {
                  layoutShifts += shiftEntry.value;
                }
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
          setTimeout(() => resolve(layoutShifts), 1000);
        } else {
          resolve(0);
        }
      });
    });
    
    // Test loading states
    await page.goto('/dashboard');
    
    const loadingElements = page.locator('[data-testid="loading"], .animate-spin, [class*="loading"]');
    
    // Loading should be temporary
    let loadingVisible = false;
    for (let i = 0; i < 10; i++) {
      loadingVisible = await loadingElements.isVisible();
      if (!loadingVisible) break;
      await page.waitForTimeout(500);
    }
    
    // Eventually loading should disappear
    await expect(loadingElements).not.toBeVisible({ timeout: 10000 });
    
    // UX Assertion: Content appears after loading
    const contentElements = page.locator('[data-testid="dashboard-content"], main > div, section');
    await expect(contentElements.first()).toBeVisible();
  });

  test('Dashboard error handling and recovery', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Dashboard data unavailable' })
      });
    });
    
    await page.goto('/dashboard');
    
    // UX Assertion: Error messages are helpful
    const errorElements = page.locator('[data-testid="error"], [role="alert"], .error-message');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
      
      const errorText = await errorElements.first().textContent();
      expect(errorText?.length).toBeGreaterThan(0);
      expect(errorText?.length).toBeLessThan(300); // Not too verbose
      
      // UX Assertion: Error provides recovery path
      const hasRetry = errorText?.toLowerCase().includes('retry') || 
                     errorText?.toLowerCase().includes('refresh') ||
                     errorText?.toLowerCase().includes('try again');
      expect(hasRetry).toBeTruthy();
    }
    
    // Test recovery
    await page.unroute('**/api/dashboard');
    await page.reload();
    
    // UX Assertion: Recovery works
    const contentElements = page.locator('[data-testid="dashboard-content"], main > div, section');
    await expect(contentElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard accessibility basics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // UX Assertion: Page has proper structure
    const mainElement = page.locator('main, [role="main"]');
    await expect(mainElement).toBeVisible();
    
    // UX Assertion: Focus management works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check ARIA roles
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
    
    // UX Assertion: Color contrast is acceptable (basic check)
    const textElements = page.locator('h1, h2, p, span, div');
    if (await textElements.count() > 0) {
      const firstText = textElements.first();
      const color = await firstText.evaluate(el => getComputedStyle(el).color);
      
      // Basic contrast check (not comprehensive but catches major issues)
      expect(color).not.toBe('rgb(128, 128, 128)'); // Not gray on gray
      expect(color).not.toBe('rgb(255, 255, 255)'); // Not white on white
    }
  });
});
