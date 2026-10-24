import { startGame } from './startGame';
import { expect, test, type Page } from '@playwright/test';

async function move(
  page: Page,
  key: string,
  axis: 'x' | 'y',
  target: number,
  positive: boolean,
  controlledClock = false,
) {
  await page.keyboard.down(key);
  const value = () => page.evaluate((axis) => window.__VALKYRIE__!.snapshot().player[axis], axis);
  if (controlledClock) {
    // Advance one frame at a time so slow CI cannot overshoot the firing lane.
    for (let frame = 0; frame < 600; frame++) {
      const position = await value();
      if (positive ? position >= target : position <= target) break;
      await page.clock.runFor(16);
    }
  }
  if (positive) await expect.poll(value, { intervals: [16] }).toBeGreaterThanOrEqual(target);
  else await expect.poll(value, { intervals: [16] }).toBeLessThanOrEqual(target);
  await page.keyboard.up(key);
}
test('keyboard route follows bottom, top, bottom gaps without crossing stone', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?test=1');
  await startGame(page);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('cloister'));
  expect(
    await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.pillars),
  ).toHaveLength(3);
  await move(page, 'd', 'x', 1260, true);
  await page.keyboard.down('d');
  await page.waitForTimeout(180);
  await page.keyboard.up('d');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x)).toBeLessThanOrEqual(
    1264,
  );
  await page.locator('#stage').screenshot({ path: info.outputPath('cloister-entry.png') });
  await move(page, 's', 'y', 450, true);
  await move(page, 'd', 'x', 1390, true);
  await move(page, 'w', 'y', 365, false);
  await move(page, 'd', 'x', 1490, true);
  await page.locator('#stage').screenshot({ path: info.outputPath('cloister-stone-fade.png') });
  await move(page, 'd', 'x', 1570, true);
  await page.locator('#stage').screenshot({ path: info.outputPath('cloister-upper-passage.png') });
  await move(page, 's', 'y', 450, true);
  await move(page, 'd', 'x', 1730, true);
  await page.locator('#stage').screenshot({ path: info.outputPath('cloister-exit.png') });
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp)).toBe(180);
  expect(errors).toEqual([]);
});

test('stone absorbs a real bow shot and an alternate approach opens a firing lane', async ({
  page,
}, info) => {
  const epoch = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: epoch });
  await page.goto('?test=1');
  await startGame(page);
  await page.clock.pauseAt(new Date(epoch.getTime() + 60000));
  await page.evaluate(() => window.__VALKYRIE__!.fixture('pillarCover'));
  const hp = await page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies[0].hp);
  await page.keyboard.press('i');
  await page.clock.runFor(600);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.weapon))
    .toBe('bow');
  await page.keyboard.press('j');
  await page.clock.runFor(100);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('shot');
  await page.clock.runFor(1600);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBeNull();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().arrows)).toBe(0);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies[0].hp)).toBe(hp);
  await page.locator('#stage').screenshot({ path: info.outputPath('pillar-blocked-shot.png') });
  await move(page, 's', 'y', 450, true, true);
  await move(page, 'd', 'x', 1370, true, true);
  await move(page, 'w', 'y', 370, false, true);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.y)).toBeGreaterThan(365);
  await page.keyboard.press('j');
  await page.clock.runFor(1600);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies[0].hp))
    .toBeLessThan(hp);
  await page.locator('#stage').screenshot({ path: info.outputPath('pillar-clear-shot.png') });
});

test('landscape touch shows the authored archer lane and cover layout', async ({
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
  await page.goto('?test=1');
  await startGame(page, 'gate', true);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('cloisterBattle'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies.length))
    .toBe(4);
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.locator('#stage').screenshot({ path: info.outputPath('cloister-mobile-battle.png') });
  await page.locator('#pause-button').tap();
  const time = await page.evaluate(() => window.__VALKYRIE__!.snapshot().time);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(time);
  expect(errors).toEqual([]);
  await context.close();
});
