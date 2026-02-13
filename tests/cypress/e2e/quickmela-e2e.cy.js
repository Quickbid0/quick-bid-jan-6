describe('QuickMela E2E Test Suite', () => {
  const testUsers = {
    buyer: {
      email: 'testbuyer@example.com',
      password: 'TestPass123!',
      name: 'Test Buyer'
    },
    seller: {
      email: 'testseller@example.com',
      password: 'TestPass123!',
      name: 'Test Seller'
    },
    admin: {
      email: 'testadmin@example.com',
      password: 'TestPass123!',
      name: 'Test Admin'
    }
  };

  beforeEach(() => {
    // Clear localStorage and cookies before each test
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Authentication Flow', () => {
    it('should complete buyer registration flow', () => {
      cy.visit('/register');

      // Fill registration form
      cy.get('[data-testid="name-input"]').type(`Test Buyer ${Date.now()}`);
      cy.get('[data-testid="email-input"]').type(`buyer${Date.now()}@test.com`);
      cy.get('[data-testid="password-input"]').type('TestPass123!');
      cy.get('[data-testid="confirm-password-input"]').type('TestPass123!');

      // Select role
      cy.get('[data-testid="role-select"]').select('buyer');

      // Submit registration
      cy.get('[data-testid="register-button"]').click();

      // Should show success message or redirect to email verification
      cy.contains('Registration successful', { timeout: 10000 }).should('be.visible');
    });

    it('should handle login and redirect to dashboard', () => {
      cy.visit('/login');

      // Fill login form
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);

      // Submit login
      cy.get('[data-testid="login-button"]').click();

      // Should redirect to buyer dashboard
      cy.url({ timeout: 10000 }).should('include', '/buyer/dashboard');
      cy.contains('Welcome, Test Buyer').should('be.visible');
    });

    it('should prevent unauthorized access', () => {
      // Try to access protected route without authentication
      cy.visit('/buyer/dashboard');

      // Should redirect to login
      cy.url().should('include', '/login');
      cy.contains('Please log in').should('be.visible');
    });

    it('should handle logout correctly', () => {
      // Login first
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/buyer/dashboard');

      // Logout
      cy.get('[data-testid="logout-button"]').click();

      // Should redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Welcome to QuickMela').should('be.visible');
    });
  });

  describe('Auction Management', () => {
    beforeEach(() => {
      // Login as seller for product creation tests
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.seller.email);
      cy.get('[data-testid="password-input"]').type(testUsers.seller.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/seller/dashboard');
    });

    it('should create new auction', () => {
      cy.visit('/add-product');

      // Fill auction form
      cy.get('[data-testid="product-title"]').type(`Test Auction ${Date.now()}`);
      cy.get('[data-testid="product-description"]').type('This is a comprehensive test auction item for QA testing purposes.');
      cy.get('[data-testid="product-category"]').select('electronics');
      cy.get('[data-testid="starting-price"]').type('100');
      cy.get('[data-testid="auction-duration"]').type('7');

      // Upload image (if file input exists)
      cy.get('[data-testid="product-images"]').then($input => {
        if ($input.length > 0) {
          // Create a test file for upload
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.get('[data-testid="product-images"]').selectFile({
              contents: Cypress.Buffer.from(fileContent),
              fileName: 'test-image.jpg',
              mimeType: 'image/jpeg'
            }, { force: true });
          });
        }
      });

      // Submit auction
      cy.get('[data-testid="create-product-button"]').click();

      // Should show success message
      cy.contains('Product created successfully', { timeout: 10000 }).should('be.visible');
    });

    it('should browse and filter auctions', () => {
      cy.visit('/buyer/auctions');

      // Wait for auctions to load
      cy.get('[data-testid="product-card"], .auction-card', { timeout: 10000 }).should('have.length.greaterThan', 0);

      // Test search functionality
      cy.get('[data-testid="search-input"]').type('electronics');
      cy.get('[data-testid="search-button"]').click();

      // Should show filtered results
      cy.get('[data-testid="product-card"]').should('be.visible');
    });

    it('should place bid on auction', () => {
      cy.visit('/buyer/auctions');

      // Click on first auction
      cy.get('[data-testid="product-card"]').first().click();

      // Should be on product detail page
      cy.get('[data-testid="product-title"]').should('be.visible');
      cy.get('[data-testid="current-bid"]').should('be.visible');

      // Get current bid amount
      cy.get('[data-testid="current-bid"]').invoke('text').then((currentBidText) => {
        const currentBid = parseInt(currentBidText.replace(/[^0-9]/g, ''));
        const newBid = currentBid + 10;

        // Place bid
        cy.get('[data-testid="place-bid-button"]').click();
        cy.get('[data-testid="bid-amount-input"]').type(newBid.toString());
        cy.get('[data-testid="confirm-bid-button"]').click();

        // Should show success message
        cy.contains('Bid placed successfully', { timeout: 5000 }).should('be.visible');

        // Check bid history
        cy.get('[data-testid="bids-tab"]').click();
        cy.contains(`₹${newBid}`).should('be.visible');
      });
    });
  });

  describe('Payment Integration', () => {
    beforeEach(() => {
      // Login as buyer
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/buyer/dashboard');
    });

    it('should handle wallet operations', () => {
      // Navigate to wallet
      cy.get('[data-testid="wallet-link"]').click();
      cy.url().should('include', '/wallet');

      // Check wallet balance
      cy.get('[data-testid="wallet-balance"]').should('be.visible');

      // Add funds
      cy.get('[data-testid="add-funds-button"]').click();
      cy.get('[data-testid="deposit-amount"]').type('1000');
      cy.get('[data-testid="confirm-deposit-button"]').click();

      // Should show payment flow
      cy.get('.razorpay-container, [data-testid="payment-modal"]', { timeout: 10000 }).should('be.visible');
    });

    it('should complete auction purchase flow', () => {
      // Navigate to wins
      cy.get('[data-testid="wins-link"]').click();
      cy.url().should('include', '/buyer/wins');

      // Click on won auction
      cy.get('[data-testid="won-auction"]').first().click();

      // Should show payment options
      cy.get('[data-testid="payment-section"]').should('be.visible');

      // Initiate payment
      cy.get('[data-testid="pay-now-button"]').click();

      // Should redirect to payment gateway
      cy.url({ timeout: 10000 }).should('include', 'razorpay');
    });
  });

  describe('Admin Functionality', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.admin.email);
      cy.get('[data-testid="password-input"]').type(testUsers.admin.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/admin/dashboard');
    });

    it('should access admin dashboard', () => {
      // Verify admin dashboard elements
      cy.get('[data-testid="admin-welcome"]').should('be.visible');
      cy.get('[data-testid="total-users"]').should('be.visible');
      cy.get('[data-testid="active-auctions"]').should('be.visible');
      cy.get('[data-testid="total-revenue"]').should('be.visible');
    });

    it('should manage users', () => {
      cy.get('[data-testid="users-link"]').click();
      cy.url().should('include', '/admin/users');

      // Search for user
      cy.get('[data-testid="user-search"]').type(testUsers.buyer.email);
      cy.get('[data-testid="search-button"]').click();

      // Should show user in results
      cy.contains(testUsers.buyer.email).should('be.visible');
    });

    it('should moderate products', () => {
      cy.get('[data-testid="products-link"]').click();
      cy.url().should('include', '/admin/products');

      // Filter pending products
      cy.get('[data-testid="status-filter"]').select('pending');

      // Approve product (if any pending)
      cy.get('[data-testid="approve-product-button"]').first().then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.get('[data-testid="confirm-approve-button"]').click();
          cy.contains('Product approved successfully').should('be.visible');
        }
      });
    });
  });

  describe('Security Testing', () => {
    it('should prevent XSS attacks', () => {
      cy.visit('/register');

      const xssPayload = '<script>alert("XSS")</script>';
      cy.get('[data-testid="name-input"]').type(xssPayload);
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="register-button"]').click();

      // Should not execute script
      cy.on('window:alert', (alertText) => {
        throw new Error(`XSS vulnerability detected: ${alertText}`);
      });

      // Should handle gracefully
      cy.contains('Registration failed', { timeout: 5000 }).should('be.visible');
    });

    it('should prevent SQL injection', () => {
      cy.visit('/login');

      const sqlInjection = "'; DROP TABLE users; --";
      cy.get('[data-testid="email-input"]').type(sqlInjection);
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      // Should handle gracefully without crashing
      cy.contains('Login failed', { timeout: 5000 }).should('be.visible');
    });

    it('should validate JWT token security', () => {
      // Login first
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/buyer/dashboard');

      // Tamper with JWT token
      cy.window().then((win) => {
        const token = win.localStorage.getItem('auth_token');
        if (token) {
          const tamperedToken = token.replace(/.$/, 'X');
          win.localStorage.setItem('auth_token', tamperedToken);
        }
      });

      // Try to access protected route
      cy.visit('/buyer/dashboard');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should enforce rate limiting', () => {
      cy.visit('/login');

      // Attempt multiple rapid requests
      for (let i = 0; i < 15; i++) {
        cy.get('[data-testid="email-input"]').clear().type(`test${i}@example.com`);
        cy.get('[data-testid="password-input"]').clear().type('password123');
        cy.get('[data-testid="login-button"]').click();

        if (i < 14) {
          cy.wait(200);
        }
      }

      // Should eventually show rate limit message
      cy.contains('Rate limit exceeded', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Performance & UX', () => {
    it('should load pages within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/', { timeout: 10000 });

      cy.window().then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });

    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');

      cy.visit('/login');

      // Check mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible').click();
      cy.get('[data-testid="mobile-nav"]').should('be.visible');

      // Test login on mobile
      cy.get('[data-testid="email-input"]').should('be.visible').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').should('be.visible').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').should('be.visible').click();
    });

    it('should handle network failures gracefully', () => {
      // Intercept network requests to simulate offline
      cy.intercept('GET', '**/api/**', { forceNetworkError: true }).as('networkError');

      cy.visit('/buyer/dashboard');

      // Should show network error message
      cy.contains('Network error', { timeout: 10000 }).should('be.visible');
    });

    it('should handle form validation properly', () => {
      cy.visit('/register');

      // Test empty form submission
      cy.get('[data-testid="register-button"]').click();

      // Should show validation errors
      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');

      // Test invalid email
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.contains('Please enter a valid email address').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 pages correctly', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      cy.contains('Page not found', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="home-link"]').should('be.visible').click();

      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle server errors gracefully', () => {
      // Intercept API call to return 500 error
      cy.intercept('GET', '**/api/auctions', { statusCode: 500 }).as('serverError');

      cy.visit('/buyer/auctions');

      // Should show error message instead of crashing
      cy.contains('Server error', { timeout: 5000 }).should('be.visible');
    });

    it('should recover from session timeout', () => {
      // Login first
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/buyer/dashboard');

      // Simulate session timeout
      cy.window().then((win) => {
        win.localStorage.removeItem('auth_token');
        win.sessionStorage.clear();
      });

      // Try to access protected route
      cy.visit('/buyer/dashboard');

      // Should redirect to login with session expired message
      cy.url().should('include', '/login');
      cy.contains('Session expired').should('be.visible');

      // Should be able to login again
      cy.get('[data-testid="email-input"]').type(testUsers.buyer.email);
      cy.get('[data-testid="password-input"]').type(testUsers.buyer.password);
      cy.get('[data-testid="login-button"]').click();

      cy.url().should('include', '/buyer/dashboard');
    });
  });
});
