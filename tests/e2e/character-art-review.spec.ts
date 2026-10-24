import { expect, test } from '@playwright/test';

test('dedicated flyer and matching bow-run sheets load in the art review', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('character-art-review.html');
  await expect(page.getByRole('heading', { name: 'Character art review' })).toBeVisible();
  await expect(page.locator('#asset-status')).toHaveText('All four packed sheets loaded.');
  await expect(page.locator('#flyer-phases canvas')).toHaveCount(8);
  await page.waitForTimeout(350);
  await page.screenshot({ path: info.outputPath('character-art-review.png'), fullPage: true });
  expect(errors).toEqual([]);
});
