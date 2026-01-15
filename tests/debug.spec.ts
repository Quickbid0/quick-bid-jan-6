import { test, expect } from '@playwright/test';

test('Debug Environment', async ({ page }) => {
  // Inject demo session
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

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to /products...');
  await page.goto('/products');
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log('Page title:', title);
  
  const content = await page.content();
  if (content.includes('Product Catalog')) {
    console.log('Found "Product Catalog" text');
  } else {
    console.log('DID NOT find "Product Catalog" text');
  }

  if (content.includes('animate-spin')) {
    console.log('Found loading spinner');
  }

  if (content.includes('Login') || content.includes('Sign In')) {
    console.log('Found Login/Sign In text');
  }
  
  console.log('URL:', page.url());
});
