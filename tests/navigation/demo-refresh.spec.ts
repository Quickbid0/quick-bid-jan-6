import { test, expect } from '@playwright/test';

const personas = [
  { name: 'buyer', redirect: '/buyer/dashboard' },
  { name: 'seller', redirect: '/seller/dashboard' },
  { name: 'company', redirect: '/company/dashboard' },
  { name: 'admin', redirect: '/admin' },
  { name: 'superadmin', redirect: '/super-admin' },
  { name: 'sales', redirect: '/sales/dashboard' },
];

for (const p of personas) {
  test(`Demo ${p.name} survives refresh without login redirect`, async ({ page }) => {
    await page.goto(`/demo?user=demo-${p.name}&redirect=${p.redirect}`);
    await expect(page).toHaveURL(new RegExp(p.redirect));

    await page.reload();

    await expect(page).not.toHaveURL(/\/login|\/sales\/login/);
    await expect(page).toHaveURL(new RegExp(p.redirect));
  });
}
