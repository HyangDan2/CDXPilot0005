import { startGame } from './startGame';
import { expect, test } from '@playwright/test';

test('title enters a fresh forge and pause/restart stay in the current stage', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('?test=1');
  await startGame(page, 'forge');
  await expect(page.locator('#chapter-title')).toContainText('THE ASHEN FORGE');
  await expect(page.locator('#wave-label')).toHaveText('AREA 01 / 05');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().stageId)).toBe('forge');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().cameraX)).toBeGreaterThanOrEqual(
    3600,
  );
  await page.locator('#stage').screenshot({ path: info.outputPath('forge-direct-entry.png') });
  await page.keyboard.press('Escape');
  const time = await page.evaluate(() => window.__VALKYRIE__!.snapshot().time);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(time);
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().stageId)).toBe('forge');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp)).toBe(180);
  expect(errors).toEqual([]);
});

test('gate and forge completion carry progress into the next stage and restart its checkpoint', async ({
  page,
}, info) => {
  await page.goto('?test=1');
  await startGame(page);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('gateReward'));
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'clear');
  await page.locator('#stage').screenshot({ path: info.outputPath('gate-to-forge.png') });
  await page.getByRole('button', { name: 'ENTER THE ASHEN FORGE' }).press('Enter');
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'playing');
  let snapshot = await page.evaluate(() => window.__VALKYRIE__!.snapshot());
  expect(snapshot.stageId).toBe('forge');
  expect(snapshot.score).toBe(1234);
  expect(snapshot.bestCombo).toBe(9);
  expect(snapshot.player.hp).toBe(180);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeClear'));
  await expect(page.getByText('The forge falls silent.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ENTER THE DROWNED MONASTERY' })).toBeVisible();
  await page.locator('#stage').screenshot({ path: info.outputPath('forge-complete.png') });
  await page.getByRole('button', { name: 'ENTER THE DROWNED MONASTERY' }).click();
  snapshot = await page.evaluate(() => window.__VALKYRIE__!.snapshot());
  expect(snapshot.stageId).toBe('monastery');
  expect(snapshot.wave).toBe(0);
  expect(snapshot.score).toBe(2234);
  expect(snapshot.player.hp).toBe(180);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  snapshot = await page.evaluate(() => window.__VALKYRIE__!.snapshot());
  expect(snapshot.stageId).toBe('monastery');
  expect(snapshot.wave).toBe(0);
  expect(snapshot.score).toBe(2234);
  expect(snapshot.player.hp).toBe(180);
});

test('all five forge areas render and the garden potion is collected through real movement', async ({
  page,
}, info) => {
  await page.goto('?test=1');
  await startGame(page, 'forge');
  for (const [fixture, section, targetX] of [
    ['forgeEntry', 0, 3600],
    ['forgeStockhouse', 1, 4010],
    ['forgeFurnace', 2, 4610],
    ['forgeGarden', 3, 5310],
    ['forgeBoss', 4, 6170],
  ] as const) {
    await page.evaluate((name) => window.__VALKYRIE__!.fixture(name), fixture);
    await expect
      .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().section))
      .toBe(section);
    await expect
      .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().cameraX))
      .toBeGreaterThan(targetX - 10);
    await page.locator('#stage').screenshot({ path: info.outputPath(`${fixture}.png`) });
  }
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeGarden'));
  await expect
    .poll(() =>
      page.evaluate(() => window.__VALKYRIE__!.snapshot().loot.some((l) => l.id === -20001)),
    )
    .toBe(true);
  await page.keyboard.down('w');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.y), { intervals: [16] })
    .toBeLessThanOrEqual(345);
  await page.keyboard.up('w');
  await page.keyboard.down('d');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp), { intervals: [16] })
    .toBe(180);
  await page.keyboard.up('d');
  expect(
    await page.evaluate(() => window.__VALKYRIE__!.snapshot().loot.some((l) => l.id === -20001)),
  ).toBe(false);
  await page.locator('#stage').screenshot({ path: info.outputPath('forge-garden-collected.png') });
});

test('boss slam warns before fire, pause freezes devices, and a charge breaks its barricade', async ({
  page,
}, info) => {
  await page.goto('?test=1');
  await startGame(page, 'forge');
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeSlam'));
  await expect(page.locator('#boss-name')).toHaveText('SKARN, THE FORGE WARDEN');
  const phase = () =>
    page.evaluate(
      () =>
        window.__VALKYRIE__!.snapshot().environment.flames.find((f) => f.id === 'warden-north')!
          .phase,
    );
  await expect.poll(phase, { intervals: [16] }).toBe('warning');
  await page.locator('#stage').screenshot({ path: info.outputPath('warden-slam-warning.png') });
  await page.keyboard.press('Escape');
  const time = await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.time);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().environment.time)).toBe(time);
  await page.getByRole('button', { name: 'RESUME JOURNEY' }).click();
  await expect.poll(phase, { intervals: [16] }).toBe('active');
  await page.locator('#stage').screenshot({ path: info.outputPath('warden-vent-active.png') });
  expect(
    await page.evaluate(
      () =>
        window.__VALKYRIE__!.snapshot().environment.flames.find((f) => f.id === 'warden-south')!
          .phase,
    ),
  ).toBe('rest');
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeCharge'));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__VALKYRIE__!.snapshot().environment.barricades.find((b) => b.id === -22)!.hp,
      ),
    )
    .toBe(0);
  await page
    .locator('#stage')
    .screenshot({ path: info.outputPath('warden-charge-destruction.png') });
});

test('landscape touch can enter the forge, see device warnings and restart after defeat', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('?test=1');
  await startGame(page, 'forge', true);
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('forgeSlam'));
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            window.__VALKYRIE__!.snapshot().environment.flames.find((f) => f.id === 'warden-north')!
              .phase,
        ),
      { intervals: [16] },
    )
    .toBe('warning');
  await page.locator('#stage').screenshot({ path: info.outputPath('forge-mobile-warning.png') });
  await page.evaluate(() => window.__VALKYRIE__!.fixture('over'));
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'over');
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).tap();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().stageId)).toBe('forge');
  expect(
    await page.evaluate(
      () => window.__VALKYRIE__!.snapshot().environment.barricades.find((b) => b.id === -22)!.hp,
    ),
  ).toBe(64);
  expect(errors).toEqual([]);
  await context.close();
});

test('production entry works without the developer harness', async ({ page }) => {
  await page.goto('./');
  expect(await page.evaluate(() => window.__VALKYRIE__)).toBeUndefined();
  await startGame(page, 'forge');
  await expect(page.locator('#chapter-title')).toHaveText('THE ASHEN FORGE / II');
  await expect(page.locator('#wave-label')).toHaveText('AREA 01 / 05');
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'playing');
});
