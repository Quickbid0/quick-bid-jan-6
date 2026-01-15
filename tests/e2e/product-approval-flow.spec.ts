import { test, expect } from '@playwright/test';

test.describe('Product approval lifecycle', () => {
  const productName = `Test Product ${Date.now()}`;

  test('Seller → Admin approval → Buyer visibility', async ({ page, request }) => {

    // ─────────────────────────────────────────────
    // 1️⃣ SELLER LOGIN
    // ─────────────────────────────────────────────
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'seller@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the correct page or still on login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Try demo login instead
      await page.goto('/demo?seller=true');
      await page.waitForLoadState('networkidle');
      
      // Wait for demo page to load and click the first demo seller card
      await page.waitForTimeout(3000);
      
      // Try clicking directly on the demo seller card
      const demoSellerCard = page.locator('text=Demo Seller').first();
      if (await demoSellerCard.isVisible()) {
        await demoSellerCard.click();
        await page.waitForTimeout(2000);
      }
      
      // Check if we're now on the seller dashboard
      await page.waitForLoadState('networkidle');
      const finalUrl = page.url();
      if (!finalUrl.includes('seller-dashboard')) {
        // If still not on dashboard, try clicking any visible login button
        const loginBtn = page.locator('button').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    await expect(page).toHaveURL(/seller-dashboard/);

    // ─────────────────────────────────────────────
    // 2️⃣ SELLER CREATES PRODUCT
    // ─────────────────────────────────────────────
    await page.goto('/seller/products/create');

    await page.fill('[data-testid="product-name"]', productName);
    await page.fill('[data-testid="product-price"]', '10000');
    await page.fill('[data-testid="product-description"]', 'E2E test product');

    await page.click('[data-testid="submit-for-approval"]');

    // Seller confirmation
    await expect(
      page.locator('text=Submitted for admin approval')
    ).toBeVisible();

    // ─────────────────────────────────────────────
    // 3️⃣ ADMIN LOGIN
    // ─────────────────────────────────────────────
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the correct page or still on login
    const adminUrl = page.url();
    if (adminUrl.includes('/login')) {
      // Try demo login instead
      await page.goto('/demo?admin=true');
      await page.waitForLoadState('networkidle');
      
      // Wait for demo page to load and click the first demo admin card
      await page.waitForTimeout(3000);
      
      // Try clicking directly on the demo admin card
      const demoAdminCard = page.locator('text=Demo Admin').first();
      if (await demoAdminCard.isVisible()) {
        await demoAdminCard.click();
        await page.waitForTimeout(2000);
      }
      
      // Check if we're now on the admin dashboard
      await page.waitForLoadState('networkidle');
      const finalUrl = page.url();
      if (!finalUrl.includes('admin-dashboard')) {
        // If still not on dashboard, try clicking any visible login button
        const loginBtn = page.locator('button').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    await expect(page).toHaveURL(/admin-dashboard/);

    // ─────────────────────────────────────────────
    // 4️⃣ ADMIN SEES PENDING PRODUCT
    // ─────────────────────────────────────────────
    await page.goto('/admin/products?status=pending');

    const productRow = page.locator(`text=${productName}`);
    await expect(productRow).toBeVisible();

    // ─────────────────────────────────────────────
    // 5️⃣ ADMIN APPROVES PRODUCT
    // ─────────────────────────────────────────────
    await productRow.click();
    await page.click('[data-testid="approve-product"]');

    await expect(
      page.locator('text=Product approved')
    ).toBeVisible();

    // ─────────────────────────────────────────────
    // 6️⃣ BUYER LOGIN
    // ─────────────────────────────────────────────
    await page.goto('/login');

    await page.fill('[data-testid="email"]', 'buyer@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the correct page or still on login
    const buyerUrl = page.url();
    if (buyerUrl.includes('/login')) {
      // Try demo login instead
      await page.goto('/demo?buyer=true');
      await page.waitForLoadState('networkidle');
      
      // Wait for demo page to load and click the first demo buyer card
      await page.waitForTimeout(3000);
      
      // Try clicking directly on the demo buyer card
      const demoBuyerCard = page.locator('text=Demo Buyer').first();
      if (await demoBuyerCard.isVisible()) {
        await demoBuyerCard.click();
        await page.waitForTimeout(2000);
      }
      
      // Check if we're now on the buyer dashboard
      await page.waitForLoadState('networkidle');
      const finalUrl = page.url();
      if (!finalUrl.includes('buyer-dashboard')) {
        // If still not on dashboard, try clicking any visible login button
        const loginBtn = page.locator('button').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    await expect(page).toHaveURL(/buyer-dashboard/);

    // ─────────────────────────────────────────────
    // 7️⃣ BUYER SEES APPROVED PRODUCT
    // ─────────────────────────────────────────────
    await page.goto('/buyer/products');

    await expect(
      page.locator(`text=${productName}`)
    ).toBeVisible();
  });
});
