// INTEGRATION TESTING SCENARIOS FOR QUICKMELA
// ==========================================

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://quickmela.netlify.app';
const API_BASE_URL = 'http://localhost:4011/api';

test.describe('Integration Testing Scenarios', () => {

  test.describe('Complete User Journey Integration', () => {

    test('End-to-End Buyer Journey', async ({ page }) => {
      // Step 1: User Registration
      const userEmail = `buyer${Date.now()}@quickmela.com`;
      await page.goto(`${BASE_URL}/register`);

      await page.fill('input[name="name"]', 'Integration Test Buyer');
      await page.fill('input[name="email"]', userEmail);
      await page.fill('input[name="phone"]', '9876543210');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.selectOption('select[name="role"]', 'buyer');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*login/);

      // Step 2: Login
      await page.fill('input[name="email"]', userEmail);
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*dashboard/);

      // Step 3: Add Funds to Wallet
      await page.goto(`${BASE_URL}/wallet`);
      await page.click('button:has-text("Add Funds")');

      await page.fill('input[name="amount"]', '10000');
      await page.click('button:has-text("Proceed")');

      // Mock payment completion
      await page.click('button:has-text("Complete Payment")');

      // Verify balance updated
      await expect(page.locator('text=₹10,000')).toBeVisible();

      // Step 4: Browse and Bid on Product
      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Click on first product
      await page.locator('.product-card').first().click();

      // Place bid
      await page.fill('input[name="bidAmount"]', '5000');
      await page.click('button:has-text("Place Bid")');

      await expect(page.locator('.bid-success')).toBeVisible();

      // Step 5: Verify Bid in History
      await page.locator('text=Bid History').click();
      await expect(page.locator('text=₹5,000')).toBeVisible();

      // Step 6: Logout
      await page.click('button:has-text("Logout")');
      await expect(page).toHaveURL(/.*login/);
    });

    test('End-to-End Seller Journey', async ({ page }) => {
      // Step 1: Seller Registration
      const sellerEmail = `seller${Date.now()}@quickmela.com`;
      await page.goto(`${BASE_URL}/register`);

      await page.fill('input[name="name"]', 'Integration Test Seller');
      await page.fill('input[name="email"]', sellerEmail);
      await page.fill('input[name="phone"]', '9876543211');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.selectOption('select[name="role"]', 'seller');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*login/);

      // Step 2: Login
      await page.fill('input[name="email"]', sellerEmail);
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*dashboard/);

      // Step 3: Add Product
      await page.goto(`${BASE_URL}/add-product`);

      await page.fill('input[name="title"]', 'Integration Test Car');
      await page.fill('textarea[name="description"]', 'Test car for integration testing');
      await page.selectOption('select[name="category"]', 'car');
      await page.fill('input[name="startingBid"]', '10000');

      // Upload image (mock)
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./test-car-image.jpg');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=Product added successfully')).toBeVisible();

      // Step 4: View Product in Seller Dashboard
      await page.goto(`${BASE_URL}/seller/dashboard`);
      await expect(page.locator('text=Integration Test Car')).toBeVisible();

      // Step 5: Monitor Bids (if any received)
      await page.locator('text=Recent Activity').click();
      // Should show product listing activity

      // Step 6: Logout
      await page.click('button:has-text("Logout")');
      await expect(page).toHaveURL(/.*login/);
    });

  });

  test.describe('Cross-System Integration', () => {

    test('Frontend-Backend Data Synchronization', async ({ page, request }) => {
      // Login via API
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Create product via API
      const productData = {
        title: 'Sync Test Product',
        description: 'Testing frontend-backend sync',
        startingBid: 8000,
        category: 'car',
        auctionEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const createResponse = await request.post(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: productData
      });

      const createdProduct = await createResponse.json();

      // Login via frontend
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      // Check if product appears in frontend
      await page.goto(`${BASE_URL}/buyer/auctions`);
      await expect(page.locator(`text=${productData.title}`)).toBeVisible();

      // Verify product details match
      await page.locator(`text=${productData.title}`).click();
      await expect(page.locator(`text=${productData.description}`)).toBeVisible();
      await expect(page.locator('text=₹8,000')).toBeVisible();
    });

    test('Real-time Bid Synchronization', async ({ page, context, request }) => {
      // Login two users
      const page2 = await context.newPage();

      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      await page2.goto(`${BASE_URL}/login`);
      await page2.fill('input[name="email"]', 'kavya@quickmela.com');
      await page2.fill('input[name="password"]', 'BuyerPass123!');
      await page2.click('button[type="submit"]');

      // Both go to same product
      await page.goto(`${BASE_URL}/product/1`);
      await page2.goto(`${BASE_URL}/product/1`);

      // User 1 places bid via UI
      await page.fill('input[name="bidAmount"]', '20000');
      await page.click('button:has-text("Place Bid")');

      // Verify bid appears for both users
      await expect(page.locator('text=₹20,000')).toBeVisible();
      await expect(page2.locator('text=₹20,000')).toBeVisible();

      // Verify via API that bid was recorded
      const bidsResponse = await request.get(`${API_BASE_URL}/products/1/bids`);
      const bids = await bidsResponse.json();

      const recentBid = bids.find(bid => bid.bidAmount === 20000);
      expect(recentBid).toBeTruthy();
    });

    test('Payment Gateway Integration', async ({ page, request }) => {
      // Login and add funds
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/wallet`);
      await page.click('button:has-text("Add Funds")');

      await page.fill('input[name="amount"]', '5000');
      await page.click('button:has-text("Proceed")');

      // Verify Razorpay order creation via API
      const orderResponse = await request.get(`${API_BASE_URL}/razorpay/orders/last`);
      expect(orderResponse.ok()).toBeTruthy();

      const order = await orderResponse.json();
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('amount', 500000); // Razorpay amount in paisa
    });

  });

  test.describe('Database Integration', () => {

    test('Data Persistence Across Sessions', async ({ page, context }) => {
      // Session 1: Create data
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/product/1`);
      await page.fill('input[name="bidAmount"]', '25000');
      await page.click('button:has-text("Place Bid")');

      await expect(page.locator('.bid-success')).toBeVisible();
      await page.close();

      // Session 2: Verify data persists
      const page2 = await context.newPage();
      await page2.goto(`${BASE_URL}/login`);
      await page2.fill('input[name="email"]', 'arjun@quickmela.com');
      await page2.fill('input[name="password"]', 'BuyerPass123!');
      await page2.click('button[type="submit"]');

      await page2.goto(`${BASE_URL}/product/1`);
      await expect(page2.locator('text=₹25,000')).toBeVisible();

      await page2.close();
    });

    test('Concurrent Database Access', async ({ browser }) => {
      const contexts = [];
      const pages = [];

      // Create 5 concurrent users
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      // All users perform database operations simultaneously
      const operations = pages.map(async (page, index) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', `user${index}@quickmela.com`);
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');

        await page.goto(`${BASE_URL}/product/1`);
        await page.fill('input[name="bidAmount"]', 30000 + index * 1000);
        await page.click('button:has-text("Place Bid")');

        return page.locator('.bid-success').isVisible();
      });

      const results = await Promise.all(operations);

      // At least some bids should succeed (database handles concurrency)
      const successCount = results.filter(result => result).length;
      expect(successCount).toBeGreaterThan(0);

      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    });

    test('Transaction Rollback on Failure', async ({ page, request }) => {
      // Login
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Get initial wallet balance
      const initialBalanceResponse = await request.get(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const initialBalance = (await initialBalanceResponse.json()).balance;

      // Attempt a transaction that should fail (bid higher than balance)
      const bidResponse = await request.post(`${API_BASE_URL}/products/1/bid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          bidAmount: initialBalance + 10000
        }
      });

      expect(bidResponse.status()).toBe(400);

      // Verify balance unchanged (transaction rolled back)
      const finalBalanceResponse = await request.get(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const finalBalance = (await finalBalanceResponse.json()).balance;
      expect(finalBalance).toBe(initialBalance);
    });

  });

  test.describe('External Service Integration', () => {

    test('Email Service Integration', async ({ page, request }) => {
      // Trigger email sending via registration
      const userEmail = `emailtest${Date.now()}@quickmela.com`;
      await page.goto(`${BASE_URL}/register`);

      await page.fill('input[name="name"]', 'Email Test User');
      await page.fill('input[name="email"]', userEmail);
      await page.fill('input[name="phone"]', '9876543212');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.selectOption('select[name="role"]', 'buyer');
      await page.click('button[type="submit"]');

      // Verify email service was called (check logs or mock)
      const emailLogResponse = await request.get(`${API_BASE_URL}/admin/email-logs`);
      if (emailLogResponse.ok()) {
        const emailLogs = await emailLogResponse.json();
        const verificationEmail = emailLogs.find(log =>
          log.to === userEmail && log.type === 'verification'
        );
        expect(verificationEmail).toBeTruthy();
      }
    });

    test('File Upload Integration', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'anita@quickmela.com');
      await page.fill('input[name="password"]', 'SellerPass123!');
      await page.click('button[type="submit"]');

      await page.goto(`${BASE_URL}/add-product`);

      // Upload multiple files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([
        './test-image1.jpg',
        './test-image2.jpg',
        './test-document.pdf'
      ]);

      // Verify files are accepted
      await expect(page.locator('.upload-success')).toBeVisible();

      // Submit product
      await page.fill('input[name="title"]', 'File Upload Test Product');
      await page.fill('textarea[name="description"]', 'Testing file upload integration');
      await page.fill('input[name="startingBid"]', '15000');
      await page.click('button[type="submit"]');

      // Verify product created with files
      await expect(page.locator('text=Product added successfully')).toBeVisible();
    });

    test('SMS/OTP Integration', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      // Navigate to profile and request OTP
      await page.goto(`${BASE_URL}/profile`);
      await page.click('button:has-text("Send OTP")');

      // Verify OTP input appears
      await expect(page.locator('input[name="otp"]')).toBeVisible();

      // Check if SMS service was called (mock verification)
      await expect(page.locator('text=OTP sent successfully')).toBeVisible();
    });

  });

  test.describe('Workflow Integration', () => {

    test('Auction Winner Notification Workflow', async ({ page, request }) => {
      // Create a test auction ending soon
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'anita@quickmela.com',
          password: 'SellerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Create auction ending in 1 minute
      const auctionData = {
        title: 'Quick End Auction',
        description: 'Testing auction end workflow',
        startingBid: 1000,
        auctionEndTime: new Date(Date.now() + 60 * 1000).toISOString()
      };

      await request.post(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: auctionData
      });

      // Buyer places winning bid
      const buyerLoginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const buyerToken = (await buyerLoginResponse.json()).accessToken;

      // Place winning bid (get product ID first)
      const productsResponse = await request.get(`${API_BASE_URL}/products`);
      const products = (await productsResponse.json()).products;
      const testProduct = products.find(p => p.title === 'Quick End Auction');

      if (testProduct) {
        await request.post(`${API_BASE_URL}/products/${testProduct.id}/bid`, {
          headers: {
            'Authorization': `Bearer ${buyerToken}`
          },
          data: { bidAmount: 2000 }
        });

        // Wait for auction to end (simulate)
        await page.waitForTimeout(65000);

        // Check if winner notification was sent
        const notificationsResponse = await request.get(`${API_BASE_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${buyerToken}`
          }
        });

        if (notificationsResponse.ok()) {
          const notifications = await notificationsResponse.json();
          const winnerNotification = notifications.find(n =>
            n.type === 'auction_won' && n.productId === testProduct.id
          );
          expect(winnerNotification).toBeTruthy();
        }
      }
    });

    test('KYC Approval Workflow', async ({ page, request }) => {
      // User submits KYC
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const token = (await loginResponse.json()).accessToken;

      const kycData = {
        documentType: 'aadhaar',
        documentNumber: '123456789012',
        name: 'Arjun Kumar',
        documents: ['aadhaar-front.jpg', 'aadhaar-back.jpg']
      };

      await request.post(`${API_BASE_URL}/kyc/submit`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: kycData
      });

      // Admin approves KYC (simulate admin action)
      const adminLoginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'admin@quickmela.com',
          password: 'AdminPass123!'
        }
      });

      const adminToken = (await adminLoginResponse.json()).accessToken;

      await request.post(`${API_BASE_URL}/admin/kyc/approve`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        data: { userId: 'arjun@quickmela.com' }
      });

      // Verify user gets notification
      const notificationsResponse = await request.get(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (notificationsResponse.ok()) {
        const notifications = await notificationsResponse.json();
        const kycNotification = notifications.find(n => n.type === 'kyc_approved');
        expect(kycNotification).toBeTruthy();
      }

      // Verify KYC status updated
      const kycStatusResponse = await request.get(`${API_BASE_URL}/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const kycStatus = await kycStatusResponse.json();
      expect(kycStatus.status).toBe('approved');
    });

  });

  test.describe('Error Recovery Integration', () => {

    test('Graceful Degradation on Service Failure', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      // Simulate backend failure
      await page.route('**/api/**', route => route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      }));

      await page.goto(`${BASE_URL}/buyer/auctions`);

      // Should show error message but not crash
      await expect(page.locator('text=Unable to load auctions')).toBeVisible();
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();

      // Restore service
      await page.unroute('**/api/**');

      // Retry should work
      await page.click('button:has-text("Retry")');
      await expect(page.locator('.product-card')).toBeVisible();
    });

    test('Offline Mode Handling', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'arjun@quickmela.com');
      await page.fill('input[name="password"]', 'BuyerPass123!');
      await page.click('button[type="submit"]');

      // Go offline
      await page.context().setOffline(true);

      await page.goto(`${BASE_URL}/product/1`);

      // Should show offline message
      await expect(page.locator('text=You are currently offline')).toBeVisible();

      // Come back online
      await page.context().setOffline(false);

      // Should recover and load content
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
    });

  });

});
