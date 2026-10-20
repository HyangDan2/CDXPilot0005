import { test, expect } from '@playwright/test';

const destination = 'https://hyangdan2.github.io/GameHub/';

for (const mode of ['title', 'paused', 'over', 'clear'] as const) {
  test(`${mode}: semantic hub navigation, keyboard isolation and Back`, async ({
    page,
    context,
  }, info) => {
    let navigations = 0;
    await page.route(destination, async (route) => {
      navigations++;
      await route.fulfill({ contentType: 'text/html', body: '<h1>Local hub substitute</h1>' });
    });
    await page.goto('?test=1&returnUrl=https://example.com');
    await expect(page.locator('#start-button')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('valkyrie.bgm', '25'));
    if (mode !== 'title') {
      await page.locator('#start-button').click();
      if (mode === 'paused') await page.keyboard.press('Escape');
      else await page.evaluate((fixture) => window.__VALKYRIE__!.fixture(fixture), mode);
    }
    await expect(page.locator('#stage')).toHaveAttribute('data-mode', mode);
    const link = page.getByRole('link', { name: '게임 허브로', exact: true });
    await expect(link).toHaveAttribute('href', destination);
    await expect(link).not.toHaveAttribute('target', '_blank');
    if (mode === 'paused') {
      await expect(page.locator('#hub-exit-note')).toContainText('저장되지 않습니다');
      await link.focus();
      const before = await page.evaluate(() => window.__VALKYRIE__!.snapshot());
      await page.keyboard.press('j');
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => window.__VALKYRIE__!.snapshot().time)).toBe(before.time);
      await page.locator('#resume-button').click();
      await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'playing');
      await expect(link).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(page.locator('#resume-button')).toBeFocused();
    }
    await link.focus();
    await page.locator('#stage').screenshot({ path: info.outputPath(`hub-${mode}.png`) });
    // Observe mode synchronously after the title's global Enter handler runs.
    await page.evaluate(() =>
      window.addEventListener('keydown', () => {
        sessionStorage.setItem('mode-at-exit', window.__VALKYRIE__!.snapshot().mode);
      }),
    );
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(destination);
    expect(navigations).toBe(1);
    expect(context.pages()).toHaveLength(1);
    await page.goBack();
    await expect(page.locator('#stage')).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem('mode-at-exit'))).toBe(mode);
    expect(await page.evaluate(() => localStorage.getItem('valkyrie.bgm'))).toBe('25');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(
      await page.evaluate(() =>
        window.__VALKYRIE__!.snapshot().audio.tracks.every((track) => track.paused),
      ),
    ).toBe(true);
  });
}

test('small landscape touch menus and rotation preserve paused exit', async ({ browser }, info) => {
  const context = await browser.newContext({
    viewport: { width: 667, height: 375 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  let navigations = 0;
  await page.route(destination, async (route) => {
    navigations++;
    await route.fulfill({ contentType: 'text/html', body: '<h1>Local hub substitute</h1>' });
  });
  await page.goto('?test=1');
  const link = page.getByRole('link', { name: '게임 허브로', exact: true });
  await expect(link).toBeInViewport();
  const bounds = (await link.boundingBox())!;
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({ path: info.outputPath('hub-mobile-title.png') });
  await page.locator('#start-button').tap();
  await page.locator('#pause-button').tap();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('#rotate-notice')).toBeVisible();
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'paused');
  await expect(link).toBeInViewport();
  await page.screenshot({ path: info.outputPath('hub-mobile-pause.png') });
  await link.tap();
  await expect(page).toHaveURL(destination);
  expect(navigations).toBe(1);
  await context.close();
});

test('settings returns keyboard control and page exit cancels result music transition', async ({
  page,
}) => {
  await page.goto('?test=1');
  await page.locator('#start-button').click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('canvas')).toBeFocused();
  await page.keyboard.press('j');
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .not.toBeNull();
  await page.evaluate(() => window.__VALKYRIE__!.fixture('clear'));
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'clear');
  // A fast exit can occur before the 320ms result-track transition completes.
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() =>
      window.__VALKYRIE__!.snapshot().audio.tracks.every((track) => track.paused),
    ),
  ).toBe(true);
});
