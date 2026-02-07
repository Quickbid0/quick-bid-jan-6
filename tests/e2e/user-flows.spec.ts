import { test, expect } from '@playwright/test';

// Test data
const testUsers = {
  buyer: {
    email: 'buyer@test.com',
    password: 'Test123!',
    name: 'Test Buyer',
  },
  seller: {
    email: 'seller@test.com',
    password: 'Test123!',
    name: 'Test Seller',
  },
  admin: {
    email: 'admin@test.com',
    password: 'Test123!',
    name: 'Test Admin',
  },
};

const testProduct = {
  title: 'Test Auction Item',
  description: 'This is a test item for auction',
  category: 'electronics',
  startingPrice: 100,
  auctionDuration: 7, // days
};

test.describe('QuickBid User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test (with error handling)
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      });
    } catch (error) {
      // Ignore localStorage access errors (CORS/domain restrictions)
      console.log('localStorage access blocked, continuing...');
    }
  });

  test.describe('Buyer Flow', () => {
    test('buyer registration and login flow', async ({ page }) => {
      // Navigate to registration page
      await page.goto('/register');
      
      // Fill registration form
      await page.fill('[data-testid="name-input"]', testUsers.buyer.name);
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.fill('[data-testid="confirm-password-input"]', testUsers.buyer.password);
      
      // Select role
      await page.selectOption('[data-testid="role-select"]', 'buyer');
      
      // Submit registration
      await page.click('[data-testid="register-button"]');
      
      // Should redirect to email verification or login
      await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
      
      // Navigate to login page
      await page.goto('/login');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      
      // Submit login
      await page.click('[data-testid="login-button"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/buyer/dashboard');
      await expect(page.locator('text=Welcome, Test Buyer')).toBeVisible();
    });

    test('browse products and place bid', async ({ page }) => {
      // Login as buyer
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to products
      await page.click('[data-testid="auctions-link"]');
      await expect(page).toHaveURL('/buyer/auctions');
      
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Click on first product
      await page.click('[data-testid="product-card"]:first-child');
      
      // Should be on product detail page
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-bid"]')).toBeVisible();
      
      // Place a bid
      await page.click('[data-testid="place-bid-button"]');
      await page.fill('[data-testid="bid-amount-input"]', '150');
      await page.click('[data-testid="confirm-bid-button"]');
      
      // Should show success message
      await expect(page.locator('text=Bid placed successfully')).toBeVisible();
      
      // Check bid history
      await page.click('[data-testid="bids-tab"]');
      await expect(page.locator('[data-testid="bid-history"]')).toContainText('₹150');
    });

    test('win auction and make payment', async ({ page }) => {
      // Login as buyer
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to won auctions
      await page.click('[data-testid="wins-link"]');
      await expect(page).toHaveURL('/buyer/wins');
      
      // Click on won auction
      await page.click('[data-testid="won-auction"]:first-child');
      
      // Should show payment options
      await expect(page.locator('[data-testid="payment-section"]')).toBeVisible();
      
      // Initiate payment
      await page.click('[data-testid="pay-now-button"]');
      
      // Should redirect to payment gateway
      await expect(page).toHaveURL(/razorpay/);
      
      // Mock successful payment (in real test, this would interact with Razorpay)
      await page.evaluate(() => {
        window.postMessage({ 
          event: 'payment.success', 
          data: { payment_id: 'test_payment_id' } 
        }, '*');
      });
      
      // Should redirect to order confirmation
      await expect(page).toHaveURL(/order-confirmation/);
      await expect(page.locator('text=Payment successful')).toBeVisible();
    });

    test('profile management', async ({ page }) => {
      // Login as buyer
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to profile
      await page.click('[data-testid="profile-link"]');
      await expect(page).toHaveURL('/profile');
      
      // Update profile
      await page.fill('[data-testid="name-input"]', 'Updated Buyer Name');
      await page.fill('[data-testid="phone-input"]', '+1234567890');
      await page.click('[data-testid="save-profile-button"]');
      
      // Should show success message
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
      
      // Logout
      await page.click('[data-testid="logout-button"]');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Seller Flow', () => {
    test('seller registration and product creation', async ({ page }) => {
      // Register as seller
      await page.goto('/register');
      await page.fill('[data-testid="name-input"]', testUsers.seller.name);
      await page.fill('[data-testid="email-input"]', testUsers.seller.email);
      await page.fill('[data-testid="password-input"]', testUsers.seller.password);
      await page.fill('[data-testid="confirm-password-input"]', testUsers.seller.password);
      await page.selectOption('[data-testid="role-select"]', 'seller');
      await page.click('[data-testid="register-button"]');
      
      // Login as seller
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.seller.email);
      await page.fill('[data-testid="password-input"]', testUsers.seller.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to seller dashboard
      await expect(page).toHaveURL('/seller/dashboard');
      
      // Create new product
      await page.click('[data-testid="add-product-button"]');
      await expect(page).toHaveURL('/add-product');
      
      // Fill product form
      await page.fill('[data-testid="product-title"]', testProduct.title);
      await page.fill('[data-testid="product-description"]', testProduct.description);
      await page.selectOption('[data-testid="product-category"]', testProduct.category);
      await page.fill('[data-testid="starting-price"]', testProduct.startingPrice.toString());
      await page.fill('[data-testid="auction-duration"]', testProduct.auctionDuration.toString());
      
      // Upload images (mock)
      await page.setInputFiles('[data-testid="product-images"]', ['test-image.jpg']);
      
      // Submit product
      await page.click('[data-testid="create-product-button"]');
      
      // Should show success message
      await expect(page.locator('text=Product created successfully')).toBeVisible();
      
      // Navigate to my products
      await page.click('[data-testid="my-products-link"]');
      await expect(page.locator('text=' + testProduct.title)).toBeVisible();
    });

    test('manage products and view bids', async ({ page }) => {
      // Login as seller
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.seller.email);
      await page.fill('[data-testid="password-input"]', testUsers.seller.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to my products
      await page.click('[data-testid="my-products-link"]');
      
      // Click on first product
      await page.click('[data-testid="product-card"]:first-child');
      
      // Should show product details and bids
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="bids-section"]')).toBeVisible();
      
      // View bid details
      await page.click('[data-testid="view-bids-button"]');
      await expect(page.locator('[data-testid="bid-list"]')).toBeVisible();
      
      // Edit product
      await page.click('[data-testid="edit-product-button"]');
      await page.fill('[data-testid="product-title"]', 'Updated Product Title');
      await page.click('[data-testid="save-changes-button"]');
      
      // Should show success message
      await expect(page.locator('text=Product updated successfully')).toBeVisible();
    });

    test('view earnings and payouts', async ({ page }) => {
      // Login as seller
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.seller.email);
      await page.fill('[data-testid="password-input"]', testUsers.seller.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to earnings
      await page.click('[data-testid="earnings-link"]');
      await expect(page).toHaveURL('/seller/earnings');
      
      // Should show earnings summary
      await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-payouts"]')).toBeVisible();
      await expect(page.locator('[data-testid="transaction-history"]')).toBeVisible();
      
      // Request payout
      await page.click('[data-testid="request-payout-button"]');
      await page.fill('[data-testid="payout-amount"]', '1000');
      await page.click('[data-testid="confirm-payout-button"]');
      
      // Should show success message
      await expect(page.locator('text=Payout request submitted')).toBeVisible();
    });
  });

  test.describe('Admin Flow', () => {
    test('admin login and dashboard access', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill('[data-testid="password-input"]', testUsers.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL('/admin/dashboard');
      await expect(page.locator('[data-testid="admin-welcome"]')).toBeVisible();
      
      // Check dashboard widgets
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-auctions"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-verifications"]')).toBeVisible();
    });

    test('user management', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill('[data-testid="password-input"]', testUsers.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to user management
      await page.click('[data-testid="users-link"]');
      await expect(page).toHaveURL('/admin/users');
      
      // Search for user
      await page.fill('[data-testid="user-search"]', testUsers.buyer.email);
      await page.click('[data-testid="search-button"]');
      
      // Should show user in results
      await expect(page.locator('text=' + testUsers.buyer.email)).toBeVisible();
      
      // Suspend user
      await page.click('[data-testid="suspend-user-button"]');
      await page.click('[data-testid="confirm-suspend-button"]');
      
      // Should show success message
      await expect(page.locator('text=User suspended successfully')).toBeVisible();
      
      // Verify user status
      await expect(page.locator('[data-testid="user-status"]')).toContainText('suspended');
    });

    test('product moderation', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill('[data-testid="password-input"]', testUsers.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to product moderation
      await page.click('[data-testid="products-link"]');
      await expect(page).toHaveURL('/admin/products');
      
      // Filter pending products
      await page.selectOption('[data-testid="status-filter"]', 'pending');
      
      // Should show pending products
      await expect(page.locator('[data-testid="pending-product"]')).toBeVisible();
      
      // Approve product
      await page.click('[data-testid="approve-product-button"]');
      await page.click('[data-testid="confirm-approve-button"]');
      
      // Should show success message
      await expect(page.locator('text=Product approved successfully')).toBeVisible();
      
      // Verify product status
      await expect(page.locator('[data-testid="product-status"]')).toContainText('approved');
    });

    test('payment settlement', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill('[data-testid="password-input"]', testUsers.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to payment settlement
      await page.click('[data-testid="payments-link"]');
      await expect(page).toHaveURL('/admin/payments');
      
      // Should show pending payouts
      await expect(page.locator('[data-testid="pending-payouts"]')).toBeVisible();
      
      // Process payout
      await page.click('[data-testid="process-payout-button"]');
      await page.click('[data-testid="confirm-process-button"]');
      
      // Should show success message
      await expect(page.locator('text=Payout processed successfully')).toBeVisible();
      
      // Verify payout status
      await expect(page.locator('[data-testid="payout-status"]')).toContainText('completed');
    });

    test('reports and analytics', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.admin.email);
      await page.fill('[data-testid="password-input"]', testUsers.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigate to reports
      await page.click('[data-testid="reports-link"]');
      await expect(page).toHaveURL('/admin/reports');
      
      // Generate report
      await page.selectOption('[data-testid="report-type"]', 'user-activity');
      await page.fill('[data-testid="start-date"]', '2024-01-01');
      await page.fill('[data-testid="end-date"]', '2024-12-31');
      await page.click('[data-testid="generate-report-button"]');
      
      // Should show report results
      await expect(page.locator('[data-testid="report-results"]')).toBeVisible();
      
      // Export report
      await page.click('[data-testid="export-report-button"]');
      
      // Should download file (mock verification)
      const download = await page.waitForEvent('download');
      expect(download.suggestedFilename()).toMatch(/user-activity-report/);
    });
  });

  test.describe('Cross-functional Tests', () => {
    test('responsive design on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login as buyer
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Should show mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Navigate to products
      await page.click('[data-testid="mobile-menu-button"]');
      await page.click('[data-testid="auctions-link"]');
      
      // Should work on mobile
      await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
    });

    test('error handling and recovery', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('/non-existent-page');
      
      // Should show 404 page
      await expect(page.locator('text=Page not found')).toBeVisible();
      
      // Should have navigation to home
      await expect(page.locator('[data-testid="home-link"]')).toBeVisible();
      
      // Navigate home
      await page.click('[data-testid="home-link"]');
      await expect(page).toHaveURL('/');
    });

    test('session timeout and re-authentication', async ({ page }) => {
      // Login as buyer
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Simulate session timeout
      await page.evaluate(() => {
        localStorage.removeItem('auth-user');
      });
      
      // Try to access protected route
      await page.goto('/buyer/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.locator('text=Session expired')).toBeVisible();
      
      // Should be able to login again
      await page.fill('[data-testid="email-input"]', testUsers.buyer.email);
      await page.fill('[data-testid="password-input"]', testUsers.buyer.password);
      await page.click('[data-testid="login-button"]');
      
      // Should redirect to intended page
      await expect(page).toHaveURL('/buyer/dashboard');
    });
  });
});
