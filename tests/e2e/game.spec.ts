import { test, expect } from '@playwright/test';
test('title, real keyboard combat, pause, restart and responsive viewport', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('?test=1');
  await expect(page.getByRole('button', { name: 'BEGIN YOUR OATH' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('01-title.png'), fullPage: true });
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().mode))
    .toBe('playing');
  const x = await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x);
  await page.keyboard.down('d');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x))
    .toBeGreaterThan(x + 60);
  await page.keyboard.up('d');
  await page.keyboard.press('Space');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.z))
    .toBeGreaterThan(10);
  await expect.poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.z)).toBe(0);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('combat'));
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().enemies[0]?.hp))
    .toBeLessThan(62);
  await page.locator('#stage').screenshot({ path: info.outputPath('02-gameplay.png') });
  await page.keyboard.press('F1');
  await page.locator('#stage').screenshot({ path: info.outputPath('02-combat-debug.png') });
  await page.keyboard.press('F1');
  await page.keyboard.press('Escape');
  await expect(page.getByText('A moment of stillness.')).toBeVisible();
  const t = await page.evaluate(() => window.__VALKYRIE__!.snapshot().time);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(t);
  await page.locator('#stage').screenshot({ path: info.outputPath('03-paused.png') });
  await page.getByRole('button', { name: 'RESUME JOURNEY' }).click();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().time))
    .toBeGreaterThan(t);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp)).toBe(180);
  await page.setViewportSize({ width: 800, height: 900 });
  const box = await page.locator('canvas').boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
  expect(box!.width).toBeLessThanOrEqual(800);
  expect(errors).toEqual([]);
});
test('boss, game over and clear screens via explicit test fixtures', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('boss'));
  await expect(page.locator('#boss-hud')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().cameraX))
    .toBeGreaterThan(2450);
  await page.locator('#stage').screenshot({ path: info.outputPath('04-boss.png') });
  await page.evaluate(() => window.__VALKYRIE__!.fixture('over'));
  await expect(page.getByText('Even light can fall.')).toBeVisible();
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('clear'));
  await expect(page.getByText('The oath endures.')).toBeVisible();
  await page.locator('#stage').screenshot({ path: info.outputPath('05-clear.png') });
  await page.getByRole('button', { name: 'PLAY AGAIN' }).click();
  await expect(page.locator('#hud')).toBeVisible();
});
test('missing PNG uses playable fallbacks', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/assets/**/*.png', (r) => r.abort());
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().time))
    .toBeGreaterThan(0.2);
  expect(errors).toEqual([]);
});
test('production URL has no test harness and loads relative assets', async ({ page }) => {
  const failures: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(r.url());
  });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'BEGIN YOUR OATH' })).toBeVisible();
  expect(await page.evaluate(() => window.__VALKYRIE__)).toBeUndefined();
  expect(failures).toEqual([]);
  await page.getByRole('button', { name: 'FIELD GUIDE' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close field guide' }).click();
});

test('double-tap run, release, attack interruption and Shift removal', async ({ page }) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.keyboard.press('d');
  await page.keyboard.down('d');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Run');
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Attack');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Walk');
  await page.keyboard.up('d');
  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowLeft');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Walk');
  await page.keyboard.up('Shift');
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.down('ArrowUp');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Run');
  await page.keyboard.up('ArrowUp');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
});

