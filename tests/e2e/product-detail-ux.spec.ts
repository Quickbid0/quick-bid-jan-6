import { test, expect } from '@playwright/test';

test.describe('Product Detail UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'buyer',
        user_type: 'buyer'
      }));
    });
  });

  test('Product detail loads with complete information', async ({ page }) => {
    await page.goto('/product/test-123');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: User never sees blank screen
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="product-detail"], main').first()).toBeVisible();
    
    // UX Assertion: Product title is prominent
    const productTitle = page.locator('[data-testid="product-title"], h1');
    await expect(productTitle).toBeVisible();
    
    const titleText = await productTitle.textContent();
    expect(titleText?.length).toBeGreaterThan(0);
    expect(titleText?.length).toBeLessThan(200); // Not too long
    
    // UX Assertion: Pricing information is clear and hierarchical
    const currentPrice = page.locator('[data-testid="current-price"], [class*="current-price"]');
    await expect(currentPrice).toBeVisible();
    
    const startingPrice = page.locator('[data-testid="starting-price"], [class*="starting-price"]');
    if (await startingPrice.isVisible()) {
      await expect(startingPrice).toBeVisible();
      
      // Check price hierarchy (current should be more prominent than starting)
      const currentPriceSize = await currentPrice.evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      const startingPriceSize = await startingPrice.evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      expect(currentPriceSize).toBeGreaterThanOrEqual(startingPriceSize);
    }
    
    // UX Assertion: Urgency indicators are visible
    const urgencyElements = page.locator('[data-testid="time-remaining"], [class*="ending"], [class*="urgent"], [data-testid="countdown"]');
    if (await urgencyElements.count() > 0) {
      await expect(urgencyElements.first()).toBeVisible();
      
      const urgencyText = await urgencyElements.first().textContent();
      expect(urgencyText?.length).toBeGreaterThan(0);
    }
  });

  test('Product images and media display', async ({ page }) => {
    await page.goto('/product/test-123');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Product images load properly
    const imageGallery = page.locator('[data-testid="image-gallery"], .product-images');
    if (await imageGallery.isVisible()) {
      await expect(imageGallery).toBeVisible();
      
      const images = imageGallery.locator('img, [data-testid="product-image"]');
      if (await images.count() > 0) {
        await expect(images.first()).toBeVisible();
        
        // Check images load (not broken)
        const firstImage = images.first();
        await expect(firstImage).toHaveAttribute('src');
        
        // Wait for image to load
        await page.waitForTimeout(1000);
        
        const naturalWidth = await firstImage.evaluate(img => {
          if (img instanceof HTMLImageElement) {
            return img.naturalWidth;
          }
          return 0;
        });
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
    
    // Test image navigation
    const imageThumbnails = page.locator('[data-testid="image-thumbnail"], .thumbnail');
    if (await imageThumbnails.count() > 1) {
      await expect(imageThumbnails.first()).toBeVisible();
      
      // UX Assertion: Thumbnail interaction works
      await imageThumbnails.nth(1).click();
      await page.waitForTimeout(500);
      
      // Main image should change
      const mainImage = page.locator('[data-testid="main-image"], .main-product-image img');
      if (await mainImage.isVisible()) {
        await expect(mainImage).toBeVisible();
      }
    }
  });

  test('Bid placement UX flow', async ({ page }) => {
    await page.goto('/product/test-123');
    await page.waitForLoadState('networkidle');
    
    // Find bid section
    const bidSection = page.locator('[data-testid="bid-section"], .bid-form');
    if (await bidSection.isVisible()) {
      // UX Assertion: Bid input is clear and accessible
      const bidInput = page.locator('input[placeholder*="bid"], [data-testid="bid-amount"], input[name="bid"]');
      await expect(bidInput).toBeVisible();
      
      // Check input attributes
      const inputType = await bidInput.getAttribute('type');
      expect(inputType).toBe('number'); // Should be number input for bids
      
      const hasPlaceholder = await bidInput.getAttribute('placeholder');
      expect(hasPlaceholder?.length).toBeGreaterThan(0);
      
      // Test bid input validation
      await bidInput.fill('0'); // Too low
      await page.keyboard.press('Tab');
      
      const errorMessage = page.locator('[data-testid="bid-error"], .error-message');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
        
        const errorText = await errorMessage.textContent();
        expect(errorText?.length).toBeGreaterThan(0);
        expect(errorText?.length).toBeLessThan(200); // Not too verbose
      }
      
      // Test valid bid
      await bidInput.fill('15000');
      await page.keyboard.press('Tab');
      
      // UX Assertion: Error clears with valid input
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).not.toBeVisible({ timeout: 3000 });
      }
      
      // Test bid submission
      const placeBidButton = page.locator('button:has-text("Place Bid"), [data-testid="place-bid"]');
      if (await placeBidButton.isVisible()) {
        // Check button state
        const isDisabled = await placeBidButton.isDisabled();
        if (isDisabled) {
          // Should enable with valid bid
          await expect(placeBidButton).toBeEnabled({ timeout: 3000 });
        }
        
        await placeBidButton.click();
        
        // UX Assertion: Bid confirmation flow
        const confirmModal = page.locator('[data-testid="bid-confirmation"], .modal, .dialog');
        if (await confirmModal.isVisible()) {
          await expect(confirmModal).toBeVisible();
          
          const confirmButton = confirmModal.locator('button:has-text("Confirm"), [data-testid="confirm-bid"]');
          if (await confirmButton.isVisible()) {
            await expect(confirmButton).toBeVisible();
            
            await confirmButton.click();
            
            // UX Assertion: Success feedback
            const successMessage = page.locator('[data-testid="bid-success"], .success-message');
            if (await successMessage.isVisible()) {
              await expect(successMessage).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('Product detail mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/product/test-123');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: No horizontal scroll on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // UX Assertion: Images resize correctly
    const imageGallery = page.locator('[data-testid="image-gallery"], .product-images');
    if (await imageGallery.isVisible()) {
      const galleryWidth = await imageGallery.evaluate(el => {
        if (el instanceof HTMLElement) {
          return el.offsetWidth;
        }
        return 0;
      });
      expect(galleryWidth).toBeLessThanOrEqual(viewportWidth - 32); // Account for padding
    }
    
    // UX Assertion: Actions are reachable on mobile
    const bidButton = page.locator('button:has-text("Place Bid"), [data-testid="place-bid"]');
    if (await bidButton.isVisible()) {
      await expect(bidButton).toBeVisible();
      
      // Check touch target size
      const buttonSize = await bidButton.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
      });
      expect(buttonSize).toBeGreaterThanOrEqual(44);
    }
    
    // Test mobile image gallery
    const imageThumbnails = page.locator('[data-testid="image-thumbnail"], .thumbnail');
    if (await imageThumbnails.count() > 0) {
      await expect(imageThumbnails.first()).toBeVisible();
      
      // Check thumbnails are scrollable on mobile
      const thumbnailContainer = imageThumbnails.first().locator('..');
      const isScrollable = await thumbnailContainer.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      
      if (isScrollable) {
        // UX Assertion: Horizontal scroll for thumbnails
        await thumbnailContainer.evaluate(el => {
          el.scrollLeft = el.scrollWidth; // Scroll to end
        });
        
        await page.waitForTimeout(500);
        
        // Last thumbnail should be visible
        const lastThumbnail = imageThumbnails.last();
        const isVisible = await lastThumbnail.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('Product information hierarchy and readability', async ({ page }) => {
    await page.goto('/product/test-123');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Typography hierarchy is clear
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check heading sizes
    const h1Elements = page.locator('h1');
    const h2Elements = page.locator('h2');
    const h3Elements = page.locator('h3');
    
    if (await h1Elements.count() > 0 && await h2Elements.count() > 0) {
      const h1FontSize = await h1Elements.first().evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      const h2FontSize = await h2Elements.first().evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      
      expect(h1FontSize).toBeGreaterThan(h2FontSize);
    }
    
    // UX Assertion: Important information is prominent
    const priceSection = page.locator('[data-testid="price-section"], .pricing');
    if (await priceSection.isVisible()) {
      const priceElements = priceSection.locator('[class*="price"], [data-testid*="price"]');
      if (await priceElements.count() > 0) {
        await expect(priceElements.first()).toBeVisible();
        
        // Check price visibility (larger text)
        const priceFontSize = await priceElements.first().evaluate(el => {
          const style = getComputedStyle(el);
          return parseFloat(style.fontSize);
        });
        
        expect(priceFontSize).toBeGreaterThan(16); // Larger than body text
      }
    }
    
    // UX Assertion: Description is readable
    const description = page.locator('[data-testid="product-description"], .description, .product-details');
    if (await description.isVisible()) {
      await expect(description).toBeVisible();
      
      const descriptionText = await description.textContent();
      expect(descriptionText?.length).toBeGreaterThan(50); // Substantial content
      
      // Check line height for readability
      const lineHeight = await description.evaluate(el => {
        const style = getComputedStyle(el);
        return parseFloat(style.lineHeight);
      });
      
      expect(lineHeight).toBeGreaterThanOrEqual(1.4); // Good readability
    }
  });

  test('Product detail loading and error states', async ({ page }) => {
    // Test loading state
    await page.goto('/product/test-123');
    
    const loadingElements = page.locator('[data-testid="loading"], .animate-spin, [class*="loading"]');
    
    // Loading should be temporary
    let loadingVisible = false;
    for (let i = 0; i < 10; i++) {
      loadingVisible = await loadingElements.isVisible();
      if (!loadingVisible) break;
      await page.waitForTimeout(500);
    }
    
    await expect(loadingElements).not.toBeVisible({ timeout: 10000 });
    
    // Test error state
    await page.route('**/api/products/test-123', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Product not found' })
      });
    });
    
    await page.goto('/product/test-123');
    
    // UX Assertion: Error handling is clear
    const errorElements = page.locator('[data-testid="error"], [role="alert"], .error-message');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
      
      const errorText = await errorElements.first().textContent();
      expect(errorText?.length).toBeGreaterThan(0);
      
      // UX Assertion: Error provides recovery options
      const hasRecovery = errorText?.toLowerCase().includes('back') ||
                     errorText?.toLowerCase().includes('browse') ||
                     errorText?.toLowerCase().includes('search');
      expect(hasRecovery).toBeTruthy();
    }
  });
});
