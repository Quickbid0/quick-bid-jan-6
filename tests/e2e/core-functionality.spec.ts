// QUICKMELA CORE FUNCTIONALITY TESTS
// ==================================

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://quickmela.netlify.app';
const API_BASE_URL = 'http://localhost:4011/api';

// Simple test that validates actual frontend functionality
test.describe('Core Functionality Tests', () => {

  test('Frontend loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check that page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('Basic login flow works', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Check login form exists
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login")');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Try login with test credentials
    await emailInput.fill('arjun@quickmela.com');
    await passwordInput.fill('BuyerPass123!');
    await submitButton.click();

    // Should redirect or show some response
    await page.waitForTimeout(2000);
  });

  test('API health check works', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('status', 'ok');
  });

  test('Products API returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/products`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
  });

});
