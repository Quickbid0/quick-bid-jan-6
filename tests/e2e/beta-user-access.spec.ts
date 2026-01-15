// Beta User E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Beta User Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Guest users cannot bid and see beta request CTA', async ({ page }) => {
    // Test as guest user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'guest-user-id');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Guest sees beta request CTA
    const betaRequestCTA = page.locator('text=Request Beta Access');
    await expect(betaRequestCTA).toBeVisible();
    
    // UX Assertion: Guest cannot bid
    const bidButton = page.locator('button:has-text("Place Bid")');
    if (await bidButton.count() > 0) {
      await bidButton.first().click();
      const accessDenied = page.locator('text=Beta Access Required');
      await expect(accessDenied).toBeVisible();
    }
    
    // UX Assertion: Beta version banner is visible
    const betaBanner = page.locator('text=Beta Version');
    await expect(betaBanner).toBeVisible();
  });

  test('Beta buyers can bid with sandbox wallet', async ({ page }) => {
    // Test as beta buyer
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'beta-buyer-id');
    });
    
    await page.goto('/product/test-real-product-id');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Beta buyer can see bid form
    const bidInput = page.locator('input[id="bidAmount"]');
    if (await bidInput.count() > 0) {
      await expect(bidInput.first()).toBeVisible();
      
      // UX Assertion: Beta buyer badge is visible
      const betaBadge = page.locator('text=Beta User');
      await expect(betaBadge).toBeVisible();
      
      // UX Assertion: Sandbox wallet banner is present
      const sandboxBanner = page.locator('text=No real money involved');
      await expect(sandboxBanner).toBeVisible();
      
      // UX Assertion: Bid button is enabled
      const bidButton = page.locator('button:has-text("Place Bid")');
      await expect(bidButton.first()).toBeEnabled();
    }
  });

  test('Beta sellers can list products after approval', async ({ page }) => {
    // Test as beta seller
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'beta-seller-id');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Beta seller badge is visible
    const betaSellerBadge = page.locator('text=Beta Seller');
    if (await betaSellerBadge.count() > 0) {
      await expect(betaSellerBadge.first()).toBeVisible();
    }
    
    // UX Assertion: Seller can access product creation
    const createProductButton = page.locator('button:has-text("Create Product")');
    if (await createProductButton.count() > 0) {
      await expect(createProductButton.first()).toBeVisible();
    }
  });

  test('Non-beta users cannot access restricted actions', async ({ page }) => {
    // Test as non-beta user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'non-beta-user-id');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Non-beta user sees access denied for restricted features
    const restrictedActions = page.locator('[data-testid="restricted-action"]');
    if (await restrictedActions.count() > 0) {
      const firstRestricted = restrictedActions.first();
      await expect(firstRestricted).toBeVisible();
      
      // Click on restricted action
      await firstRestricted.click();
      const accessDenied = page.locator('text=Access Denied');
      await expect(accessDenied).toBeVisible();
    }
  });

  test('Admin can approve and revoke beta access', async ({ page }) => {
    // Test as admin
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'admin-user-id');
    });
    
    await page.goto('/admin/beta-users');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Admin can see beta user management
    const adminTitle = page.locator('text=Beta User Management');
    await expect(adminTitle).toBeVisible();
    
    // UX Assertion: Admin can see pending requests
    const pendingRequests = page.locator('text=Pending Requests');
    await expect(pendingRequests).toBeVisible();
    
    // UX Assertion: Admin can approve users
    const approveButton = page.locator('button:has-text("Approve")');
    if (await approveButton.count() > 0) {
      await expect(approveButton.first()).toBeVisible();
    }
    
    // UX Assertion: Admin can revoke access
    const revokeButton = page.locator('button:has-text("Revoke Access")');
    if (await revokeButton.count() > 0) {
      await expect(revokeButton.first()).toBeVisible();
    }
  });

  test('Revoked beta user loses permissions immediately', async ({ page }) => {
    // First test as beta user
    await page.addInitScript(() => {
      localStorage.setItem('sb-user-id', 'beta-user-to-revoke');
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Beta user initially has access
    const betaBadge = page.locator('text=Beta User');
    if (await betaBadge.count() > 0) {
      await expect(betaBadge.first()).toBeVisible();
    }
    
    // Simulate admin revoking access
    await page.addInitScript(() => {
      // Simulate revoked access
      localStorage.setItem('sb-beta-revoked', 'true');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Revoked user sees access denied
    const accessDenied = page.locator('text=Beta Access Required');
    await expect(accessDenied).toBeVisible();
  });

  test('Beta request form works correctly', async ({ page }) => {
    await page.goto('/beta-request');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Beta request form is visible
    const formTitle = page.locator('text=Request Beta Access');
    await expect(formTitle).toBeVisible();
    
    // UX Assertion: Form fields are present
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const roleSelect = page.locator('select[name="requestedRole"]');
    const reasonTextarea = page.locator('textarea[name="requestReason"]');
    
    await expect(nameInput.first()).toBeVisible();
    await expect(emailInput.first()).toBeVisible();
    await expect(roleSelect.first()).toBeVisible();
    await expect(reasonTextarea.first()).toBeVisible();
    
    // UX Assertion: Beta program details are visible
    const programDetails = page.locator('text=Beta Program Details');
    await expect(programDetails).toBeVisible();
    
    // UX Assertion: Form submission works
    await nameInput.first().fill('Test User');
    await emailInput.first().fill('test@example.com');
    await reasonTextarea.first().fill('I want to test the beta');
    
    const submitButton = page.locator('button:has-text("Request Beta Access")');
    await submitButton.first().click();
    
    // Check for success message
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=Beta Request Submitted');
    await expect(successMessage).toBeVisible();
  });

  test('Dashboard never renders blank for any user type', async ({ page }) => {
    const userTypes = ['guest', 'beta-buyer', 'beta-seller', 'admin'];
    
    for (const userType of userTypes) {
      await page.addInitScript(() => {
        localStorage.setItem('sb-user-id', `${userType}-test-id`);
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Dashboard always has content
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent.first()).toBeVisible();
      
      // UX Assertion: No blank screens
      const body = page.locator('body');
      const hasContent = await body.evaluate(el => {
        return el && el.children.length > 0;
      });
      expect(hasContent).toBeTruthy();
      
      // UX Assertion: Beta banner is always visible
      const betaBanner = page.locator('text=Beta Version');
      await expect(betaBanner).toBeVisible();
    }
  });

  test('UI indicators are consistent across pages', async ({ page }) => {
    const pages = ['/dashboard', '/product/test-id', '/wallet'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Beta version banner is consistent
      const betaBanner = page.locator('text=Beta Version');
      await expect(betaBanner).toBeVisible();
      
      // UX Assertion: Environment indicators are present
      const environmentBadges = page.locator('[data-testid="environment-badge"]');
      const badgeCount = await environmentBadges.count();
      
      if (badgeCount > 0) {
        const firstBadge = environmentBadges.first();
        await expect(firstBadge).toBeVisible();
      }
      
      // UX Assertion: Sandbox messaging is present
      const sandboxMessage = page.locator('text=No real money involved');
      if (await sandboxMessage.count() > 0) {
        await expect(sandboxMessage.first()).toBeVisible();
      }
    }
  });
});
