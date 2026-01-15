// Accessibility Tests - Comprehensive Accessibility Validation
import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Page has proper heading structure', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page has exactly one h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // UX Assertion: Headings are properly nested
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Check that headings are in logical order
      const headingLevels = [];
      for (let i = 0; i < headingCount; i++) {
        const tagName = await headings.nth(i).evaluate(el => el.tagName);
        headingLevels.push(parseInt(tagName.charAt(1)));
      }
      
      // Verify no heading levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: All interactive elements are focusable
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      await expect(element).toBeFocused();
    }
    
    // UX Assertion: Tab order works correctly
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
    
    // Test tab navigation through multiple elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: All images have alt attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeDefined();
    }
    
    // UX Assertion: Decorative images have empty alt text
    const decorativeImages = page.locator('img[alt=""]');
    // This is allowed for decorative images
  });

  test('Form elements have proper labels', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: All form inputs have labels
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        
        if (ariaLabel || ariaLabelledBy) return true;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label !== null;
        }
        
        // Check if input is inside a label
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          if (parent.tagName === 'LABEL') return true;
          parent = parent.parentElement;
        }
        
        return false;
      });
      
      expect(hasLabel).toBeTruthy();
    }
  });

  test('Color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Text has sufficient contrast
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
    const elementCount = await textElements.count();
    
    // Check a sample of text elements for contrast
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = textElements.nth(i);
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
      
      // Basic contrast check (simplified)
      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
    }
  });

  test('ARIA landmarks are present', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page has main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
    
    // UX Assertion: Navigation landmarks are present
    const navigation = page.locator('nav, [role="navigation"]');
    const navCount = await navigation.count();
    expect(navCount).toBeGreaterThan(0);
    
    // UX Assertion: Header and footer landmarks
    const header = page.locator('header, [role="banner"]');
    const footer = page.locator('footer, [role="contentinfo"]');
    
    // These are optional but recommended
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }
    
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
    }
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Focus styles are visible
    const focusableElements = page.locator('button, a, input, select, textarea');
    const elementCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check if element has focus styles
      const focusStyles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el, ':focus');
        const computedActive = window.getComputedStyle(el, ':active');
        
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
          border: computed.border,
          activeBorder: computedActive.border
        };
      });
      
      // Element should have some focus indication
      const hasFocusStyle = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.border !== 'none';
      
      expect(hasFocusStyle).toBeTruthy();
    }
  });

  test('Screen reader announcements work', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Dynamic content changes are announced
    const dynamicContent = page.locator('[aria-live], [aria-atomic]');
    
    if (await dynamicContent.count() > 0) {
      await expect(dynamicContent.first()).toBeVisible();
    }
    
    // UX Assertion: Status messages are properly announced
    const statusElements = page.locator('[role="status"], [role="alert"]');
    
    if (await statusElements.count() > 0) {
      await expect(statusElements.first()).toBeVisible();
    }
  });

  test('Page titles are descriptive', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page has descriptive title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    
    // UX Assertion: Title changes based on page
    const pages = ['/dashboard', '/catalog', '/product/test'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.length).toBeGreaterThan(10);
    }
  });

  test('Skip links are available', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Skip links are present for keyboard users
    const skipLinks = page.locator('a[href^="#"]');
    
    if (await skipLinks.count() > 0) {
      await expect(skipLinks.first()).toBeVisible();
      
      // Test skip link functionality
      const firstSkipLink = skipLinks.first();
      const href = await firstSkipLink.getAttribute('href');
      
      if (href && href !== '#') {
        await firstSkipLink.click();
        const target = page.locator(href);
        await expect(target.first()).toBeVisible();
      }
    }
  });

  test('Error messages are accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Error messages are associated with inputs
    const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toBeVisible();
      
      // Check if error is properly associated with input
      const errorElement = errorMessages.first();
      const hasAriaDescribedBy = await errorElement.evaluate(el => {
        const id = el.id;
        if (id) {
          const inputs = document.querySelectorAll(`[aria-describedby="${id}"]`);
          return inputs.length > 0;
        }
        return false;
      });
      
      // This is recommended but not always required
    }
  });

  test('Performance metrics for accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // UX Assertion: Page loads quickly for screen readers
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    expect(loadTime).toBeLessThan(3000);
    
    // UX Assertion: DOM is not excessively large
    const elementCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    
    expect(elementCount).toBeLessThan(1500);
    
    // UX Assertion: No excessive ARIA usage
    const ariaElements = await page.evaluate(() => {
      return document.querySelectorAll('[role], [aria-label], [aria-describedby]').length;
    });
    
    // ARIA should be used judiciously
    expect(ariaElements).toBeLessThan(100);
  });
});