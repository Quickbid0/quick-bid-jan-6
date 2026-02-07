import { test, expect } from '@playwright/test';

// Integration Testing Suite - Complete User Journeys
test.describe('Integration Tests - Complete User Flows', () => {
  test('should complete full buyer registration and login flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="name"]', 'Test Buyer');
    await page.fill('input[name="email"]', 'testbuyer@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="pincode"]', '110001');
    await page.fill('textarea[name="address"]', '123 Test Street, Delhi');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to verification or dashboard
    await page.waitForURL('**/verify-profile');
    expect(page.url()).toContain('/verify-profile');

    // Navigate to login (assuming registration auto-logs in)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to buyer dashboard
    await page.waitForURL('**/buyer/dashboard');
    expect(page.url()).toContain('/buyer/dashboard');
  });

  test('should complete seller registration and verification flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');

    // Select seller type
    await page.click('button:has-text("Seller")');

    // Fill seller registration form
    await page.fill('input[name="name"]', 'Test Seller');
    await page.fill('input[name="email"]', 'testseller@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="pincode"]', '110001');
    await page.fill('textarea[name="address"]', '123 Business Street, Delhi');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to seller verification
    await page.waitForURL('**/verify-seller');
    expect(page.url()).toContain('/verify-seller');

    // Check seller verification form elements
    await expect(page.locator('text=Business Details')).toBeVisible();
    await expect(page.locator('input[name="businessName"]')).toBeVisible();
    await expect(page.locator('input[name="gstNumber"]')).toBeVisible();
  });

  test('should complete full auction creation and bidding flow', async ({ page }) => {
    // Assume seller is logged in
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testseller@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to add product
    await page.goto('/add-product');

    // Fill auction creation form
    await page.fill('input[name="title"]', 'Test Auction Item');
    await page.fill('textarea[name="description"]', 'This is a test auction item for integration testing');
    await page.selectOption('select[name="category"]', 'electronics');
    await page.click('button:has-text("Excellent")'); // Condition

    // Go to pricing step
    await page.click('button:has-text("Next")');

    // Fill pricing details
    await page.fill('input[name="startingBid"]', '1000');
    await page.fill('input[name="reservePrice"]', '2000');
    await page.fill('input[name="bidIncrement"]', '100');
    await page.click('button:has-text("7 Days")'); // Duration

    // Go to media step
    await page.click('button:has-text("Next")');

    // Add location
    await page.fill('input[name="location"]', 'Delhi, India');

    // Submit auction
    await page.click('button:has-text("Create Listing")');

    // Should redirect to seller dashboard
    await page.waitForURL('**/seller/dashboard');
    expect(page.url()).toContain('/seller/dashboard');

    // Check that auction appears in seller's listings
    await expect(page.locator('text=Test Auction Item')).toBeVisible();
  });

  test('should complete full bidding flow from buyer perspective', async ({ page }) => {
    // Login as buyer
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to auctions
    await page.goto('/buyer/auctions');

    // Find and click on an auction
    await page.click('text=Test Auction Item');

    // Should be on product detail page
    await expect(page.locator('text=Test Auction Item')).toBeVisible();

    // Open bid modal
    await page.click('button:has-text("Place Bid")');

    // Fill bid details
    await page.fill('input[name="bidAmount"]', '1100');
    await page.fill('input[name="bidderName"]', 'Test Buyer');

    // Submit bid
    await page.click('button:has-text("Confirm Bid")');

    // Should show success message
    await expect(page.locator('text=Bid placed successfully')).toBeVisible();

    // Check bidding history
    await page.goto('/my-bids');
    await expect(page.locator('text=Test Auction Item')).toBeVisible();
    await expect(page.locator('text=₹1,100')).toBeVisible();
  });

  test('should complete payment and order tracking flow', async ({ page }) => {
    // Assume user has won an auction
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to won auctions
    await page.goto('/my/wins');

    // Click on won auction
    await page.click('text=Test Auction Item');

    // Click pay now
    await page.click('button:has-text("Pay Now")');

    // Should redirect to payment page
    await page.waitForURL('**/pay/**');
    expect(page.url()).toContain('/pay/');

    // Fill payment details (mock)
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="expiry"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    await page.fill('input[name="name"]', 'Test Buyer');

    // Submit payment
    await page.click('button:has-text("Pay Now")');

    // Should redirect to success page
    await page.waitForURL('**/payment/success');
    expect(page.url()).toContain('/payment/success');

    // Check order tracking
    await page.click('button:has-text("Track Order")');
    await page.waitForURL('**/order-tracking/**');
    expect(page.url()).toContain('/order-tracking/');

    // Should show order details
    await expect(page.locator('text=Test Auction Item')).toBeVisible();
    await expect(page.locator('text=Order Tracking')).toBeVisible();
  });

  test('should handle wallet top-up and balance management', async ({ page }) => {
    // Login as buyer
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to wallet
    await page.goto('/wallet');

    // Check current balance
    const initialBalance = await page.locator('[data-testid="wallet-balance"]').textContent();

    // Click add funds
    await page.click('button:has-text("Add Funds")');

    // Fill amount
    await page.fill('input[name="amount"]', '5000');

    // Select payment method and submit
    await page.click('button:has-text("Add Funds")');

    // Should show success
    await expect(page.locator('text=Funds added successfully')).toBeVisible();

    // Balance should be updated
    await page.reload();
    const updatedBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
    expect(updatedBalance).not.toBe(initialBalance);
  });

  test('should complete seller earnings and payout flow', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testseller@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to seller earnings
    await page.goto('/seller/earnings');

    // Check earnings display
    await expect(page.locator('text=Earnings')).toBeVisible();

    // Check payout history
    await page.click('tab:has-text("Payouts")');
    await expect(page.locator('text=Payout History')).toBeVisible();

    // Request payout
    await page.click('button:has-text("Request Payout")');
    await page.fill('input[name="amount"]', '1000');
    await page.selectOption('select[name="bankAccount"]', 'account1');
    await page.click('button:has-text("Submit Request")');

    // Should show success
    await expect(page.locator('text=Payout request submitted')).toBeVisible();
  });

  test('should handle admin winner management flow', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@quickbid.com');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to admin winners
    await page.goto('/admin/winners');

    // Find a winner
    await page.click('text=Test Auction Item');

    // Mark as paid
    await page.click('button:has-text("Mark as Paid")');

    // Confirm action
    await page.click('button:has-text("Confirm")');

    // Should show success
    await expect(page.locator('text=Payment marked as completed')).toBeVisible();

    // Check status update
    await expect(page.locator('text=Paid')).toBeVisible();
  });

  test('should handle real-time bidding with multiple users', async ({ page, context }) => {
    // Create multiple browser contexts to simulate multiple users
    const page2 = await context.newPage();

    // User 1 logs in and opens auction
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.goto('/product/test-auction-id');

    // User 2 logs in and opens same auction
    await page2.goto('/login');
    await page2.fill('input[type="email"]', 'testbuyer2@example.com');
    await page2.fill('input[type="password"]', 'TestPassword123!');
    await page2.click('button[type="submit"]');

    await page2.goto('/product/test-auction-id');

    // User 1 places bid
    await page.click('button:has-text("Place Bid")');
    await page.fill('input[name="bidAmount"]', '1200');
    await page.click('button:has-text("Confirm Bid")');

    // Both users should see updated bid
    await expect(page.locator('text=₹1,200')).toBeVisible();
    await expect(page2.locator('text=₹1,200')).toBeVisible();

    // User 2 places higher bid
    await page2.click('button:has-text("Place Bid")');
    await page2.fill('input[name="bidAmount"]', '1300');
    await page2.click('button:has-text("Confirm Bid")');

    // Both users should see updated bid
    await expect(page.locator('text=₹1,300')).toBeVisible();
    await expect(page2.locator('text=₹1,300')).toBeVisible();

    await page2.close();
  });

  test('should handle delivery tracking and updates', async ({ page }) => {
    // Login as buyer with completed order
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to order tracking
    await page.goto('/order-tracking/order-123');

    // Check order details
    await expect(page.locator('text=Test Auction Item')).toBeVisible();
    await expect(page.locator('text=Order Tracking')).toBeVisible();

    // Check tracking timeline
    await expect(page.locator('text=Order Confirmed')).toBeVisible();

    // Update delivery preferences
    await page.click('button:has-text("Update Preferences")');
    await page.fill('input[name="address"]', 'Updated Address');
    await page.click('button:has-text("Save Changes")');

    // Should show success
    await expect(page.locator('text=Preferences updated')).toBeVisible();
  });

  test('should handle support ticket creation and management', async ({ page }) => {
    // Login as buyer
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testbuyer@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to support
    await page.goto('/support');

    // Create new ticket
    await page.click('button:has-text("Create Ticket")');
    await page.fill('input[name="subject"]', 'Test Support Issue');
    await page.selectOption('select[name="category"]', 'payment');
    await page.fill('textarea[name="description"]', 'This is a test support ticket');
    await page.click('button:has-text("Submit Ticket")');

    // Should show success
    await expect(page.locator('text=Ticket created successfully')).toBeVisible();

    // Check ticket in list
    await page.goto('/support');
    await expect(page.locator('text=Test Support Issue')).toBeVisible();
  });
});
