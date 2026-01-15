import { test, expect } from '@playwright/test';

// Basic smoke test to ensure the app boots and landing page renders
test('app loads landing page', async ({ page }) => {
  await page.goto('/');
  // Minimal check: navigation to root succeeds without throwing
  await page.waitForLoadState('load');
});
