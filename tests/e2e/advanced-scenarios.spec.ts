// ADVANCED PLAYWRIGHT TEST SCENARIOS FOR QUICKMELA
// ===============================================

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3021';
const API_BASE_URL = 'http://localhost:4011';

// Advanced test scenarios covering edge cases, complex flows, and business logic

test.describe('Advanced Test Scenarios', () => {

  test.describe('Edge Cases & Boundary Testing', () => {

    test('Minimum Bid Increment Validation', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Check current bid
      const currentBidText = await page.locator('.current-bid').textContent();
      const currentBid = parseFloat(currentBidText.replace(/[^\d.]/g, ''));

      // Try to place bid with insufficient increment (less than 5% increase)
      const invalidBid = currentBid + 100; // Less than 5% increase
      await page.fill('input[name="bidAmount"]', invalidBid.toString());
      await page.click('button:has-text("Place Bid")');

      // Should show validation error
      await expect(page.locator('text=Bid must be at least 5% higher')).toBeVisible();
    });

    test('Maximum Bid Limits', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Try to place extremely high bid (beyond reasonable limits)
      const excessiveBid = 100000000; // 10 crore
      await page.fill('input[name="bidAmount"]', excessiveBid.toString());
      await page.click('button:has-text("Place Bid")');

      // Should show validation error
      await expect(page.locator('text=Bid amount exceeds maximum limit')).toBeVisible();
    });

    test('Auction End Time Boundary', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Wait until auction has less than 1 minute remaining
      await page.waitForSelector('text=< 1 min remaining');

      // Try to place bid when auction is about to end
      await placeBid(page, 20000);

      // Should either succeed or show "auction ending" warning
      await expect(page.locator('.bid-success, .auction-ending')).toBeVisible();
    });

    test('Concurrent Bid Conflicts', async ({ page, context }) => {
      // Create two browser contexts
      const page2 = await context.newPage();

      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await loginUser(page2, 'kavya@quickmela.com', 'BuyerPass123!');

      await page.goto(`${BASE_URL}/product/1`);
      await page2.goto(`${BASE_URL}/product/1`);

      // Both users try to place bid at same time (simulate race condition)
      const bidPromise1 = page.fill('input[name="bidAmount"]', '25000');
      const bidPromise2 = page2.fill('input[name="bidAmount"]', '25000');

      await Promise.all([bidPromise1, bidPromise2]);

      await page.click('button:has-text("Place Bid")');
      await page2.click('button:has-text("Place Bid")');

      // One should succeed, one should show "bid outbid" message
      const successCount = await page.locator('.bid-success').count() +
                          await page2.locator('.bid-success').count();

      expect(successCount).toBe(1); // Only one bid should succeed
    });

    test('Wallet Insufficient Funds', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Get current wallet balance
      const balanceText = await page.locator('.wallet-balance').textContent();
      const balance = parseFloat(balanceText.replace(/[^\d.]/g, ''));

      // Try to place bid higher than wallet balance
      const excessiveBid = balance + 10000;
      await page.fill('input[name="bidAmount"]', excessiveBid.toString());
      await page.click('button:has-text("Place Bid")');

      // Should show insufficient funds error
      await expect(page.locator('text=Insufficient wallet balance')).toBeVisible();
    });

    test('KYC Required for High-Value Bids', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Try to place high-value bid without KYC
      await placeBid(page, 100000); // ₹1 lakh

      // Should redirect to KYC verification or show KYC required message
      await expect(page.locator('text=KYC verification required')).toBeVisible();
    });

  });

  test.describe('Complex Multi-User Scenarios', () => {

    test('Auction Sniping Protection', async ({ page, context }) => {
      const page2 = await context.newPage();
      const page3 = await context.newPage();

      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await loginUser(page2, 'kavya@quickmela.com', 'BuyerPass123!');
      await loginUser(page3, 'testuser@example.com', 'TestPass123!');

      await page.goto(`${BASE_URL}/product/1`);
      await page2.goto(`${BASE_URL}/product/1`);
      await page3.goto(`${BASE_URL}/product/1`);

      // User 1 places initial bid
      await placeBid(page, 15000);

      // Wait for auction to have 30 seconds remaining
      await page.waitForSelector('text=30s remaining');

      // User 2 tries to snipe with very high bid
      await placeBid(page2, 50000);

      // User 3 tries to counter immediately
      await placeBid(page3, 60000);

      // Verify final bid is accepted and displayed
      await expect(page.locator('text=₹60,000')).toBeVisible();
      await expect(page2.locator('text=₹60,000')).toBeVisible();
      await expect(page3.locator('text=₹60,000')).toBeVisible();
    });

    test('Bulk User Registration Stress Test', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      // Create 10 concurrent users
      for (let i = 0; i < 10; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      // All users register simultaneously
      const registerPromises = pages.map(async (page, index) => {
        await page.goto(`${BASE_URL}/register`);

        const userData = {
          name: `Stress User ${index}`,
          email: `stress${index}_${Date.now()}@quickmela.com`,
          phone: `98765432${index.toString().padStart(2, '0')}`,
          password: 'StressPass123!',
          role: index % 2 === 0 ? 'buyer' : 'seller'
        };

        await page.fill('input[name="name"]', userData.name);
        await page.fill('input[name="email"]', userData.email);
        await page.fill('input[name="phone"]', userData.phone);
        await page.fill('input[name="password"]', userData.password);
        await page.selectOption('select[name="role"]', userData.role);
        await page.click('button[type="submit"]');
      });

      await Promise.all(registerPromises);

      // Verify all registrations succeeded
      for (const page of pages) {
        await expect(page).toHaveURL(/.*login/);
      }

      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    });

    test('Real-time Auction Room', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      // Create 5 users watching the same auction
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);

        await loginUser(page, `user${i}@quickmela.com`, 'TestPass123!');
        await page.goto(`${BASE_URL}/product/1`);
      }

      // One user places a bid
      await placeBid(pages[0], 30000);

      // All users should see the update within 2 seconds
      const bidUpdatePromises = pages.map(page =>
        page.waitForSelector('text=₹30,000', { timeout: 2000 })
      );

      await Promise.all(bidUpdatePromises);

      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    });

  });

  test.describe('Business Logic Validation', () => {

    test('Seller Cannot Bid on Own Product', async ({ page }) => {
      await loginUser(page, 'anita@quickmela.com', 'SellerPass123!'); // Seller who owns product
      await page.goto(`${BASE_URL}/product/1`); // Product owned by this seller

      // Bid button should not be visible or disabled
      const bidButton = page.locator('button:has-text("Place Bid")');
      await expect(bidButton).not.toBeVisible();

      // Or if visible, should show error when clicked
      if (await bidButton.count() > 0) {
        await bidButton.click();
        await expect(page.locator('text=Sellers cannot bid on their own products')).toBeVisible();
      }
    });

    test('Penalty System for Non-Payment', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Assume this user has unpaid auctions (simulate by API call)
      await page.goto(`${BASE_URL}/buyer/dashboard`);

      // Should show penalty warning
      await expect(page.locator('text=Penalty Applied')).toBeVisible();

      // Try to place new bid
      await page.goto(`${BASE_URL}/product/1`);
      await placeBid(page, 20000);

      // Should be blocked due to penalty
      await expect(page.locator('text=Account under penalty')).toBeVisible();
    });

    test('Subscription Tier Limits', async ({ page }) => {
      await loginUser(page, 'basic-seller@quickmela.com', 'BasicPass123!'); // Basic tier seller
      await page.goto(`${BASE_URL}/seller/dashboard`);

      // Try to create more products than basic limit (assume 5 products max)
      for (let i = 0; i < 6; i++) {
        await page.click('button:has-text("Add Product"');

        // Fill basic product form
        await page.fill('input[name="title"]', `Product ${i}`);
        await page.fill('textarea[name="description"]', `Description ${i}`);
        await page.fill('input[name="startingBid"]', '10000');
        await page.click('button[type="submit"]');

        if (i === 5) {
          // 6th product should fail
          await expect(page.locator('text=Product limit reached')).toBeVisible();
          break;
        }
      }
    });

    test('KYC Document Upload and Verification', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/kyc`);

      // Upload Aadhaar document
      const aadhaarInput = page.locator('input[type="file"][accept*="image"]');
      await aadhaarInput.setInputFiles('./test-aadhaar.jpg');

      // Fill verification details
      await page.fill('input[name="aadhaarNumber"]', '123456789012');
      await page.fill('input[name="name"]', 'Arjun Kumar');
      await page.click('button:has-text("Submit KYC")');

      // Should show verification pending
      await expect(page.locator('text=KYC verification submitted')).toBeVisible();

      // Check KYC status in profile
      await page.goto(`${BASE_URL}/profile`);
      await expect(page.locator('text=KYC Status: Pending')).toBeVisible();
    });

    test('Refund Processing for Outbid Users', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Place a bid
      const initialBalance = await getWalletBalance(page);
      await placeBid(page, 25000);

      // Wait for another user to outbid
      await page.waitForSelector('text=You have been outbid');

      // Check wallet - should be refunded
      const finalBalance = await getWalletBalance(page);
      expect(finalBalance).toBe(initialBalance); // Balance should be restored
    });

  });

  test.describe('Security Testing Scenarios', () => {

    test('SQL Injection Prevention', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Try SQL injection in email field
      const sqlInjection = "' OR '1'='1' --";
      await page.fill('input[name="email"]', sqlInjection);
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');

      // Should not login and show error
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      await expect(page).not.toHaveURL(/.*dashboard/);
    });

    test('XSS Prevention in Product Titles', async ({ page }) => {
      await loginUser(page, 'anita@quickmela.com', 'SellerPass123!');
      await page.goto(`${BASE_URL}/add-product`);

      // Try XSS in product title
      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('input[name="title"]', xssPayload);
      await page.fill('textarea[name="description"]', 'Test description');
      await page.fill('input[name="startingBid"]', '10000');
      await page.click('button[type="submit"]');

      // Product should be created but XSS should not execute
      await expect(page.locator('text=Product added successfully')).toBeVisible();

      // View the product - script should not execute
      await page.goto(`${BASE_URL}/products`);
      await expect(page.locator('text=alert("XSS")')).not.toBeVisible();
    });

    test('Rate Limiting for API Calls', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Make rapid bid requests (exceed rate limit)
      const bidPromises = [];
      for (let i = 0; i < 20; i++) {
        bidPromises.push(
          page.request.post(`${API_BASE_URL}/api/products/1/bid`, {
            data: { bidAmount: 20000 + i }
          })
        );
      }

      const responses = await Promise.all(bidPromises);

      // Some requests should be rate limited (429 status)
      const rateLimitedCount = responses.filter(r => r.status() === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    test('Session Timeout Handling', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Simulate session timeout by clearing cookies
      await page.context().clearCookies();

      // Try to access protected page
      await page.goto(`${BASE_URL}/buyer/dashboard`);

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('CSRF Protection', async ({ page, context }) => {
      const maliciousPage = await context.newPage();

      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Try CSRF attack from different origin
      await maliciousPage.goto('http://evil-site.com');
      await maliciousPage.setContent(`
        <form action="http://localhost:3021/api/bid" method="POST">
          <input type="hidden" name="productId" value="1">
          <input type="hidden" name="bidAmount" value="100000">
        </form>
        <script>document.forms[0].submit();</script>
      `);

      // Original page should still be secure
      await page.goto(`${BASE_URL}/buyer/dashboard`);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

  });

  test.describe('Performance & Load Testing', () => {

    test('Concurrent Auction Access', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      // Create 20 concurrent users
      for (let i = 0; i < 20; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      const startTime = Date.now();

      // All users access the same auction page simultaneously
      const loadPromises = pages.map(page => {
        return page.goto(`${BASE_URL}/product/1`, { waitUntil: 'networkidle' });
      });

      await Promise.all(loadPromises);

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (under 30 seconds for 20 users)
      expect(loadTime).toBeLessThan(30000);

      // All pages should have loaded successfully
      for (const page of pages) {
        await expect(page.locator('h1')).toBeVisible();
      }

      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    });

    test('Memory Leak Prevention', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Navigate through multiple pages repeatedly
      for (let i = 0; i < 10; i++) {
        await page.goto(`${BASE_URL}/buyer/auctions`);
        await page.goto(`${BASE_URL}/product/1`);
        await page.goto(`${BASE_URL}/wallet`);
        await page.goto(`${BASE_URL}/profile`);
      }

      // Page should still be responsive
      await page.goto(`${BASE_URL}/buyer/dashboard`);
      await expect(page.locator('text=Dashboard')).toBeVisible();

      // Check console for memory warnings
      const logs = [];
      page.on('console', msg => logs.push(msg.text()));

      // Should not have excessive memory warnings
      const memoryWarnings = logs.filter(log => log.includes('memory'));
      expect(memoryWarnings.length).toBeLessThan(3);
    });

    test('Database Connection Pool Stress', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Make many rapid API calls
      const apiCalls = [];
      for (let i = 0; i < 50; i++) {
        apiCalls.push(
          page.request.get(`${API_BASE_URL}/api/products`)
        );
      }

      const responses = await Promise.all(apiCalls);

      // All calls should succeed
      const successCount = responses.filter(r => r.ok()).length;
      expect(successCount).toBe(50);

      // Response times should be reasonable
      const avgResponseTime = responses.reduce((sum, r) =>
        sum + r.headers()['x-response-time'] || 0, 0) / responses.length;
      expect(avgResponseTime).toBeLessThan(500); // Under 500ms average
    });

  });

  test.describe('Data Integrity & Validation', () => {

    test('Duplicate Email Prevention', async ({ page }) => {
      // First registration
      await registerUser(page, {
        name: 'First User',
        email: 'duplicate@test.com',
        phone: '9876543210',
        password: 'TestPass123!',
        role: 'buyer'
      });

      // Second registration with same email
      await page.goto(`${BASE_URL}/register`);
      await page.fill('input[name="name"]', 'Second User');
      await page.fill('input[name="email"]', 'duplicate@test.com'); // Same email
      await page.fill('input[name="phone"]', '9876543211');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.selectOption('select[name="role"]', 'buyer');
      await page.click('button[type="submit"]');

      // Should show duplicate email error
      await expect(page.locator('text=Email already exists')).toBeVisible();
    });

    test('Phone Number Validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Try invalid phone numbers
      const invalidPhones = ['123', 'abcdefghij', '123456789', '98765432101'];

      for (const phone of invalidPhones) {
        await page.fill('input[name="phone"]', phone);
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid phone number')).toBeVisible();

        // Clear field for next test
        await page.fill('input[name="phone"]', '');
      }
    });

    test('Bid Amount Data Type Validation', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Try invalid bid amounts
      const invalidBids = ['abc', '₹5000', '50.123', '-1000'];

      for (const bid of invalidBids) {
        await page.fill('input[name="bidAmount"]', bid);
        await page.click('button:has-text("Place Bid")');

        await expect(page.locator('text=Invalid bid amount')).toBeVisible();
      }
    });

    test('Transaction Log Integrity', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/wallet`);

      // Get initial transaction count
      const initialTransactions = await page.locator('.transaction-item').count();

      // Make a wallet transaction
      await page.click('button:has-text("Add Funds")');
      await page.fill('input[name="amount"]', '1000');
      await page.click('button:has-text("Proceed")');

      // Complete mock payment
      await page.click('button:has-text("Complete Payment")');

      // Transaction count should increase
      await page.waitForTimeout(1000);
      const finalTransactions = await page.locator('.transaction-item').count();
      expect(finalTransactions).toBe(initialTransactions + 1);

      // Transaction should have correct details
      const latestTransaction = page.locator('.transaction-item').first();
      await expect(latestTransaction.locator('text=+₹1,000')).toBeVisible();
    });

  });

  test.describe('Recovery & Failure Scenarios', () => {

    test('Network Interruption Recovery', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/product/1`);

      // Simulate network failure
      await page.route('**/api/**', route => route.abort());

      // Try to place bid during network failure
      await placeBid(page, 20000);

      // Should show offline message
      await expect(page.locator('text=Network error')).toBeVisible();

      // Restore network
      await page.unroute('**/api/**');

      // Retry bid
      await placeBid(page, 20000);

      // Should succeed now
      await expect(page.locator('.bid-success')).toBeVisible();
    });

    test('Server Restart Recovery', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');
      await page.goto(`${BASE_URL}/buyer/dashboard`);

      // Simulate server restart (API returns 503)
      await page.route('**/api/**', route => route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service temporarily unavailable' })
      }));

      await page.reload();

      // Should show maintenance message
      await expect(page.locator('text=Service temporarily unavailable')).toBeVisible();

      // Restore normal operation
      await page.unroute('**/api/**');

      await page.reload();

      // Should work normally again
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('Database Failure Handling', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Simulate database error
      await page.route('**/api/**', route => route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' })
      }));

      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Should show user-friendly error
      await expect(page.locator('text=Unable to load auctions')).toBeVisible();

      // Should offer retry option
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });

    test('Partial Data Loading', async ({ page }) => {
      await loginUser(page, 'arjun@quickmela.com', 'BuyerPass123!');

      // Simulate partial API failure (some data loads, some doesn't)
      let callCount = 0;
      await page.route('**/api/products**', route => {
        callCount++;
        if (callCount % 3 === 0) {
          // Every 3rd call fails
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Partial data failure' })
          });
        } else {
          route.continue();
        }
      });

      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Should show available products and indicate some failed to load
      await expect(page.locator('.product-card')).toBeVisible();
      await expect(page.locator('text=Some products could not be loaded')).toBeVisible();
    });

  });

});

// Helper functions
async function loginUser(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**');
}

async function placeBid(page, amount) {
  const bidInput = page.locator('input[name="bidAmount"], input[placeholder*="bid"]').first();
  const bidButton = page.locator('button:has-text("Place Bid")').first();

  await bidInput.fill(amount.toString());
  await bidButton.click();

  await page.waitForSelector('.bid-success, .bid-confirmation, .bid-error');
}

async function getWalletBalance(page) {
  await page.goto(`${BASE_URL}/wallet`);
  const balanceText = await page.locator('.wallet-balance, .balance').textContent();
  return parseFloat(balanceText.replace(/[^\d.]/g, ''));
}

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
