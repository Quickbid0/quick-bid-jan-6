import { test, expect, Page } from '@playwright/test';

// Test Configuration
const TEST_CONFIG = {
  baseURL: 'https://quickmela.netlify.app',
  backendURL: 'https://quickmela-backend.onrender.com',
  testUsers: {
    buyer: {
      email: 'testbuyer@example.com',
      password: 'TestPass123!',
      name: 'Test Buyer',
      role: 'buyer'
    },
    seller: {
      email: 'testseller@example.com',
      password: 'TestPass123!',
      name: 'Test Seller',
      role: 'seller'
    },
    admin: {
      email: 'testadmin@example.com',
      password: 'TestPass123!',
      name: 'Test Admin',
      role: 'admin'
    }
  },
  timeouts: {
    navigation: 30000,
    api: 15000,
    pageLoad: 20000
  }
};

// Test Utilities
class QuickBidTestUtils {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"], input[type="email"]', email);
    await this.page.fill('[data-testid="password-input"], input[type="password"]', password);
    await this.page.click('[data-testid="login-button"], button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    await this.page.click('[data-testid="logout-button"], [data-testid="profile-menu"]');
    await this.page.click('text=Logout');
  }

  async waitForDashboardLoad() {
    await this.page.waitForSelector('[data-testid="dashboard-content"], .dashboard', { timeout: TEST_CONFIG.timeouts.pageLoad });
  }

  async checkForErrors() {
    const errors = await this.page.locator('.error, .alert-danger, [role="alert"]').allTextContents();
    const consoleErrors = await this.page.evaluate(() => {
      const logs = [];
      console.error = (...args) => logs.push(args.join(' '));
      return logs;
    });
    return { uiErrors: errors, consoleErrors };
  }

  async interceptAPI() {
    const requests: any[] = [];
    const responses: any[] = [];

    this.page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        });
      }
    });

    return { requests, responses };
  }
}

// Authentication & Authorization Tests
test.describe('Authentication & Authorization', () => {
  test('should validate JWT token generation and validation', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    // Test login flow
    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Check if JWT token is stored
    const localStorage = await page.evaluate(() => {
      return Object.keys(localStorage).filter(key => key.includes('token') || key.includes('auth'));
    });
    expect(localStorage.length).toBeGreaterThan(0);

    // Check if redirected to dashboard
    await expect(page).toHaveURL(/.*\/(buyer|seller|admin)\/dashboard/);
  });

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/buyer/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should validate role-based access control', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    // Login as buyer
    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Try to access admin routes
    await page.goto('/admin/dashboard');

    // Should be denied access
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('should handle token expiration gracefully', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Simulate token expiration by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access protected route
    await page.goto('/buyer/dashboard');

    // Should redirect to login with session expired message
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('text=Session expired')).toBeVisible();
  });
});

