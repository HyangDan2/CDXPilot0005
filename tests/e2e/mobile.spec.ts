import { test, expect } from '@playwright/test';
test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
test('landscape touch movement, multitouch guard, gestures, settings and rotation', async ({
  page,
  context,
}, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).tap();
  await expect(page.locator('#touch-controls')).toBeVisible();
  const session = await context.newCDPSession(page);
  const stick = (await page.locator('#touch-stick').boundingBox())!;
  const guard = (await page.locator('[data-action=guard]').boundingBox())!;
  const p1 = { x: stick.x + stick.width * 0.75, y: stick.y + stick.height / 2, id: 1 };
  const p2 = { x: guard.x + guard.width / 2, y: guard.y + guard.height / 2, id: 2 };
  const touch = async (
    type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel',
    touchPoints: { x: number; y: number; id: number }[],
  ) => session.send('Input.dispatchTouchEvent', { type, touchPoints });
  const before = await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x);
  await touch('touchStart', [p1]);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Walk');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x))
    .toBeGreaterThan(before + 10);
  await touch('touchStart', [p1, p2]);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Guard');
  await touch('touchEnd', []);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  const attackBox = (await page.locator('[data-action=attack]').boundingBox())!;
  await touch('touchStart', [{ x: attackBox.x + 30, y: attackBox.y + 30, id: 4 }]);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).toBeNull();
  await touch('touchCancel', []);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).toBeNull();
  // A real two-finger pinch on the playfield must not zoom the viewport.
  await touch('touchStart', [
    { x: 370, y: 175, id: 5 },
    { x: 450, y: 175, id: 6 },
  ]);
  await touch('touchMove', [
    { x: 330, y: 175, id: 5 },
    { x: 490, y: 175, id: 6 },
  ]);
  await touch('touchEnd', []);
  expect(await page.evaluate(() => window.visualViewport?.scale)).toBe(1);
  await page.locator('#stage').screenshot({ path: info.outputPath('mobile-landscape.png') });
  await page.locator('[data-action=switch]').tap();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.weapon))
    .toBe('bow');
  await page.locator('[data-action=attack]').tap();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('shot');
  await page.waitForTimeout(1400);
  await page.locator('[data-action=switch]').tap();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.weapon))
    .toBe('sword');
  const attack = (await page.locator('[data-action=attack]').boundingBox())!;
  const p3 = { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 3 };
  await touch('touchStart', [p3]);
  await touch('touchMove', [{ ...p3, y: p3.y - 55 }]);
  await touch('touchEnd', []);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('rising');
  await page.waitForTimeout(1000);
  await touch('touchStart', [p1]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#rotate-notice')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().mode)).toBe('paused');
  const time = await page.evaluate(() => window.__VALKYRIE__!.snapshot().time);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(time);
  await touch('touchCancel', []);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'RESUME JOURNEY' }).tap();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  await page.getByRole('button', { name: 'Settings', exact: true }).tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#touch-size').fill('110');
  await page.getByRole('button', { name: 'Close field guide' }).tap();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().mode))
    .toBe('playing');
  expect(await page.locator('#stage').evaluate((el) => getComputedStyle(el).touchAction)).toBe(
    'none',
  );
  expect(await page.evaluate(() => window.visualViewport?.scale)).toBe(1);
});
