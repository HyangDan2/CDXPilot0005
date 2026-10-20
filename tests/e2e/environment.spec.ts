import { expect, test } from '@playwright/test';

test('keyboard movement reaches widened depth, barricade blocks then breaks and resets', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?test=1');
  await page.locator('#start-button').click();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('courtyard'));
  await page.keyboard.down('w');
  await expect.poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.y)).toBe(330);
  await page.keyboard.up('w');
  await page.locator('#stage').screenshot({ path: info.outputPath('courtyard-expanded.png') });
  await page.evaluate(() => window.__VALKYRIE__!.fixture('courtyard'));
  await page.keyboard.down('d');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x))
    .toBeGreaterThan(630);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x)).toBeLessThanOrEqual(
    634,
  );
  await page.keyboard.up('d');
  await page.locator('#stage').screenshot({ path: info.outputPath('barricade-intact.png') });
  for (let i = 0; i < 8; i++) {
    if (
      await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.barricades[0].hp === 0)
    )
      break;
    const hp = await page.evaluate(
      () => window.__VALKYRIE__!.snapshot().environment.barricades[0].hp,
    );
    await page.keyboard.press('j');
    await expect
      .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.barricades[0].hp))
      .toBeLessThan(hp);
    await expect
      .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
      .toBeNull();
  }
  expect(
    await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.barricades[0].hp),
  ).toBe(0);
  await page.keyboard.down('d');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x))
    .toBeGreaterThan(725);
  await page.keyboard.up('d');
  await page.locator('#stage').screenshot({ path: info.outputPath('barricade-destroyed.png') });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  expect(
    await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.barricades[0].hp),
  ).toBe(64);
  expect(errors).toEqual([]);
});

test('flame warning is harmless, pause freezes it, then active fire damages the player', async ({
  page,
}, info) => {
  await page.goto('?test=1');
  await page.locator('#start-button').click();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('flame'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.flames[0].phase))
    .toBe('warning');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp)).toBe(180);
  await page.keyboard.press('Escape');
  const before = await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment);
  await page.locator('#stage').screenshot({ path: info.outputPath('flame-warning-paused.png') });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment)).toEqual(before);
  await page.getByRole('button', { name: 'RESUME JOURNEY' }).click();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.flames[0].phase))
    .toBe('active');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp))
    .toBeLessThan(180);
  await page.locator('#stage').screenshot({ path: info.outputPath('flame-active.png') });
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.flames[0].phase))
    .toBe('rest');
});

test('landscape touch screen renders courtyard warning and pauses safely', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const epoch = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: epoch });
  await page.goto('?test=1');
  await page.locator('#start-button').tap();
  await page.clock.pauseAt(new Date(epoch.getTime() + 60000));
  await page.evaluate(() => window.__VALKYRIE__!.fixture('courtyard'));
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.clock.runFor(3000);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.flames[0].phase))
    .toBe('warning');
  await page
    .locator('#stage')
    .screenshot({ path: info.outputPath('courtyard-mobile-warning.png') });
  await page.locator('#pause-button').tap();
  const time = await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.time);
  await page.clock.runFor(200);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.time)).toBe(time);
  expect(errors).toEqual([]);
  await context.close();
});
