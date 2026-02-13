import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3021',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://quickmela.netlify.app',
        storageState: 'playwright/.auth/admin.json'
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3021',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
