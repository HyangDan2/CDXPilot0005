import { defineConfig, devices } from '@playwright/test';
const port = Number(process.env.PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}/valkyrie/`;
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1100 },
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && node scripts/serve-preview.mjs',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
