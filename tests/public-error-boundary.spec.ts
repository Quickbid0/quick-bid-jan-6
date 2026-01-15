import { test, expect } from '@playwright/test';

test('events page renders sections even if Supabase errors', async ({ page }) => {
  // Intercept Supabase REST calls and return server errors
  await page.route('**/rest/v1/auction_events*', async (route) => {
    await route.fulfill({ status: 500, json: { error: 'events fail' } });
  });
  await page.route('**/rest/v1/locations*', async (route) => {
    await route.fulfill({ status: 500, json: { error: 'locations fail' } });
  });
  await page.route('**/rest/v1/auctions*', async (route) => {
    await route.fulfill({ status: 500, json: { error: 'auctions fail' } });
  });

  await page.goto('/events');
  // After spinner disappears, page should render sections headings (no white screen)
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Events', level: 1 })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Live Now/i, level: 2 })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: /Upcoming Events/i, level: 2 })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: /QuickMela Events/i, level: 2 })).toBeVisible({ timeout: 10000 });
});
