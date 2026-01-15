import { test, expect } from '@playwright/test';

test.describe('Form Flow Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
    });
  });

  test('Login form validation and UX', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="login-form"], form').first()).toBeVisible();
    
    const submitButton = page.locator('button[type="submit"], [data-testid="login-button"]');
    await expect(submitButton).toBeVisible();
    
    await submitButton.click();
    
    const errorMessages = page.locator('[data-testid="error"], [role="alert"], .error-message');
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toBeVisible();
      
      const errorText = await errorMessages.first().textContent();
      expect(errorText?.length).toBeGreaterThan(0);
      expect(errorText?.length).toBeLessThan(200);
      
      const errorTextLower = errorText?.toLowerCase() || '';
      const hasFieldHint = errorTextLower.includes('email') ||
                         errorTextLower.includes('password') ||
                         errorTextLower.includes('required');
      expect(hasFieldHint).toBeTruthy();
    }
    
    const emailInput = page.locator('input[name="email"], [data-testid="email-input"]');
    const passwordInput = page.locator('input[name="password"], [data-testid="password-input"]');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      
      const emailError = page.locator('[data-testid="email-error"], .email-error');
      const passwordError = page.locator('[data-testid="password-error"], .password-error');
      
      if (await emailError.isVisible()) {
        await expect(emailError).not.toBeVisible({ timeout: 3000 });
      }
      
      if (await passwordError.isVisible()) {
        await expect(passwordError).not.toBeVisible({ timeout: 3000 });
      }
      
      await submitButton.click();
      
      const loadingIndicator = page.locator('[data-testid="loading"], .loading');
      if (await loadingIndicator.isVisible()) {
        await expect(loadingIndicator).toBeVisible();
        await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('Form accessibility and keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    const form = page.locator('form, [data-testid="login-form"]');
    if (await form.isVisible()) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      const focusableElements = form.locator('input, button, select, textarea');
      const focusableCount = await focusableElements.count();
      
      for (let i = 0; i < Math.min(focusableCount, 5); i++) {
        await page.keyboard.press('Tab');
        const currentFocused = page.locator(':focus');
        await expect(currentFocused).toBeVisible();
      }
      
      const submitButton = form.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.focus();
        await page.keyboard.press('Enter');
        
        const hasFeedback = await page.locator('[data-testid="loading"], [data-testid="error"], [data-testid="success"]').count() > 0;
        expect(hasFeedback).toBeTruthy();
      }
    }
    
    const formElement = page.locator('form');
    if (await formElement.isVisible()) {
      const hasAriaLabel = await formElement.evaluate(el => 
        el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
      );
      expect(hasAriaLabel).toBeTruthy();
    }
    
    await page.goto('/login');
    const submitButton2 = page.locator('button[type="submit"]');
    await submitButton2.click();
    
    const errorElements = page.locator('[role="alert"], [data-testid="error"]');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toHaveAttribute('role', 'alert');
    }
  });
});
