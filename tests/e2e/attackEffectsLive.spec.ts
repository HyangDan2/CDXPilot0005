import { expect, test } from '@playwright/test';

test('live Eira combo, rising, spin, air and bow effects align with SD v3 poses in both facings', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();

  const capture = async (
    id: 'slash1' | 'slash2' | 'slash3' | 'slash4' | 'rising' | 'spin' | 'air' | 'shot',
    facing: 1 | -1,
    name: string,
  ) => {
    await page.evaluate(
      ({ attack, direction }) => window.__VALKYRIE__!.captureAttack(attack, direction),
      { attack: id, direction: facing },
    );
    const snapshot = await page.evaluate(() => window.__VALKYRIE__!.snapshot());
    expect(snapshot.mode).toBe('paused');
    expect(snapshot.player.attack).toBe(id);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    await page.locator('#overlay').evaluate((overlay) => {
      const element = overlay as HTMLElement;
      element.className = 'visual-capture-hidden';
      element.style.display = 'none';
    });
    await page.locator('canvas').screenshot({
      path: `artifacts/effects-review/eira-sd-v3-live-2026-10-24/${name}.png`,
    });
    await page.locator('#overlay').evaluate((overlay) => {
      const element = overlay as HTMLElement;
      element.style.display = '';
      element.className = 'menu-overlay';
    });
  };

  const attackCases = [
    ['slash1', 'combo-1'],
    ['slash2', 'combo-2'],
    ['slash3', 'combo-3'],
    ['slash4', 'combo-4'],
    ['rising', 'rising'],
    ['spin', 'spin'],
    ['air', 'air'],
    ['shot', 'bow'],
  ] as const;
  for (const [attack, name] of attackCases) {
    await capture(attack, 1, `${name}-right`);
    await capture(attack, -1, `${name}-left`);
  }
  expect(errors).toEqual([]);
});
