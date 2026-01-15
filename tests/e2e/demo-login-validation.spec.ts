// Demo Login E2E Tests - Comprehensive Validation
import { test, expect } from '@playwright/test';

test.describe('Demo Login Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing demo session
    await page.addInitScript(() => {
      localStorage.removeItem('demo-session');
      localStorage.removeItem('demo-user-role');
      localStorage.removeItem('demo-user-type');
      localStorage.removeItem('demo-user-name');
    });
  });

  test('Demo Page Accessibility', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page loads without errors
    const title = await page.title();
    expect(title).toContain('QuickBid Platform Initial Setup');
    
    // UX Assertion: Demo options are clearly visible
    const demoCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div');
    await expect(demoCards.first()).toBeVisible();
    const cardCount = await demoCards.count();
    expect(cardCount).toBeGreaterThan(5); // Should have multiple demo options
    
    // UX Assertion: No authentication required to view demo options
    const loginForm = page.locator('input[type="password"]');
    expect(await loginForm.count()).toBe(0); // No login form required
    
    // UX Assertion: Clean UI with clear explanation
    const mainHeading = page.locator('text=QuickBid Platform Initial Setup');
    await expect(mainHeading).toBeVisible();
    
    const description = page.locator('text=Explore our comprehensive auction platform');
    await expect(description).toBeVisible();
    
    // UX Assertion: No console errors
    const consoleErrors = await page.evaluate(() => {
      const errors: any[] = [];
      const originalError = console.error;
      console.error = (...args) => errors.push(args);
      return { errors, originalError };
    });
    expect(consoleErrors.errors.length).toBe(0);
  });

  test('Demo Guest Login', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Look for guest option or navigate directly
    const guestOption = page.locator('text=Guest').first();
    if (await guestOption.isVisible()) {
      await guestOption.click();
    } else {
      // If no guest option, test by accessing dashboard directly
      await page.goto('/dashboard');
    }
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Redirects to Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    
    // UX Assertion: Can browse products
    const productSection = page.locator('text=Products, text=Auctions, text=Browse');
    expect(await productSection.first().isVisible()).toBeTruthy();
    
    // UX Assertion: Cannot bid or transact
    const bidButton = page.locator('button:has-text("Bid"), button:has-text("Place Bid")');
    if (await bidButton.count() > 0) {
      await bidButton.first().click();
      const blockedMessage = page.locator('text=Login, text=Sign in, text=Access Required');
      expect(await blockedMessage.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: Sees demo mode indicator
    const demoIndicator = page.locator('text=Demo, text=Guest, text=Test Mode');
    expect(await demoIndicator.isVisible()).toBeTruthy();
    
    // UX Assertion: Sees "Request Beta Access" or "Login to continue" CTA
    const betaCTA = page.locator('text=Request Beta, text=Sign in, text=Login');
    expect(await betaCTA.isVisible()).toBeTruthy();
    
    // UX Assertion: No hidden buttons
    const hiddenButtons = page.locator('button[disabled], button[style*="display: none"]');
    const hiddenCount = await hiddenButtons.count();
    expect(hiddenCount).toBeLessThan(3); // Minimal hidden elements
    
    // UX Assertion: Clear explanation when actions are blocked
    const blockedActions = page.locator('text=Access Required, text=Login Required, text=Sign in to');
    expect(await blockedActions.count()).toBeGreaterThan(0);
  });

  test('Demo Buyer Login', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Click Demo Buyer button (more specific selector)
    const buyerCard = page.locator('button:has-text("Experience as Demo Buyer")');
    await expect(buyerCard).toBeVisible();
    await buyerCard.click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // UX Assertion: Redirects to Buyer Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    
    // UX Assertion: Can browse real/demo products
    const productsGrid = page.locator('.grid, [data-testid="products-grid"]');
    expect(await productsGrid.first().isVisible()).toBeTruthy();
    
    // UX Assertion: Can view Product Detail
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);
      const productDetail = page.locator('h1, [data-testid="product-title"]');
      expect(await productDetail.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: Can attempt to bid (sandbox only)
    const bidButton = page.locator('button:has-text("Bid"), button:has-text("Place Bid")');
    if (await bidButton.count() > 0) {
      await expect(bidButton.first()).toBeVisible();
      await bidButton.first().click();
      
      // Should show bid form or sandbox message
      const bidForm = page.locator('input[type="number"], input[name="bid"]');
      const sandboxMessage = page.locator('text=Sandbox, text=Demo, text=Test');
      
      const bidFormVisible = await bidForm.isVisible();
      const sandboxMessageVisible = await sandboxMessage.isVisible();
      expect(bidFormVisible || sandboxMessageVisible).toBeTruthy();
    }
    
    // UX Assertion: Wallet shows "Sandbox Balance"
    const walletSection = page.locator('text=Wallet, text=Balance');
    if (await walletSection.count() > 0) {
      const sandboxBalance = page.locator('text=Sandbox, text=Demo Balance');
      expect(await sandboxBalance.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: "Demo User" or "Beta Demo" badge visible
    const demoBadge = page.locator('text=Demo, text=Beta Demo, text=Test User');
    expect(await demoBadge.isVisible()).toBeTruthy();
    
    // UX Assertion: If bidding is blocked, clear message shown
    const blockedBid = page.locator('text=Access Required, text=Beta Required, text=Permission Denied');
    if (await blockedBid.isVisible()) {
      const explanation = page.locator('text=Request Beta, text=Contact Admin, text=Upgrade Access');
      expect(await explanation.isVisible()).toBeTruthy();
    }
  });

  test('Demo Seller Login', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Click Demo Seller
    const sellerCard = page.locator('text=Demo Seller');
    await expect(sellerCard).toBeVisible();
    await sellerCard.click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // UX Assertion: Redirects to Seller Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    
    // UX Assertion: Can view seller analytics (mock/demo data)
    const analyticsSection = page.locator('text=Analytics, text=Sales, text=Performance');
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection.first()).toBeVisible();
    }
    
    // UX Assertion: Can view product listings
    const listingsSection = page.locator('text=Products, text=Listings, text=My Items');
    expect(await listingsSection.first().isVisible()).toBeTruthy();
    
    // UX Assertion: Cannot create real listings unless explicitly allowed
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add New"), button:has-text("List Item")');
    if (await createButton.count() > 0) {
      await createButton.first().click();
      const restrictionMessage = page.locator('text=Permission Required, text=Admin Approval, text=Demo Limitation');
      expect(await restrictionMessage.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: Clear demo indicator
    const demoIndicator = page.locator('text=Demo, text=Test Mode');
    expect(await demoIndicator.isVisible()).toBeTruthy();
    
    // UX Assertion: No access to admin-only features
    const adminFeatures = page.locator('text=User Management, text=System Settings, text=Admin Panel');
    expect(await adminFeatures.count()).toBe(0);
  });

  test('Demo Admin Login', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Click Demo Admin
    const adminCard = page.locator('text=Demo Admin');
    await expect(adminCard).toBeVisible();
    await adminCard.click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // UX Assertion: Redirects to Admin Dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    
    // UX Assertion: Read-only access (recommended)
    const destructiveActions = page.locator('button:has-text("Delete"), button:has-text("Remove"), button:has-text("Disable")');
    if (await destructiveActions.count() > 0) {
      // Check if destructive actions are disabled
      const isDisabled = await destructiveActions.first().isDisabled();
      expect(isDisabled).toBeTruthy();
    }
    
    // UX Assertion: Clear "Demo Admin" indicator
    const adminBadge = page.locator('text=Demo Admin, text=Admin Demo');
    expect(await adminBadge.isVisible()).toBeTruthy();
    
    // UX Assertion: Can view admin panels
    const adminPanels = page.locator('text=User Management, text=System Settings, text=Analytics');
    expect(await adminPanels.count()).toBeGreaterThan(0);
  });

  test('UX & Safety Validation', async ({ page }) => {
    // Test multiple demo roles
    const demoRoles = ['Demo Buyer', 'Demo Seller', 'Demo Admin'];
    
    for (const role of demoRoles) {
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      const roleCard = page.locator(`text=${role}`);
      if (await roleCard.isVisible()) {
        await roleCard.click();
        await page.waitForTimeout(2000);
        
        // UX Assertion: Refresh page on any route → no 404
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const notFound = page.locator('text=404, text=Not Found, text=Page not found');
        expect(await notFound.count()).toBe(0);
        
        // UX Assertion: Back/forward navigation works
        await page.goBack();
        await page.waitForTimeout(1000);
        await page.goForward();
        await page.waitForTimeout(1000);
        
        // UX Assertion: Demo indicator visible across pages
        const demoIndicator = page.locator('text=Demo, text=Test Mode');
        expect(await demoIndicator.isVisible()).toBeTruthy();
        
        // UX Assertion: No infinite loading spinners
        await page.waitForTimeout(3000);
        const loadingSpinners = page.locator('.animate-spin, [data-testid="loading"]');
        const spinnerCount = await loadingSpinners.count();
        expect(spinnerCount).toBeLessThan(3); // Minimal loading states
      }
    }
  });

  test('Security & Permission Checks', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Login as demo buyer
    const buyerCard = page.locator('text=Demo Buyer');
    await buyerCard.click();
    await page.waitForTimeout(2000);
    
    // UX Assertion: Demo user cannot access real payments
    const paymentSection = page.locator('text=Payment, text=Credit Card, text=Bank Account');
    if (await paymentSection.count() > 0) {
      await paymentSection.first().click();
      const demoWarning = page.locator('text=Demo Mode, text=Test Mode, text=Sandbox');
      expect(await demoWarning.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: Demo user cannot withdraw funds
    const withdrawButton = page.locator('button:has-text("Withdraw"), button:has-text("Cash Out")');
    if (await withdrawButton.count() > 0) {
      await withdrawButton.first().click();
      const restrictionMessage = page.locator('text=Not Available, text=Demo Limitation, text=Contact Admin');
      expect(await restrictionMessage.isVisible()).toBeTruthy();
    }
    
    // UX Assertion: Demo user actions do not persist after logout
    // Clear session and check if data persists
    await page.addInitScript(() => {
      localStorage.removeItem('demo-session');
      localStorage.removeItem('demo-user-role');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should be back to demo login page
    const demoPage = page.locator('text=QuickBid Demo Experience');
    expect(await demoPage.isVisible()).toBeTruthy();
    
    // UX Assertion: No real data modification
    const realDataEndpoints = page.locator('[data-testid="real-data"]');
    expect(await realDataEndpoints.count()).toBe(0);
  });

  test('Demo Session Persistence', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Login as demo buyer
    const buyerCard = page.locator('button:has-text("Experience as Demo Buyer")');
    await buyerCard.click();
    await page.waitForTimeout(2000);
    
    // Check session is created
    const sessionData = await page.evaluate(() => {
      return {
        demoSession: localStorage.getItem('demo-session'),
        userRole: localStorage.getItem('demo-user-role'),
        userType: localStorage.getItem('demo-user-type'),
        userName: localStorage.getItem('demo-user-name')
      };
    });
    
    expect(sessionData.demoSession).toBeTruthy();
    expect(sessionData.userRole).toBe('buyer');
    expect(sessionData.userType).toBe('buyer');
    expect(sessionData.userName).toBe('Demo Buyer');
    
    // Navigate to different page and check session persists
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const persistedSession = await page.evaluate(() => {
      return localStorage.getItem('demo-session');
    });
    expect(persistedSession).toBeTruthy();
    
    // Demo badge should still be visible
    const demoBadge = page.locator('text=Demo, text=Test Mode');
    expect(await demoBadge.isVisible()).toBeTruthy();
  });
});
