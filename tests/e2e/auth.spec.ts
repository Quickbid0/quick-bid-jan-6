import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Critical Tests', () => {
  test('Buyer is NOT redirected away from Dashboard', async ({ page }) => {
    // Mock buyer authentication using correct storage keys
    await page.addInitScript(() => {
      localStorage.setItem('qm-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'buyer@test.com',
        role: 'buyer',
        user_type: 'buyer',
        name: 'Test Buyer',
        is_verified: true
      }));
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Should stay on dashboard, not redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    expect(currentUrl).not.toContain('/buyer/dashboard');
    expect(currentUrl).not.toContain('/login');
    
    // Dashboard content should be visible
    const dashboardContent = page.locator('[data-testid="dashboard-logo"], section, main').first();
    await expect(dashboardContent).toBeVisible();
  });

  test('Seller is redirected to seller dashboard', async ({ page }) => {
    // Mock seller authentication using correct storage keys
    await page.addInitScript(() => {
      localStorage.setItem('qm-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'seller@test.com',
        role: 'seller',
        user_type: 'seller',
        name: 'Test Seller',
        is_verified: true
      }));
    });
    
    // Navigate to main dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Seller should be redirected to seller dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('/seller/dashboard');
    expect(currentUrl).not.toEqual('http://localhost:4173/dashboard'); // Should not be main dashboard
  });

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    // Clear authentication
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Should redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    expect(currentUrl).not.toContain('/dashboard');
  });

  test('Loading state resolves and shows content', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
    
    await page.goto('/dashboard');
    
    // In test scenario, loading resolves immediately, so check for content directly
    // CRITICAL: Loading should disappear and content should appear
    const content = page.locator('h1, h2, section, main').first();
    await expect(content).toBeVisible();
    
    // Verify loading spinner is not visible (resolved immediately)
    const loadingSpinner = page.locator('[data-testid="dashboard-spinner"]');
    await expect(loadingSpinner).not.toBeVisible();
  });
});
