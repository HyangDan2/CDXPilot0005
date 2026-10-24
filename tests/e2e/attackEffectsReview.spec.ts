import { expect, test } from '@playwright/test';

test('attack effects follow current SD v3 Eira frames in both facings without covering sprites', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('attack-effects-review.html');
  await expect(page.locator('#status')).toContainText('SD v3');
  await expect(page.locator('#status')).not.toContainText('eira-v2');
  await page.locator('#play').click();

  const phases = [
    { mode: 'sword', seek: 14 / 60 / (31 / 60 + 0.55) },
    { mode: 'air', seek: 9 / 60 / (27 / 60 + 0.55) },
    { mode: 'bow', seek: 42.5 / 60 / (79 / 60 + 0.55) },
  ] as const;
  for (const { mode, seek } of phases) {
    await page.locator('#mode').selectOption(mode);
    for (const [facing, checked] of [
      ['right', false],
      ['left', true],
    ] as const) {
      await page.locator('#flip').setChecked(checked);
      await page.locator('#time').evaluate((input, value) => {
        (input as HTMLInputElement).value = String(value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, seek);
      await expect(page.locator('#phase')).toHaveText('공격 활성');
      const audit = await page.evaluate(() =>
        (
          window as unknown as Window & {
            effectReviewAudit: () => { protectedDifferences: number; effectPixels: number };
          }
        ).effectReviewAudit(),
      );
      expect(audit.effectPixels, `${mode}/${facing} should show the effect`).toBeGreaterThan(0);
      expect(
        audit.protectedDifferences,
        `${mode}/${facing} should preserve every SD v3 pixel`,
      ).toBe(0);
      await page.locator('#after').screenshot({
        path: info.outputPath(`${mode}-${facing}.png`),
      });
    }
  }
  await expect(page.locator('#trail-value')).toHaveText('0.12s');
  await page.locator('#contrast').evaluate((input) => {
    (input as HTMLInputElement).value = '1.3';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#contrast-value')).toHaveText('1.3');
  await page.locator('#trail').evaluate((input) => {
    (input as HTMLInputElement).value = '0.18';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#trail-value')).toHaveText('0.18s');
  await page.locator('#particles').evaluate((input) => {
    (input as HTMLInputElement).value = '5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#particles-value')).toHaveText('5');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: info.outputPath('mobile.png'), fullPage: true });
  expect(errors).toEqual([]);
});
