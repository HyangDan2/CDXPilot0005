import { startGame } from './startGame';
import { expect, test } from '@playwright/test';

test('gate and forge flow into the five-area Drowned Monastery and final clear', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?test=1');
  await startGame(page);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('gateReward'));
  await page.getByRole('button', { name: 'ENTER THE ASHEN FORGE' }).click();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().stageId)).toBe('forge');
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeClear'));
  await expect(page.getByRole('button', { name: 'ENTER THE DROWNED MONASTERY' })).toBeVisible();
  await page.getByRole('button', { name: 'ENTER THE DROWNED MONASTERY' }).click();
  await expect(page.locator('#chapter-title')).toContainText('THE DROWNED MONASTERY');
  await expect(page.locator('#wave-label')).toHaveText('AREA 01 / 05');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x)).toBe(7380);
  await page.locator('#stage').screenshot({ path: info.outputPath('monastery-entry.png') });

  for (const [fixture, area] of [
    ['monasteryCloister', 'AREA 02 / 05'],
    ['monasteryFloodgate', 'AREA 03 / 05'],
    ['monasteryChapel', 'AREA 04 / 05'],
    ['monasteryBoss', 'AREA 05 / 05'],
  ] as const) {
    await page.evaluate((name) => window.__VALKYRIE__!.fixture(name), fixture);
    await expect(page.locator('#wave-label')).toHaveText(area);
    await page.locator('#stage').screenshot({ path: info.outputPath(`${fixture}.png`) });
  }
  await page.evaluate(() => window.__VALKYRIE__!.fixture('monasteryPhaseTwo'));
  await page
    .locator('#stage')
    .screenshot({ path: info.outputPath('monastery-boss-phase-two.png') });
  await page.evaluate(() => window.__VALKYRIE__!.fixture('monasteryClear'));
  await expect(page.getByText('The drowned monastery is free.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the flyer dives once at a time, the mage launches a guided bolt, and slams shift the sluice', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('?test=1');
  await startGame(page);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('monasteryFlyers'));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__VALKYRIE__!.snapshot().enemies.filter((enemy) => enemy.attack === 'dive').length,
      ),
    )
    .toBe(1);
  await page.locator('#stage').screenshot({ path: info.outputPath('flyer-dive-telegraph.png') });

  await page.evaluate(() => window.__VALKYRIE__!.fixture('monasteryMage'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies[0]?.attack))
    .toBe('spell');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().magic.length), {
      timeout: 15000,
    })
    .toBe(1);
  await page.locator('#stage').screenshot({ path: info.outputPath('mage-guided-bolt.png') });

  await page.evaluate(() => window.__VALKYRIE__!.fixture('monasterySluice'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.waterBank))
    .toBe(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('#stage').screenshot({ path: info.outputPath('monastery-mobile-sluice.png') });
  expect(errors).toEqual([]);
});
