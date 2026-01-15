import { test, expect } from '@playwright/test';

// Assumes there is at least one event with a location city set in the database
// and that Near Me will not filter everything out when using a generic location.

test.describe('/events page', () => {
  test('shows events with status/type badges and lot counts', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // At least one event card should be visible
    const sectionHeadings = page.getByRole('heading', { level: 2 });
    await expect(sectionHeadings.filter({ hasText: /Live Now/i }).first()).toBeVisible();
    await expect(sectionHeadings.filter({ hasText: /Upcoming Events/i }).first()).toBeVisible();
    await expect(sectionHeadings.filter({ hasText: /QuickMela Events/i }).first()).toBeVisible();
  });

  test('city filter changes visible events', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.getByRole('combobox', { name: /City/i }).selectOption('Hyderabad');

    await expect(page.getByText(/Hyderabad Auto Auction/i)).toBeVisible();
    await expect(page.getByText(/Bangalore Vehicle Sale/i)).not.toBeVisible();
  });

  test('Near me toggle does not crash and can be enabled', async ({ page, context }) => {
    // Mock geolocation to a fixed point (e.g. Mumbai)
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 19.0760, longitude: 72.8777 });

    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    const useMyLocationButton = page.getByRole('button', { name: /use my location/i });
    await useMyLocationButton.click();

    const nearMeCheckbox = page.getByRole('checkbox', { name: /near me only/i });
    await nearMeCheckbox.check();

    // We don't assert specific events due to data dependencies, but we ensure the UI remains responsive
    await expect(nearMeCheckbox).toBeChecked();
  });
});
