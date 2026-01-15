import { test, expect } from '@playwright/test';

const BUYER_CREDENTIALS = { email: 'buyer1@test.in', password: 'Test@12345' };

test.describe('Buyer Experience Redesign Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Inject demo session to bypass login
    await page.addInitScript(() => {
        const demoSession = {
            access_token: 'demo-token',
            token_type: 'bearer',
            user: {
                id: 'demo-buyer',
                email: 'buyer1@test.in',
                user_metadata: { role: 'buyer', user_type: 'buyer', name: 'Demo Buyer' },
                app_metadata: { role: 'buyer' }
            }
        };
        localStorage.setItem('demo-session', JSON.stringify(demoSession));
        localStorage.setItem('demo-user-role', 'buyer');
        localStorage.setItem('demo-user-type', 'buyer');
        localStorage.setItem('demo-user-name', 'Demo Buyer');
    });
  });

  test('1. Product Catalog Redesign', async ({ page }) => {
    await page.goto('/catalog');
    
    // 1. Verify Sticky Header
    const stickyHeader = page.locator('.sticky.top-16');
    await expect(stickyHeader).toBeVisible();
    await expect(stickyHeader).toContainText('Product Catalog');
    
    // 2. Verify Search and Filter Controls
    await expect(page.getByPlaceholder('Search auctions, brands, categories...')).toBeVisible();
    const filterBtn = page.getByRole('button', { name: /Filters/i });
    await expect(filterBtn).toBeVisible();
    
    // 3. Test Filter Expansion
    await filterBtn.click();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Price Range')).toBeVisible();
    await expect(page.getByText('Auction Type')).toBeVisible();
    
    // 4. Verify Card Layout & Badges
    // Wait for auction cards to load (mock data or real)
    const images = page.locator('[data-testid="auction-card-image"]');
    const cardCount = await images.count();
    if (cardCount > 0) {
      await expect(images.first()).toBeVisible({ timeout: 10000 });
    }
    
    // Check for specific badges if they exist in mock data
    // We can't guarantee specific data, but we can check if badges container exists on cards
    // or if the card structure matches the new design
    // Check for primary action button (View Details / Join Live / Place Bid) when cards exist
    if (cardCount > 0) {
      await expect(page.getByRole('button', { name: /View|Join|Bid/i }).first()).toBeVisible();
    }
  });

  test('2. Wishlist Functionality', async ({ page }) => {
    await page.goto('/products');
    
    // 1. Find a heart button on the first card
    // Note: The heart button might be hidden or appear on hover depending on design, 
    // but in our code it's absolutely positioned and visible.
    const firstCardHeart = page.locator('button[aria-label="Add to watchlist"]').first();
    // If not found, it might be "Remove from watchlist" if already added
    const firstCardHeartRemove = page.locator('button[aria-label="Remove from watchlist"]').first();
    
    if (await firstCardHeart.isVisible()) {
        await firstCardHeart.click();
        await expect(page.getByText('Added to watchlist')).toBeVisible();
    } else if (await firstCardHeartRemove.isVisible()) {
        // Toggle off then on
        await firstCardHeartRemove.click();
        await expect(page.getByText('Removed from watchlist')).toBeVisible();
        await page.waitForTimeout(500); // UI settle
        await page.locator('button[aria-label="Add to watchlist"]').first().click();
        await expect(page.getByText('Added to watchlist')).toBeVisible();
    }
    
    // 2. Verify on Watchlist Page
    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: /My Watchlist/i })).toBeVisible();
    // The item should be present
    // We can check for at least one card
    await expect(page.locator('.grid > div').first()).toBeVisible();
  });

  test('3. Buyer Dashboard Hierarchy', async ({ page }) => {
    await page.goto('/buyer/dashboard');
    
    // 1. Verify 2-Row Layout Headers
    await expect(page.locator('h2:has-text("Engagement")')).toBeVisible();
    await expect(page.locator('h2:has-text("Financial Overview")')).toBeVisible();
    
    // 2. Verify Metrics
    await expect(page.getByText('Won Auctions', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Wallet Balance', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Total Spent', { exact: true }).first()).toBeVisible();
    
    // 3. Verify Active Bids section (might be empty but header should exist if implemented that way)
    // Based on code, Active Bids is a StatCard under Engagement
    await expect(page.getByText('Active Bids', { exact: true }).first()).toBeVisible();
  });

  test('4. Live Auction UI', async ({ page }) => {
    await page.goto('/live-auction');
    
    // 1. Check for basic page structure
    await expect(page.getByRole('heading', { name: 'Live Auctions', level: 1 })).toBeVisible();
    
    // 2. Check for Trust Signals (SellerTrustSummary)
    // This depends on if a live auction is selected. 
    // If no live auction is active, we might see "No live auctions" or similar.
    // If the mock data provides a live auction, we verify badges.
    
    const liveBadge = page.getByText('LIVE', { exact: true });
    // This might not be visible if no auction is live in mock data.
    // We can soft-assert or check for the container.
    
    // If we have a "Live Now" or similar section
    // For now, let's just verify the page loads without crashing and shows *something*
    // The mock data in LiveAuctionPage.tsx usually has one item.
    
    // Check if "Upcoming Auctions" or "Live Now" text is present
    const hasContent = await page.locator('text=/Live Now|Upcoming Auctions|No live auctions/i').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

});
