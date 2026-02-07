import { test, expect } from '@playwright/test';

test.describe('Wallet Critical Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for wallet access
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Wallet page renders balance', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Page must not be empty
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // CRITICAL: Wallet balance must be visible
    const balanceSection = page.locator('[data-testid="wallet-balance"]');
    await expect(balanceSection).toBeVisible();
    
    // Verify balance amount is displayed
    const balanceAmount = page.locator('text=/₹[0-9]+/i');
    await expect(balanceAmount).toBeVisible();
    
    // Page should have meaningful content height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(300);
  });

  test('Wallet shows transactions list', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Transactions section must be visible
    const transactionsSection = page.locator('[data-testid="wallet-transactions"]');
    await expect(transactionsSection).toBeVisible();
    
    // Verify transaction items exist
    const transactionItems = page.locator('.transaction-item, .list-item, tr, [data-testid*="transaction-item"]');
    const itemCount = await transactionItems.count();
    
    // Transactions may be empty, but section should exist
    const hasContent = await transactionsSection.isVisible() || itemCount > 0;
    expect(hasContent).toBeTruthy();
  });

  test('Wallet never shows blank screen during loading', async ({ page }) => {
    await page.goto('/wallet');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // CRITICAL: Page should not be blank
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should show either content or loading state
    const content = page.locator('main, section, .wallet-content, .balance, .transaction');
    const loading = page.locator('.animate-spin, [data-testid*="loading"]');
    
    const hasVisibleContent = await content.isVisible();
    const hasLoading = await loading.isVisible();
    
    expect(hasVisibleContent || hasLoading).toBeTruthy();
    
    // Page height should be reasonable
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(pageHeight).toBeGreaterThan(200);
  });

  test('Wallet handles empty state gracefully', async ({ page }) => {
    // Mock empty wallet data
    await page.route('**/api/wallet', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ balance: 0, transactions: [] })
      });
    });
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Should show empty state OR zero balance
    const emptyState = page.locator('text=/no transactions|empty|zero balance/i');
    const balanceZero = page.locator('text=/₹0|balance.*0/i');
    
    const hasContent = await emptyState.count() > 0 || await balanceZero.count() > 0;
    expect(hasContent).toBeTruthy();
    
    // Page should not be completely blank
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