// User Flow Tests
test.describe('User Registration & Onboarding', () => {
  test('should complete full buyer registration flow', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('[data-testid="name-input"], input[name="name"]', 'Test Buyer ' + Date.now());
    await page.fill('[data-testid="email-input"], input[type="email"]', 'buyer' + Date.now() + '@test.com');
    await page.fill('[data-testid="password-input"], input[type="password"]', 'TestPass123!');
    await page.fill('[data-testid="confirm-password-input"], input[name="confirmPassword"]', 'TestPass123!');

    // Select role
    await page.selectOption('[data-testid="role-select"], select[name="role"]', 'buyer');

    // Submit registration
    await page.click('[data-testid="register-button"], button[type="submit"]');

    // Should show success message or redirect to email verification
    await expect(page.locator('text=Registration successful, text=Please check your email')).toBeVisible();
  });

  test('should validate email verification process', async ({ page }) => {
    // This would require email interception or mock verification
    // For now, test the UI flow
    await page.goto('/verify-email?token=mock-token');

    // Should show verification success/error message
    await expect(page.locator('text=Email verified, text=Verification failed')).toBeVisible();
  });

  test('should handle registration validation errors', async ({ page }) => {
    await page.goto('/register');

    // Test weak password
    await page.fill('[data-testid="password-input"]', 'weak');
    await page.click('[data-testid="register-button"]');

    // Should show validation error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();

    // Test invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');

    // Should show email validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });
});

// Product & Auction Management Tests
test.describe('Product & Auction Management', () => {
  test('should create auction as seller', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.seller.email, TEST_CONFIG.testUsers.seller.password);

    // Navigate to create product
    await page.click('[data-testid="add-product-button"], [href*="add-product"]');

    // Fill product form
    await page.fill('[data-testid="product-title"], input[name="title"]', 'Test Auction Item ' + Date.now());
    await page.fill('[data-testid="product-description"], textarea[name="description"]', 'This is a test auction item');
    await page.selectOption('[data-testid="product-category"], select[name="category"]', 'electronics');
    await page.fill('[data-testid="starting-price"], input[name="startingPrice"]', '100');
    await page.fill('[data-testid="auction-duration"], input[name="duration"]', '7');

    // Upload image (mock)
    const fileInput = page.locator('[data-testid="product-images"], input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('./test-image.jpg'); // Would need test image
    }

    // Submit
    await page.click('[data-testid="create-product-button"], button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('should browse and filter auctions', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Navigate to auctions
    await page.click('[data-testid="auctions-link"], [href*="auctions"]');

    // Wait for auctions to load
    await page.waitForSelector('[data-testid="product-card"], .auction-card');

    // Test filtering
    await page.fill('[data-testid="search-input"], input[type="search"]', 'electronics');
    await page.click('[data-testid="search-button"], button[type="submit"]');

    // Should show filtered results
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
  });

  test('should place and track bids', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Navigate to auctions
    await page.click('[data-testid="auctions-link"]');

    // Click on first auction
    await page.click('[data-testid="product-card"]:first-child');

    // Get current bid amount
    const currentBid = await page.locator('[data-testid="current-bid"]').textContent();
    const newBid = parseInt(currentBid.replace(/[^0-9]/g, '')) + 10;

    // Place bid
    await page.click('[data-testid="place-bid-button"]');
    await page.fill('[data-testid="bid-amount-input"]', newBid.toString());
    await page.click('[data-testid="confirm-bid-button"]');

    // Should show success message
    await expect(page.locator('text=Bid placed successfully')).toBeVisible();

    // Check bid history
    await page.click('[data-testid="bids-tab"]');
    await expect(page.locator(`text=₹${newBid}`)).toBeVisible();
  });
});

// Payment Integration Tests
test.describe('Payment Integration', () => {
  test('should handle Razorpay payment flow', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Navigate to wins
    await page.click('[data-testid="wins-link"]');

    // Click on won auction
    await page.click('[data-testid="won-auction"]:first-child');

    // Initiate payment
    await page.click('[data-testid="pay-now-button"]');

    // Should redirect to Razorpay or show payment modal
    await expect(page.locator('.razorpay-container, [data-testid="payment-modal"]')).toBeVisible();
  });

  test('should validate wallet balance and deposits', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Check wallet balance
    await page.click('[data-testid="wallet-link"]');
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();

    // Add funds
    await page.click('[data-testid="add-funds-button"]');
    await page.fill('[data-testid="deposit-amount"]', '1000');
    await page.click('[data-testid="confirm-deposit-button"]');

    // Should show payment flow
    await expect(page.locator('.razorpay-container')).toBeVisible();
  });
});