test('art workbench shows each detailed clip without runtime errors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('art-review.html');
  await expect(page.locator('[data-clip]')).toHaveCount(11);
  for (const clip of ['run', 'rising', 'reaction']) {
    await page.locator(`[data-clip="${clip}"]`).click();
    await expect(page.locator('#frame')).toContainText(clip);
    await page.screenshot({ path: info.outputPath(`art-${clip}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('SD review plays integrated weapon poses for the whole cast', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('sd-review.html');
  await expect(page.locator('#status')).toContainText('player');
  await page.locator('#clip').selectOption('guard');
  await expect(page.locator('#status')).toContainText('guard');
  await page.getByRole('button', { name: '일시정지' }).click();
  await page.locator('#scrub').fill('2');
  await expect(page.locator('#status')).toContainText('smooth-defense:2');
  await page.screenshot({ path: info.outputPath('sd-guard-player.png'), fullPage: true });
  await page.getByRole('button', { name: '좌우 반전' }).click();
  await page.screenshot({ path: info.outputPath('sd-guard-player-left.png'), fullPage: true });
  for (const kind of ['grunt', 'rusher', 'guard', 'boss']) {
    await page.locator('#actor').selectOption(kind);
    await page.locator('#clip').selectOption(kind === 'boss' ? 'slam' : 'attack');
    await page.locator('#scrub').fill('1');
    await expect(page.locator('#status')).toContainText(kind);
    await page.screenshot({ path: info.outputPath(`sd-${kind}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('K guard, directional rising, strict spin and BGM lifecycle', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__VALKYRIE__!.snapshot().audio.tracks.filter((a) => !a.paused).length,
      ),
    )
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks[0].ready))
    .toBeGreaterThanOrEqual(2);
  await page.keyboard.down('k');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Guard');
  await page.keyboard.press('j');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).toBeNull();
  await page.keyboard.up('k');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  await page.keyboard.press('l');
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).toBeNull();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  await page.keyboard.press('s');
  await page.keyboard.press('d');
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('rising');
  await page.keyboard.down('k');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).not.toBe('spin');
  await page.keyboard.up('k');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  // Deliver both DOM edges in one browser task: transport latency must not widen a 40ms chord.
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK' }));
  });
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('spin');
  await page.locator('#stage').screenshot({ path: info.outputPath('twohand-spin.png') });
  await page.keyboard.up('j');
  await page.keyboard.up('k');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('slider', { name: 'BGM Volume', exact: true }).fill('20');
  await page.getByRole('button', { name: 'Close field guide' }).click();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks[0].volume)).toBe(
    0.2,
  );
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks.every((a) => a.paused)),
  ).toBe(true);
  await page.getByRole('button', { name: 'RESUME JOURNEY' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__VALKYRIE__!.snapshot().audio.tracks.filter((a) => !a.paused).length,
      ),
    )
    .toBe(1);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('boss'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.boss))
    .toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks.length)).toBe(4);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__VALKYRIE__!.snapshot().audio.tracks.filter((a) => !a.paused).length,
      ),
    )
    .toBe(1);
});

test('four-strike keyboard chain and social assets', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.keyboard.press('j');
  for (const id of ['slash1', 'slash2', 'slash3', 'slash4']) {
    await expect
      .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
      .toBe(id);
    if (id !== 'slash4') {
      const ready = id === 'slash3' ? 0.28 : 0.26;
      await expect
        .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attackElapsed), {
          intervals: [10],
        })
        .toBeGreaterThanOrEqual(ready);
      await page.keyboard.press('j');
    }
  }
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBeNull();
  await page.locator('#stage').screenshot({ path: info.outputPath('combo-complete.png') });
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://hyangdan2.github.io/CDXPilot0005/social/valkyrie.jpg',
  );
  for (const path of [
    'favicon-16.png',
    'favicon-32.png',
    'favicon.ico',
    'apple-touch-icon.png',
    'social/valkyrie.jpg',
  ]) {
    const response = await page.request.get(path);
    expect(response.ok()).toBeTruthy();
  }
});

test('bow draw, guard cancel, roll, settings and result music', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.keyboard.press('i');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.weapon))
    .toBe('bow');
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('shot');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().arrows)).toBe(0);
  await page.locator('#stage').screenshot({ path: info.outputPath('bow-draw.png') });
  await page.keyboard.down('k');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Guard');
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack)).toBeNull();
  await page.keyboard.up('k');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  await page.keyboard.press('l');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Roll');
  await page.waitForTimeout(160);
  await page.locator('#stage').screenshot({ path: info.outputPath('bow-roll.png') });
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Idle');
  await page.keyboard.press('j');
  await expect.poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().arrows)).toBe(1);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const t = await page.evaluate(() => window.__VALKYRIE__!.snapshot().time);
  await page.getByRole('slider', { name: 'BGM Volume', exact: true }).fill('25');
  await page.keyboard.press('i');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(t);
  await page.screenshot({ path: info.outputPath('settings.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().mode))
    .toBe('playing');
  expect(await page.evaluate(() => localStorage.getItem('valkyrie.bgm'))).toBe('25');
  await page.evaluate(() => window.__VALKYRIE__!.fixture('over'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks[3].paused))
    .toBe(false);
  await page.getByRole('button', { name: 'RESTART JOURNEY' }).click();
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks[0].volume))
    .toBe(0.25);
  await page.evaluate(() => window.__VALKYRIE__!.fixture('clear'));
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().audio.tracks[2].paused))
    .toBe(false);
});

test('archer telegraph and real projectile damage', async ({ page }, info) => {
  await page.goto('?test=1');
  await page.getByRole('button', { name: 'BEGIN YOUR OATH' }).click();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('archer'));
  await page.waitForTimeout(350);
  await page.locator('#stage').screenshot({ path: info.outputPath('archer-tell.png') });
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.hp))
    .toBeLessThan(180);
});
