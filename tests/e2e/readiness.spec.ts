import { test, expect } from '@playwright/test';
test('roll meter recharges and boss support is telegraphed', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  const meter = page.getByRole('progressbar', { name: 'Dodge recharge' });
  await expect(meter).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('#roll-label')).toHaveText('READY');
  await page.keyboard.press('l');
  await expect
    .poll(async () => Number(await meter.getAttribute('aria-valuenow')), { intervals: [10] })
    .toBeLessThan(30);
  await page.locator('#stage').screenshot({ path: info.outputPath('roll-charging.png') });
  await expect.poll(async () => Number(await meter.getAttribute('aria-valuenow'))).toBe(100);
  await expect(page.locator('#roll-label')).toHaveText('READY');
  await page.keyboard.press('Space');
  await expect(page.locator('#roll-label')).toHaveText('WAIT');
  await page.evaluate(() => window.__VALKYRIE__!.fixture('bossSupport'));
  await expect(page.locator('#reinforcement-warning')).toBeVisible();
  await page.locator('#stage').screenshot({ path: info.outputPath('boss-support-warning.png') });
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies.length))
    .toBe(3);
});
