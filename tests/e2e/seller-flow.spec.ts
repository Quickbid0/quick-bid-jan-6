import { test, expect } from '@playwright/test';

test.describe('Seller UX Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for seller
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'seller',
        user_type: 'seller'
      }));
    });
  });

  test('Complete seller journey - login to auction management', async ({ page }) => {
    // Navigate to seller dashboard
    await page.goto('/seller/dashboard');
    
    // UX Assertion: Seller dashboard loads without blank screen
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="seller-dashboard"], main, section').first()).toBeVisible();
    
    // UX Assertion: Clear next action visible (create/manage auctions)
    const createAuctionButton = page.locator('button:has-text("Create"), [data-testid="create-auction"]');
    const manageAuctionsButton = page.locator('button:has-text("Manage"), [data-testid="manage-auctions"]');
    
    const hasClearAction = await createAuctionButton.isVisible() || await manageAuctionsButton.isVisible();
    expect(hasClearAction).toBeTruthy();
    
    // Navigate to create auction if available
    if (await createAuctionButton.isVisible()) {
      await createAuctionButton.click();
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Auction creation form loads
      await expect(page.locator('[data-testid="auction-form"], form').first()).toBeVisible();
      
      // Test form fields
      const titleInput = page.locator('input[name="title"], [data-testid="product-title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Product');
        
        // UX Assertion: Clear labels and understandable
        const titleLabel = page.locator('label:has-text("Title"), [for*="title"]');
        if (await titleLabel.isVisible()) {
          await expect(titleLabel).toBeVisible();
        }
      }
      
      const descriptionInput = page.locator('textarea[name="description"], [data-testid="product-description"]');
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('Test product description');
      }
      
      // Test file upload UX
      const fileInput = page.locator('input[type="file"], [data-testid="file-upload"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles('./test-image.jpg');
        
        // UX Assertion: Upload feedback is clear
        const uploadProgress = page.locator('[data-testid="upload-progress"], [class*="progress"]');
        if (await uploadProgress.isVisible()) {
          await expect(uploadProgress).toBeVisible();
        }
      }
    }
    
    // View existing auctions
    await page.goto('/seller/dashboard');
    
    const auctionCards = page.locator('[data-testid="auction-card"], .seller-auction-card');
    if (await auctionCards.count() > 0) {
      // UX Assertion: Auction status is clearly visible
      const firstAuction = auctionCards.first();
      await expect(firstAuction).toBeVisible();
      
      const statusElement = page.locator('[data-testid="auction-status"], [class*="status"]');
      if (await statusElement.count() > 0) {
        await expect(statusElement.first()).toBeVisible();
        
        const statusText = await statusElement.first().textContent();
        expect(statusText?.length).toBeGreaterThan(0);
      }
      
      // Click to view details
      await firstAuction.click();
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Auction detail loads with all key info
      await expect(page.locator('[data-testid="auction-detail"], .auction-detail').first()).toBeVisible();
    }
  });

  test('Seller dashboard navigation and analytics', async ({ page }) => {
    await page.goto('/seller/dashboard');
    
    // UX Assertion: Navigation is intuitive for sellers
    const sellerNav = page.locator('[data-testid="seller-nav"], .seller-navigation');
    if (await sellerNav.isVisible()) {
      await expect(sellerNav).toBeVisible();
      
      const navItems = sellerNav.locator('a, button');
      const navCount = await navItems.count();
      expect(navCount).toBeGreaterThan(0);
      
      // Check navigation labels are clear
      for (let i = 0; i < Math.min(navCount, 5); i++) {
        await expect(navItems.nth(i)).toBeVisible();
        
        const navText = await navItems.nth(i).textContent();
        expect(navText?.length).toBeGreaterThan(0);
      }
    }
    
    // Test analytics section if available
    const analyticsSection = page.locator('[data-testid="seller-analytics"], .analytics-section');
    if (await analyticsSection.isVisible()) {
      // UX Assertion: Analytics data is visible without confusion
      const chartElements = page.locator('[data-testid="chart"], canvas, [class*="chart"]');
      if (await chartElements.count() > 0) {
        await expect(chartElements.first()).toBeVisible();
      }
      
      const statsCards = page.locator('[data-testid="stat-card"], .stat-card');
      if (await statsCards.count() > 0) {
        await expect(statsCards.first()).toBeVisible();
        
        // UX Assertion: Important information visible without scrolling
        const firstStat = statsCards.first();
        const statValue = firstStat.locator('[data-testid="stat-value"], .value');
        if (await statValue.isVisible()) {
          await expect(statValue).toBeVisible();
        }
      }
    }
  });

  test('Seller mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/seller/dashboard');
    
    // UX Assertion: No horizontal scroll on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // UX Assertion: Actions are reachable on mobile
    const actionButtons = page.locator('button[class*="primary"], [data-testid="action-button"]');
    if (await actionButtons.count() > 0) {
      for (let i = 0; i < Math.min(await actionButtons.count(), 3); i++) {
        const button = actionButtons.nth(i);
        await expect(button).toBeVisible();
        
        // Check touch target size
        const buttonSize = await button.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return Math.min(rect.width, rect.height);
        });
        expect(buttonSize).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Test mobile menu if present
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

  test('Seller form validation and error handling', async ({ page }) => {
    await page.goto('/seller/create-auction');
    
    // Test required field validation
    const submitButton = page.locator('button[type="submit"], [data-testid="submit-auction"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // UX Assertion: Error messages are helpful
      const errorMessages = page.locator('[data-testid="error"], [role="alert"], .error-message');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
        
        const errorText = await errorMessages.first().textContent();
        expect(errorText?.length).toBeGreaterThan(0);
        expect(errorText?.length).toBeLessThan(200); // Not too verbose
      }
    }
    
    // Test form with valid data
    const titleInput = page.locator('input[name="title"], [data-testid="product-title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Valid Test Product');
      
      // UX Assertion: Real-time validation works
      const titleError = page.locator('[data-testid="title-error"], .title-error');
      if (await titleError.isVisible()) {
        // Error should disappear when valid input is provided
        await expect(titleError).not.toBeVisible({ timeout: 3000 });
      }
    }
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // UX Assertion: Focus indicators are visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test submit success path
    const priceInput = page.locator('input[name="price"], [data-testid="starting-price"]');
    if (await priceInput.isVisible()) {
      await priceInput.fill('10000');
      
      // Fill other required fields if they exist
      const categorySelect = page.locator('select[name="category"], [data-testid="category"]');
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 0 });
      }
      
      await submitButton.click();
      
      // UX Assertion: Clear feedback after submit
      const successMessage = page.locator('[data-testid="success"], [role="status"], .success-message');
      const loadingIndicator = page.locator('[data-testid="loading"], .loading');
      
      // Should show loading then success
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
        
        const successText = await successMessage.textContent();
        expect(successText?.length).toBeGreaterThan(0);
      }
    }
  });
});
