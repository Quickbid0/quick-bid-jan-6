import { test, expect } from '@playwright/test';

test('Each product opens its own PDP', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('test-mock-catalog', 'true');
  });
  await page.goto('/catalog');
  await page.waitForLoadState('networkidle');

  const cards = page.locator('[data-testid="product-card"]');
  await expect(cards.nth(0)).toBeVisible();
  await expect(cards.nth(1)).toBeVisible();

  await cards.nth(0).locator('[data-testid="auction-card-image"]').click();
  await page.waitForLoadState('networkidle');
  const url1 = page.url();
  expect(url1).toMatch(/\/product\//);

  await page.goBack();
  await page.waitForLoadState('networkidle');

  await cards.nth(1).locator('[data-testid="auction-card-image"]').click();
  await page.waitForLoadState('networkidle');
  const url2 = page.url();
  expect(url2).toMatch(/\/product\//);

  expect(url1).not.toEqual(url2);
});