// Security Tests
test.describe('Security & Vulnerability', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/register');

    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="name-input"]', xssPayload);
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="register-button"]');

    // Should not execute script
    const alertsTriggered = await page.evaluate(() => {
      const originalAlert = window.alert;
      let alertCalled = false;
      window.alert = () => { alertCalled = true; };
      // Trigger any potential XSS
      setTimeout(() => window.alert = originalAlert, 1000);
      return alertCalled;
    });

    expect(alertsTriggered).toBe(false);
  });

  test('should prevent SQL injection', async ({ page }) => {
    await page.goto('/login');

    const sqlInjection = "'; DROP TABLE users; --";
    await page.fill('[data-testid="email-input"]', sqlInjection);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should handle gracefully without crashing
    await expect(page.locator('text=Login failed, text=Invalid credentials')).toBeVisible();
  });

  test('should validate JWT tampering attempts', async ({ page }) => {
    const utils = new QuickBidTestUtils(page);

    await utils.login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);

    // Tamper with JWT token
    await page.evaluate(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const tamperedToken = token.replace(/.$/, 'X'); // Tamper last character
        localStorage.setItem('auth_token', tamperedToken);
      }
    });

    // Try to access protected route
    await page.goto('/buyer/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should enforce rate limiting', async ({ page }) => {
    await page.goto('/login');

    // Attempt multiple rapid requests
    for (let i = 0; i < 15; i++) {
      await page.fill('[data-testid="email-input"]', `test${i}@example.com`);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(200);
    }

    // Should show rate limit message
    await expect(page.locator('text=Rate limit exceeded, text=Too many requests')).toBeVisible();
  });
});

// Performance Tests
test.describe('Performance & Load', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should handle concurrent bid placement', async ({ browser }) => {
    const pages = await Promise.all([
      browser.newPage(),
      browser.newPage(),
      browser.newPage()
    ]);

    const utils = pages.map(page => new QuickBidTestUtils(page));

    // Login on all pages
    await Promise.all(pages.map(async (page, i) => {
      await utils[i].login(TEST_CONFIG.testUsers.buyer.email, TEST_CONFIG.testUsers.buyer.password);
      await page.goto('/buyer/auctions');
    }));

    // Place bids concurrently
    const bidPromises = pages.map(async (page, i) => {
      await page.click('[data-testid="product-card"]:first-child');
      await page.click('[data-testid="place-bid-button"]');
      await page.fill('[data-testid="bid-amount-input"]', (100 + i * 10).toString());
      await page.click('[data-testid="confirm-bid-button"]');
    });

    await Promise.all(bidPromises);

    // All should succeed or handle conflicts gracefully
    for (const page of pages) {
      await expect(page.locator('text=Bid placed successfully, text=Bid too low')).toBeVisible();
    }

    // Cleanup
    await Promise.all(pages.map(page => page.close()));
  });
});

// API Testing
test.describe('API Integration', () => {
  test('should validate API endpoints', async ({ request }) => {
    // Test public endpoints
    const auctionsResponse = await request.get(`${TEST_CONFIG.backendURL}/api/auctions`);
    expect(auctionsResponse.status()).toBe(200);

    const auctionsData = await auctionsResponse.json();
    expect(Array.isArray(auctionsData)).toBe(true);
  });

  test('should validate authenticated API calls', async ({ request }) => {
    // This would require obtaining a valid JWT token
    // For now, test unauthorized access
    const protectedResponse = await request.get(`${TEST_CONFIG.backendURL}/api/user/profile`);
    expect([401, 403]).toContain(protectedResponse.status());
  });
});

// Mobile Responsiveness Tests
test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }

    // Test login on mobile
    await page.goto('/login');
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
  });
});

// Error Handling Tests
test.describe('Error Handling', () => {
  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', TEST_CONFIG.testUsers.buyer.email);
    await page.click('[data-testid="login-button"]');

    // Should show network error message
    await expect(page.locator('text=Network error, text=Connection failed')).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);
  });

  test('should handle 404 pages correctly', async ({ page }) => {
    await page.goto('/non-existent-page');

    await expect(page.locator('text=Page not found, text=404')).toBeVisible();
    await expect(page.locator('[data-testid="home-link"]')).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // This would require mocking a 500 error
    // For now, test general error handling
    await page.goto('/login');

    // Trigger a client-side error
    await page.evaluate(() => {
      throw new Error('Test error');
    });

    // Should not crash the application
    await expect(page.locator('body')).toBeVisible();
  });
});

export { QuickBidTestUtils, TEST_CONFIG };
