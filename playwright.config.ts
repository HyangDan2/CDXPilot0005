import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1100 },
    baseURL: 'http://127.0.0.1:4173/valkyrie/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && node scripts/serve-preview.mjs',
    url: 'http://127.0.0.1:4173/valkyrie/',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
