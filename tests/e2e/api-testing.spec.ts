// API TESTING SCENARIOS FOR QUICKMELA BACKEND
// =========================================

import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4011/api';

test.describe('API Testing Scenarios', () => {

  test.describe('Authentication API', () => {

    test('Successful Login API', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('message', 'Login successful');
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');

      expect(data.user).toHaveProperty('email', 'arjun@quickmela.com');
      expect(data.user).toHaveProperty('role', 'buyer');
    });

    test('Invalid Credentials API', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'invalid@email.com',
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();

      expect(data).toHaveProperty('error', 'Invalid credentials');
    });

    test('JWT Token Validation', async ({ request }) => {
      // First get a valid token
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Use token to access protected route
      const protectedResponse = await request.get(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(protectedResponse.ok()).toBeTruthy();
    });

    test('Expired Token Handling', async ({ request }) => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request.get(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${expiredToken}`
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Token expired');
    });

  });

  test.describe('Product Management API', () => {

    test('Get Products List', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/products`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data.products)).toBeTruthy();
      expect(data.products.length).toBeGreaterThan(0);

      // Validate product structure
      const firstProduct = data.products[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('title');
      expect(firstProduct).toHaveProperty('startingBid');
      expect(firstProduct).toHaveProperty('currentBid');
      expect(firstProduct).toHaveProperty('auctionEndTime');
    });

    test('Get Single Product', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/products/1`);

      expect(response.ok()).toBeTruthy();
      const product = await response.json();

      expect(product).toHaveProperty('id', 1);
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('bids');
      expect(Array.isArray(product.bids)).toBeTruthy();
    });

    test('Create Product (Seller)', async ({ request }) => {
      // First login as seller
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'anita@quickmela.com',
          password: 'SellerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Create product
      const productData = {
        title: 'API Test Product',
        description: 'Created via API test',
        startingBid: 5000,
        category: 'car',
        images: ['test-image.jpg'],
        auctionEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const createResponse = await request.post(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: productData
      });

      expect(createResponse.ok()).toBeTruthy();
      const createdProduct = await createResponse.json();

      expect(createdProduct).toHaveProperty('id');
      expect(createdProduct.title).toBe(productData.title);
    });

  });

  test.describe('Bidding API', () => {

    test('Place Bid API', async ({ request }) => {
      // Login first
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Place bid
      const bidData = {
        bidAmount: 15000,
        productId: 1
      };

      const bidResponse = await request.post(`${API_BASE_URL}/products/1/bid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: bidData
      });

      expect(bidResponse.ok()).toBeTruthy();
      const bidResult = await bidResponse.json();

      expect(bidResult).toHaveProperty('success', true);
      expect(bidResult).toHaveProperty('message', 'Bid placed successfully');
    });

    test('Bid Validation - Insufficient Increment', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Try bid with insufficient increment
      const bidData = {
        bidAmount: 100, // Much lower than required increment
        productId: 1
      };

      const bidResponse = await request.post(`${API_BASE_URL}/products/1/bid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: bidData
      });

      expect(bidResponse.status()).toBe(400);
      const error = await bidResponse.json();

      expect(error).toHaveProperty('error', 'Bid amount too low');
    });

    test('Get Bid History', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/products/1/bids`);

      expect(response.ok()).toBeTruthy();
      const bids = await response.json();

      expect(Array.isArray(bids)).toBeTruthy();

      if (bids.length > 0) {
        const firstBid = bids[0];
        expect(firstBid).toHaveProperty('id');
        expect(firstBid).toHaveProperty('bidAmount');
        expect(firstBid).toHaveProperty('userId');
        expect(firstBid).toHaveProperty('timestamp');
      }
    });

  });

  test.describe('Wallet API', () => {

    test('Get Wallet Balance', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const response = await request.get(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const wallet = await response.json();

      expect(wallet).toHaveProperty('balance');
      expect(typeof wallet.balance).toBe('number');
      expect(wallet.balance).toBeGreaterThanOrEqual(0);
    });

    test('Add Funds to Wallet', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const addFundsData = {
        amount: 5000,
        paymentMethod: 'razorpay'
      };

      const response = await request.post(`${API_BASE_URL}/wallet/add-funds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: addFundsData
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();

      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('amount', 5000);
    });

    test('Get Transaction History', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const response = await request.get(`${API_BASE_URL}/wallet/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const transactions = await response.json();

      expect(Array.isArray(transactions)).toBeTruthy();

      if (transactions.length > 0) {
        const firstTransaction = transactions[0];
        expect(firstTransaction).toHaveProperty('id');
        expect(firstTransaction).toHaveProperty('type');
        expect(firstTransaction).toHaveProperty('amount');
        expect(firstTransaction).toHaveProperty('timestamp');
      }
    });

  });

  test.describe('Admin API', () => {

    test('Get System Statistics', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'admin@quickmela.com',
          password: 'AdminPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const response = await request.get(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const stats = await response.json();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalAuctions');
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('activeAuctions');
    });

    test('User Management', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'admin@quickmela.com',
          password: 'AdminPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const response = await request.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const users = await response.json();

      expect(Array.isArray(users)).toBeTruthy();

      if (users.length > 0) {
        const firstUser = users[0];
        expect(firstUser).toHaveProperty('id');
        expect(firstUser).toHaveProperty('email');
        expect(firstUser).toHaveProperty('role');
        expect(firstUser).toHaveProperty('isActive');
      }
    });

    test('Suspend User', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'admin@quickmela.com',
          password: 'AdminPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const suspendData = {
        userId: 'test-user-id',
        reason: 'Violation of terms'
      };

      const response = await request.post(`${API_BASE_URL}/admin/users/suspend`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: suspendData
      });

      // Should succeed even if user doesn't exist (for test purposes)
      expect([200, 404]).toContain(response.status());
    });

  });

  test.describe('KYC API', () => {

    test('Submit KYC Documents', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const kycData = {
        documentType: 'aadhaar',
        documentNumber: '123456789012',
        name: 'Arjun Kumar',
        address: 'Test Address',
        documents: ['aadhaar-front.jpg', 'aadhaar-back.jpg']
      };

      const response = await request.post(`${API_BASE_URL}/kyc/submit`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: kycData
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();

      expect(result).toHaveProperty('status', 'pending');
      expect(result).toHaveProperty('message', 'KYC submitted successfully');
    });

    test('Get KYC Status', async ({ request }) => {
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: 'arjun@quickmela.com',
          password: 'BuyerPass123!'
        }
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      const response = await request.get(`${API_BASE_URL}/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const kycStatus = await response.json();

      expect(kycStatus).toHaveProperty('status');
      expect(['pending', 'approved', 'rejected']).toContain(kycStatus.status);
    });

  });

  test.describe('Email API', () => {

    test('Send Verification Email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/send-verification`, {
        data: {
          email: 'test@example.com'
        }
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Verification email sent');
    });

    test('Send Password Reset Email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/forgot-password`, {
        data: {
          email: 'arjun@quickmela.com'
        }
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Password reset email sent');
    });

  });

  test.describe('Health Check API', () => {

    test('Service Health Check', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);

      expect(response.ok()).toBeTruthy();
      const health = await response.json();

      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('version');
      expect(health).toHaveProperty('uptime');
    });

    test('Database Health Check', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health/database`);

      expect(response.ok()).toBeTruthy();
      const dbHealth = await response.json();

      expect(dbHealth).toHaveProperty('database', 'connected');
      expect(dbHealth).toHaveProperty('responseTime');
    });

    test('External Services Health', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health/services`);

      expect(response.ok()).toBeTruthy();
      const servicesHealth = await response.json();

      expect(servicesHealth).toHaveProperty('emailService');
      expect(servicesHealth).toHaveProperty('paymentService');
      expect(servicesHealth).toHaveProperty('storageService');
    });

  });

  test.describe('Rate Limiting & Security', () => {

    test('Rate Limiting on Auth Endpoints', async ({ request }) => {
      const requests = [];

      // Make many rapid login attempts
      for (let i = 0; i < 15; i++) {
        requests.push(
          request.post(`${API_BASE_URL}/auth/login`, {
            data: {
              email: 'arjun@quickmela.com',
              password: 'wrongpassword'
            }
          })
        );
      }

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimitedCount = responses.filter(r => r.status() === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    test('CORS Headers', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);

      expect(response.headers()['access-control-allow-origin']).toBeTruthy();
      expect(response.headers()['access-control-allow-methods']).toContain('GET');
      expect(response.headers()['access-control-allow-headers']).toContain('content-type');
    });

    test('Input Validation', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: '<script>alert("xss")</script>',
          password: 'password'
        }
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('error', 'Invalid input');
    });

  });

});
