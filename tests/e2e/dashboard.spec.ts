import { test, expect } from '@playwright/test';

test.describe('Dashboard Critical Flow Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication to bypass login for testing
    await context.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Dashboard renders with visible hero and discovery sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load and verify it's not blank
    await page.waitForLoadState('networkidle');
    
    // DEBUG: Check current URL
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    // DEBUG: Check page content
    const pageContent = await page.content();
    console.log('Page content preview:', pageContent.substring(0, 500));
    
    // Wait for loading spinner to disappear
    const loadingSpinner = page.locator('[data-testid="dashboard-spinner"]');
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    
    // CRITICAL: Hero section must be visible
    const heroSection = page.locator('[data-testid="dashboard-logo"]');
    await heroSection.waitFor({ state: 'visible', timeout: 5000 });
    
    // CRITICAL: At least one discovery section must be visible
    const trendingSection = page.locator('[data-testid="trending-section"]');
    const endingSoonSection = page.locator('[data-testid="ending-soon-section"]');
    const newListingsSection = page.locator('[data-testid="new-listings-section"]');
    
    let visibleSections = 0;
    if (await trendingSection.isVisible()) visibleSections++;
    if (await endingSoonSection.isVisible()) visibleSections++;
    if (await newListingsSection.isVisible()) visibleSections++;
    
    expect(visibleSections).toBeGreaterThan(0);
    
    // CRITICAL: Page must have meaningful content height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(500);
    
    // Verify no blank screen issues
    const mainContent = page.locator('main#main');
    await expect(mainContent).toBeVisible();
  });

  test('Discovery sections render with mock data', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for mock data to load
    await page.waitForTimeout(1000);
    
    // Verify trending products section
    const trendingSection = page.locator('[data-testid="trending-section"]');
    await expect(trendingSection).toBeVisible();
    
    // Verify product cards are present
    const productCards = page.locator('[data-testid*="auction-card"], .bg-white.rounded-xl.shadow-lg');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Verify ending soon section
    const endingSoonSection = page.locator('[data-testid="ending-soon-section"]');
    await expect(endingSoonSection).toBeVisible();
    
    // Verify new listings section  
    const newListingsSection = page.locator('[data-testid="new-listings-section"]');
    await expect(newListingsSection).toBeVisible();
  });

  test('Dashboard handles empty data gracefully', async ({ page }) => {
    // Mock empty data scenario
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ trending: [], endingSoon: [], newListings: [] })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Even with empty data, page should not be blank
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should show empty states, not disappear
    const emptyStates = page.locator('text=/No products|No data|Empty/i');
    // Empty states should be visible OR discovery sections should exist
    const hasContent = await emptyStates.count() > 0 || 
                     await page.locator('section').count() > 0;
    expect(hasContent).toBeTruthy();
    
    // Page height should still be reasonable
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(200);
  });

  test('Dashboard never shows only loading spinner indefinitely', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Loading spinner should disappear within reasonable time
    const loadingSpinner = page.locator('[data-testid="dashboard-spinner"]');
    
    // Wait up to 10 seconds for loading to complete
    try {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    } catch (error) {
      // If still loading after 10 seconds, test should fail
      throw new Error('Dashboard stuck in loading state - this indicates a regression');
    }
    
    // Verify actual content appears
    const content = page.locator('h1, h2, section, main').first();
    await expect(content).toBeVisible();
  });

  test('Dashboard layout is not constrained by Shell wrapper', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify the dashboard content can use full width
    const mainContainer = page.locator('.min-h-screen').first();
    await expect(mainContainer).toBeVisible();
    
    // Check if content extends beyond constrained width
    const contentWidth = await mainContainer.evaluate(el => el.scrollWidth);
    expect(contentWidth).toBeGreaterThan(800); // Should be wider than constrained max-width
    
    // Verify hero section is visible and not clipped
    const heroContent = page.locator('h1:has-text("QuickMela")');
    await expect(heroContent).toBeVisible();
    
    // Verify discovery sections are not hidden by layout constraints
    const discoveryContent = page.locator('section:has(h2)').first();
    await expect(discoveryContent).toBeVisible();
  });

  test('Buyer is NOT redirected away from Dashboard', async ({ page }) => {
    // Mock buyer profile
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'buyer',
        user_type: 'buyer'
      }));
    });
    
    // Start navigation to dashboard
    const responsePromise = page.waitForResponse('**/dashboard');
    await page.goto('/dashboard');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Should stay on dashboard, not redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    expect(currentUrl).not.toContain('/buyer/dashboard');
    
    // Dashboard content should be visible
    const dashboardContent = page.locator('h1:has-text("QuickMela")');
    await expect(dashboardContent).toBeVisible();
  });

  test('Dashboard shows meaningful content, not blank screen', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Multiple content elements must be present
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(2);
    
    // Verify text content exists
    const textContent = page.locator('text=/QuickMela|Trending|Ending|New|Dashboard/i');
    const textCount = await textContent.count();
    expect(textCount).toBeGreaterThan(0);
    
    // Verify interactive elements
    const buttonsOrLinks = page.locator('button, a[href]');
    const buttonCount = await buttonsOrLinks.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Page should not be just a blank container
    const body = page.locator('body');
    const bodyText = await body.textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(50);
  });
});
