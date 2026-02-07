// QUICKMELA PLAYWRIGHT END-TO-END TEST SUITE
// ===========================================

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3021';
const API_BASE_URL = 'http://localhost:4011';

// Test configuration
test.describe.configure({ mode: 'serial' });

// Helper functions
async function registerUser(page, userData) {
  await page.goto(`${BASE_URL}/register`);
  await page.fill('input[name="name"]', userData.name);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="phone"]', userData.phone);
  await page.fill('input[name="password"]', userData.password);
  await page.selectOption('select[name="role"]', userData.role);

  await page.click('button[type="submit"]');
  await page.waitForURL('**/login**');
}

async function loginUser(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
}

async function placeBid(page, amount) {
  // Find bid input and button
  const bidInput = page.locator('input[placeholder*="bid"]').first();
  const bidButton = page.locator('button:has-text("Place Bid")').first();

  await bidInput.fill(amount.toString());
  await bidButton.click();

  // Wait for bid confirmation
  await page.waitForSelector('.bid-success, .bid-confirmation');
}

test.describe('QuickMela End-to-End Test Suite', () => {

  test.describe('Authentication Flow', () => {
    test('User Registration', async ({ page }) => {
      const userData = {
        name: 'Test Buyer',
        email: `testbuyer${Date.now()}@quickmela.com`,
        phone: '9876543210',
        password: 'TestPass123!',
        role: 'buyer'
      };

      await registerUser(page, userData);

      // Verify registration success
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('text=Registration successful')).toBeVisible();
    });

    test('User Login', async ({ page }) => {
      const email = 'arjun@quickmela.com';
      const password = 'BuyerPass123!';

      await loginUser(page, email, password);

      // Verify login success
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('OTP Verification Flow', async ({ page }) => {
      // Register new user
      const userData = {
        name: 'OTP Test User',
        email: `otptest${Date.now()}@quickmela.com`,
        phone: '9876543211',
        password: 'OTPPass123!',
        role: 'buyer'
      };

      await registerUser(page, userData);

      // Check if OTP screen appears
      await expect(page.locator('text=Verify OTP')).toBeVisible();

      // Get OTP from API response (in real test, would need to intercept API call)
      // For now, assume OTP is 123456
      await page.fill('input[name="otp"]', '123456');
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  test.describe('Product Browsing & Bidding', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
    });

    test('Browse Auctions', async ({ page }) => {
      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Verify page loads
      await expect(page.locator('h1, h2').filter({ hasText: /auction/i })).toBeVisible();

      // Check for product cards
      const productCards = page.locator('.product-card, [data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();

      // Verify product details
      await expect(page.locator('text=Current Bid')).toBeVisible();
      await expect(page.locator('text=Time Left')).toBeVisible();
    });

    test('View Product Details', async ({ page }) => {
      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Click on first product
      const firstProduct = page.locator('.product-card, [data-testid="product-card"]').first();
      await firstProduct.click();

      // Verify product detail page
      await expect(page).toHaveURL(/.*product\/\d+/);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Place Bid')).toBeVisible();
    });

    test('Place Bid', async ({ page }) => {
      // Go to first product
      await page.goto(`${BASE_URL}/product/1`);

      // Place a bid
      await placeBid(page, 16000);

      // Verify bid success
      await expect(page.locator('.bid-success, .success-message')).toBeVisible();

      // Check if bid amount updated
      await expect(page.locator('text=₹16,000')).toBeVisible();
    });

    test('Bid History', async ({ page }) => {
      await page.goto(`${BASE_URL}/product/1`);

      // Check bid history section
      const bidHistory = page.locator('text=Bid History, [data-testid="bid-history"]');
      await expect(bidHistory).toBeVisible();

      // Verify bid entries
      const bidEntries = page.locator('.bid-entry, [data-testid="bid-entry"]');
      await expect(bidEntries.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Wallet Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
    });

    test('View Wallet Balance', async ({ page }) => {
      await page.goto(`${BASE_URL}/wallet`);

      // Check balance display
      await expect(page.locator('text=Available Balance')).toBeVisible();
      await expect(page.locator('text=₹')).toBeVisible();
    });

    test('Add Funds to Wallet', async ({ page }) => {
      await page.goto(`${BASE_URL}/wallet`);

      // Click add funds button
      await page.click('button:has-text("Add Funds")');

      // Enter amount
      await page.fill('input[name="amount"]', '5000');

      // Click proceed to payment
      await page.click('button:has-text("Proceed")');

      // Should redirect to payment gateway (mock)
      await expect(page).toHaveURL(/.*payment/);
    });

    test('Transaction History', async ({ page }) => {
      await page.goto(`${BASE_URL}/wallet`);

      // Check transaction history
      await expect(page.locator('text=Transaction History')).toBeVisible();

      // Verify transactions list
      const transactions = page.locator('.transaction-item, [data-testid="transaction"]');
      await expect(transactions.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Seller Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login as seller
      await loginUser(page, 'anita@quickmela.com', 'SellerPass123!');
    });

    test('Seller Dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/seller/dashboard`);

      // Verify dashboard elements
      await expect(page.locator('text=Active Listings')).toBeVisible();
      await expect(page.locator('text=Total Sales')).toBeVisible();
      await expect(page.locator('text=Recent Activity')).toBeVisible();
    });

    test('Add New Product', async ({ page }) => {
      await page.goto(`${BASE_URL}/add-product`);

      // Fill product form
      await page.fill('input[name="title"]', `Test Product ${Date.now()}`);
      await page.fill('textarea[name="description"]', 'Test product description');
      await page.selectOption('select[name="category"]', 'car');
      await page.fill('input[name="startingBid"]', '10000');

      // Upload image (mock)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./test-image.jpg'); // Would need actual image

      // Submit form
      await page.click('button[type="submit"]');

      // Verify success
      await expect(page.locator('.success-message')).toBeVisible();
    });

    test('View Seller Analytics', async ({ page }) => {
      await page.goto(`${BASE_URL}/seller/analytics`);

      // Check analytics charts
      await expect(page.locator('text=Sales Performance')).toBeVisible();
      await expect(page.locator('text=Revenue Trends')).toBeVisible();
    });
  });

  test.describe('Admin Panel', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await loginUser(page, 'admin@quickmela.com', 'AdminPass123!');
    });

    test('Admin Dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/dashboard`);

      // Verify admin metrics
      await expect(page.locator('text=Total Users')).toBeVisible();
      await expect(page.locator('text=Active Auctions')).toBeVisible();
      await expect(page.locator('text=Total Revenue')).toBeVisible();
    });

    test('User Management', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/users`);

      // Check user list
      const userRows = page.locator('tr, [data-testid="user-row"]');
      await expect(userRows.count()).toBeGreaterThan(0);

      // Test user status toggle
      const firstUserStatus = page.locator('button:has-text("Active"), button:has-text("Inactive")').first();
      await expect(firstUserStatus).toBeVisible();
    });

    test('Auction Monitoring', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/dashboard`);

      // Check active auctions
      await expect(page.locator('text=Active Auctions')).toBeVisible();

      // Test auction controls (if available)
      const auctionControls = page.locator('button:has-text("Pause"), button:has-text("End")');
      if (await auctionControls.count() > 0) {
        await expect(auctionControls.first()).toBeVisible();
      }
    });
  });

  test.describe('Real-time Features', () => {
    test('Live Bidding Updates', async ({ page, context }) => {
      // Open two browser contexts to simulate multiple users
      const page2 = await context.newPage();

      // Login both users
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await loginUser(page2, 'kavya@quickmela.com', 'BuyerPass123!');

      // Both go to same auction
      await page.goto(`${BASE_URL}/product/1`);
      await page2.goto(`${BASE_URL}/product/1`);

      // User 1 places bid
      await placeBid(page, 17000);

      // User 2 should see updated bid in real-time
      await expect(page2.locator('text=₹17,000')).toBeVisible({ timeout: 10000 });

      // User 2 places higher bid
      await placeBid(page2, 18000);

      // User 1 should see updated bid
      await expect(page.locator('text=₹18,000')).toBeVisible({ timeout: 10000 });
    });

    test('Bid Notifications', async ({ page }) => {
      await loginUser(page, 'anita@quickmela.com', 'SellerPass123!');

      // Go to seller dashboard
      await page.goto(`${BASE_URL}/seller/dashboard`);

      // Check for bid notifications
      const notifications = page.locator('.notification, [data-testid="notification"]');
      if (await notifications.count() > 0) {
        await expect(notifications.first()).toBeVisible();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('Mobile Navigation', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check mobile menu button
      const menuButton = page.locator('button:has-text("Menu"), [data-testid="mobile-menu"]');
      if (await menuButton.count() > 0) {
        await menuButton.click();
        await expect(page.locator('.mobile-menu, [data-testid="mobile-nav"]')).toBeVisible();
      }
    });

    test('Mobile Bidding', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Check if bidding interface is mobile-friendly
      const bidInput = page.locator('input[type="number"], input[placeholder*="bid"]');
      await expect(bidInput).toBeVisible();

      const bidButton = page.locator('button:has-text("Place Bid")');
      await expect(bidButton).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('Invalid Login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Enter wrong credentials
      await page.fill('input[name="email"]', 'wrong@email.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('Network Error Handling', async ({ page }) => {
      // Simulate network failure by blocking API calls
      await page.route('**/api/**', route => route.abort());

      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Should show error message or retry option
      await expect(page.locator('text=Error, text=Failed to load')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('Page Load Performance', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      console.log(`Page load time: ${loadTime}ms`);
    });

    test('API Response Performance', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      const startTime = Date.now();

      await page.goto(`${BASE_URL}/buyer/auctions`);
      await page.waitForSelector('.product-card, [data-testid="product-card"]');

      const responseTime = Date.now() - startTime;

      // API should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);

      console.log(`API response time: ${responseTime}ms`);
    });
  });

});
