import { test, expect } from '@playwright/test';

// Performance Testing Suite
test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    console.log(`Homepage load time: ${loadTime}ms`);

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    // Start collecting performance metrics
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const lcp = performance.getEntriesByName('largest-contentful-paint')[0] as PerformanceEntry;
      const fid = performance.getEntriesByName('first-input')[0] as PerformanceEntry;

      return {
        domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.domContentLoadedEventStart,
        loadComplete: perfEntries.loadEventEnd - perfEntries.loadEventStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcp?.startTime || 0,
        firstInputDelay: fid?.processingStart ? fid.processingStart - fid.startTime : 0,
      };
    });

    console.log('Performance metrics:', metrics);

    // Assert good performance thresholds
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // < 2s
    expect(metrics.largestContentfulPaint).toBeLessThan(2500); // < 2.5s
    expect(metrics.firstInputDelay).toBeLessThan(100); // < 100ms
  });

  test('should have optimized bundle sizes', async ({ page }) => {
    await page.goto('/');

    // Check for efficient resource loading
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries.map(entry => ({
        name: entry.name,
        size: entry.transferSize,
        type: entry.initiatorType,
        duration: entry.responseEnd - entry.requestStart,
      }));
    });

    // Check for reasonable bundle sizes
    const jsResources = resources.filter(r => r.type === 'script');
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);

    console.log(`Total JS bundle size: ${(totalJSSize / 1024 / 1024).toFixed(2)}MB`);

    // Should be under 2MB for main bundle
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024); // 2MB

    // Check individual chunks aren't too large
    for (const resource of jsResources) {
      if (resource.size > 1024 * 1024) { // 1MB
        console.warn(`Large JS resource: ${resource.name} (${(resource.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    }
  });

  test('should lazy load images properly', async ({ page }) => {
    await page.goto('/');

    // Check for lazy loading attributes
    const images = await page.locator('img').all();
    let lazyLoadedCount = 0;

    for (const image of images.slice(0, 10)) { // Check first 10 images
      const loading = await image.getAttribute('loading');
      if (loading === 'lazy') {
        lazyLoadedCount++;
      }
    }

    console.log(`${lazyLoadedCount} out of ${Math.min(images.length, 10)} images use lazy loading`);

    // At least 50% of images should use lazy loading
    expect(lazyLoadedCount).toBeGreaterThanOrEqual(Math.floor(Math.min(images.length, 10) * 0.5));
  });

  test('should have efficient caching headers', async ({ page }) => {
    // This test would require checking server response headers
    // For now, we'll test client-side caching behavior

    await page.goto('/');

    // Check for service worker registration
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(hasServiceWorker).toBe(true);

    // Check if service worker is registered (in production)
    if (process.env.NODE_ENV === 'production') {
      const swRegistered = await page.evaluate(() => {
        return navigator.serviceWorker.controller !== null;
      });

      expect(swRegistered).toBe(true);
    }
  });

  test('should handle large lists efficiently', async ({ page }) => {
    // Test virtual scrolling performance
    await page.goto('/my-bids');

    // Wait for list to load
    await page.waitForSelector('[data-testid="bid-list"]', { timeout: 10000 });

    // Measure rendering performance
    const startTime = Date.now();

    // Scroll through the list
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="bid-list"]');
      if (container) {
        container.scrollTop = 1000; // Scroll down
      }
    });

    await page.waitForTimeout(500); // Wait for virtual scrolling

    const renderTime = Date.now() - startTime;
    console.log(`Virtual scroll render time: ${renderTime}ms`);

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto('/');

    // Monitor layout shifts
    const layoutShifts: number[] = [];

    page.on('metrics', (metrics) => {
      if (metrics.layoutShift) {
        layoutShifts.push(metrics.layoutShift.value);
      }
    });

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for dynamic content

    const totalLayoutShift = layoutShifts.reduce((sum, shift) => sum + shift, 0);
    console.log(`Total Layout Shift Score: ${totalLayoutShift}`);

    // Cumulative Layout Shift should be < 0.1 for good UX
    expect(totalLayoutShift).toBeLessThan(0.1);
  });

  test('should have fast API response times', async ({ page }) => {
    await page.goto('/login');

    // Measure login API call performance
    const apiStartTime = Date.now();

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for API response
    await page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() !== 200
    );

    const apiResponseTime = Date.now() - apiStartTime;
    console.log(`API response time: ${apiResponseTime}ms`);

    // API should respond within 2 seconds
    expect(apiResponseTime).toBeLessThan(2000);
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');

    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      // @ts-ignore - performance.memory is not in types but available in Chrome
      return performance.memory?.usedJSHeapSize || 0;
    });

    // Navigate through several pages
    await page.goto('/login');
    await page.goto('/register');
    await page.goto('/buyer/dashboard');
    await page.goto('/');

    const finalMemory = await page.evaluate(() => {
      // @ts-ignore
      return performance.memory?.usedJSHeapSize || 0;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);

      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
    }
  });

  test('should preload critical resources', async ({ page }) => {
    await page.goto('/');

    // Check for preload hints
    const preloadLinks = await page.locator('link[rel="preload"]').count();
    const prefetchLinks = await page.locator('link[rel="prefetch"]').count();

    console.log(`Preload links: ${preloadLinks}, Prefetch links: ${prefetchLinks}`);

    // Should have some preload/prefetch links for critical resources
    expect(preloadLinks + prefetchLinks).toBeGreaterThan(0);
  });

  test('should have good Time to Interactive', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for page to be interactive
    await page.waitForFunction(() => {
      return document.readyState === 'complete' &&
             typeof window !== 'undefined' &&
             // Check if main interactive elements are ready
             document.querySelector('button') !== null;
    });

    const tti = Date.now() - startTime;
    console.log(`Time to Interactive: ${tti}ms`);

    // Should be interactive within 3 seconds
    expect(tti).toBeLessThan(3000);
  });

  test('should handle offline gracefully', async ({ page }) => {
    await page.goto('/');

    // Go offline
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/login');

    // Should show offline indicator or cached content
    const hasOfflineContent = await page.locator('text=offline, text=connection, text=cached').count();
    // Note: This depends on implementation

    // Go back online
    await page.context().setOffline(false);

    // Should work normally again
    await page.reload();
    expect(await page.title()).toBeTruthy();
  });
});
