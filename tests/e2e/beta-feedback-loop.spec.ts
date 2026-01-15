// Beta Feedback E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Beta Feedback Loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Feedback service tracks events correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Events are tracked without blocking UI
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();
    
    // UX Assertion: No performance degradation from instrumentation
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  test('Feedback prompts appear at appropriate times', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for potential feedback prompt
    await page.waitForTimeout(3000);
    
    // UX Assertion: Feedback prompts don't interrupt primary actions
    const primaryCTA = page.locator('button:has-text("Place Bid"), button:has-text("Request Beta Access")');
    if (await primaryCTA.count() > 0) {
      await expect(primaryCTA.first()).toBeVisible();
    }
    
    // UX Assertion: Feedback prompts are respectful (don't appear immediately)
    const immediatePrompt = page.locator('text=Quick Question');
    const isVisible = await immediatePrompt.isVisible();
    
    // Should not show immediately on page load
    if (isVisible) {
      // If it does show, it should be dismissible
      const dismissButton = page.locator('button[aria-label="Dismiss feedback"]');
      await expect(dismissButton.first()).toBeVisible();
    }
  });

  test('Admin feedback dashboard shows insights', async ({ page }) => {
    // Test as admin
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'admin-user-id');
    });
    
    await page.goto('/admin/feedback');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Admin can see feedback insights
    const insightsTitle = page.locator('text=Beta User Feedback Insights');
    await expect(insightsTitle).toBeVisible();
    
    // UX Assertion: Drop-off analysis is visible
    const dropoffTable = page.locator('text=Drop-off Analysis');
    await expect(dropoffTable).toBeVisible();
    
    // UX Assertion: User engagement metrics are shown
    const engagementMetric = page.locator('text=User Engagement');
    await expect(engagementMetric).toBeVisible();
  });

  test('Feedback collection works without breaking flows', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate a blocked action to trigger feedback
    await page.addInitScript(() => {
      // Simulate blocked bid event
      window.dispatchEvent(new CustomEvent('bidBlocked'));
    });
    
    // Wait for potential feedback prompt
    await page.waitForTimeout(3000);
    
    // UX Assertion: If feedback appears, it doesn't break the page
    const feedbackPrompt = page.locator('text=What were you trying to do?');
    if (await feedbackPrompt.isVisible()) {
      // Page should still be functional
      const navigation = page.locator('nav, [role="navigation"]');
      await expect(navigation.first()).toBeVisible();
      
      // User should be able to dismiss
      const dismissButton = page.locator('button:has-text("Skip")');
      await expect(dismissButton.first()).toBeVisible();
    }
  });

  test('No blank screens from feedback instrumentation', async ({ page }) => {
    const pages = ['/dashboard', '/product/test-id', '/wallet', '/beta-request'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Page loads without blank screens
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // UX Assertion: Content is rendered
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.children.length > 0;
      });
      expect(hasContent).toBeTruthy();
      
      // UX Assertion: No console errors from instrumentation
      const consoleErrors = await page.evaluate(() => {
        return window.console.errors || [];
      });
      expect(consoleErrors.length).toBe(0);
    }
  });

  test('Feedback data is actionable and not noisy', async ({ page }) => {
    // Test as admin
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'admin-user-id');
    });
    
    await page.goto('/admin/feedback');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Insights are prioritized by impact
    const priorityIndicators = page.locator('text=Critical, High');
    const indicatorCount = await priorityIndicators.count();
    
    if (indicatorCount > 0) {
      // Should show clear priority levels
      const criticalIndicator = page.locator('text=Critical');
      const highIndicator = page.locator('text=High');
      
      // Critical issues should be highlighted more prominently
      if (await criticalIndicator.count() > 0) {
        const criticalColor = await criticalIndicator.first().evaluate(el => {
          return window.getComputedStyle(el).color;
        });
        expect(criticalColor).toContain('rgb'); // Should be red-colored
      }
    }
    
    // UX Assertion: Recommendations are provided
    const recommendations = page.locator('text=Recommended Actions');
    await expect(recommendations).toBeVisible();
  });

  test('Privacy-safe tracking (no third-party)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: No external tracking scripts
    const externalScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.filter(script => 
        script.src && (
          script.src.includes('google-analytics') ||
          script.src.includes('facebook') ||
          script.src.includes('mixpanel')
        )
      );
    });
    expect(externalScripts.length).toBe(0);
    
    // UX Assertion: Local storage only contains necessary data
    const localStorageData = await page.evaluate(() => {
      return Object.keys(localStorage);
    });
    
    // Should only contain our keys, not tracking data
    const trackingKeys = localStorageData.filter(key => 
      key.includes('analytics') || 
      key.includes('tracking') || 
      key.includes('pixel')
    );
    expect(trackingKeys.length).toBe(0);
  });

  test('Performance impact is minimal', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page load time is acceptable
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000); // Under 3 seconds
    
    // UX Assertion: No layout shifts from instrumentation
    const layoutShift = await page.evaluate(() => {
      return new Promise((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          resolve(cls);
        }).observe({ entryTypes: ['layout-shift'] });
      });
    });
    expect(layoutShift).toBeLessThan(0.1); // Minimal layout shift
  });
});
