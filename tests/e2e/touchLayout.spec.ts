import { test, expect } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { startGame } from './startGame';

/**
 * The play surface, not the viewport, decides how big the HUD and touch
 * controls are: a tablet gets larger controls than a phone, and nothing
 * overlaps on either surface.
 */
const readLayout = () => {
  const stage = document.querySelector('#stage')!;
  const style = getComputedStyle(stage);
  const items: Record<
    string,
    { left: number; top: number; right: number; bottom: number; width: number }
  > = {};
  for (const selector of [
    '.player-hud',
    '.wave-hud',
    '#pause-button',
    '#touch-stick',
    '.touch-actions',
    '.touch-special',
    '#travel-hint',
  ]) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el || el.offsetWidth === 0) continue;
    const r = el.getBoundingClientRect();
    items[selector] = {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
    };
  }
  const overlaps: string[] = [];
  const entries = Object.entries(items);
  for (let i = 0; i < entries.length; i++)
    for (let j = i + 1; j < entries.length; j++) {
      const [aName, a] = entries[i];
      const [bName, b] = entries[j];
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 1 && h > 1) overlaps.push(`${aName} x ${bName}`);
    }
  return {
    hudScale: Number.parseFloat(style.getPropertyValue('--hud-scale')),
    touchScale: Number.parseFloat(style.getPropertyValue('--touch-scale-total')),
    items,
    overlaps,
  };
};

type Point = { x: number; y: number; id: number };
type Touch = (
  type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel',
  points: Point[],
) => Promise<void>;

async function open(
  browser: Browser,
  viewport: { width: number; height: number },
  userScale = 0,
): Promise<{ page: Page; touch: Touch; errors: string[]; close: () => Promise<void> }> {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  if (userScale) {
    await page.addInitScript((value) => {
      localStorage.setItem('valkyrie.touch-size', String(value));
    }, userScale);
  }
  await page.goto('?test=1');
  await startGame(page, 'gate', true);
  await expect(page.locator('#touch-controls')).toBeVisible();
  const session = await context.newCDPSession(page);
  const touch: Touch = async (type, points) => {
    await session.send('Input.dispatchTouchEvent', { type, touchPoints: points });
  };
  return { page, touch, errors, close: () => context.close() };
}

test('tablet landscape gets larger HUD and touch controls without overlaps', async ({
  browser,
}) => {
  const { page, touch, errors, close } = await open(browser, { width: 1180, height: 820 });
  const layout = await page.evaluate(readLayout);
  expect(layout.hudScale).toBeGreaterThanOrEqual(1.15);
  expect(layout.hudScale).toBeLessThanOrEqual(1.35);
  expect(layout.touchScale).toBeGreaterThan(1.15);
  expect(layout.items['#touch-stick'].width).toBeGreaterThan(140);
  expect(layout.items['.touch-actions'].width).toBeGreaterThan(210);
  expect(layout.overlaps).toEqual([]);
  // Drop into a calm encounter so a stray enemy hit cannot interrupt the drag.
  await page.evaluate(() => window.__VALKYRIE__?.fixture('cloister'));
  await page.waitForTimeout(120);
  // The stick is transform-scaled; a full-right drag must still normalise to 1
  // and move the knob by 60% of the layout radius, not of the rendered one.
  const stick = (await page.locator('#touch-stick').boundingBox())!;
  const point = { x: stick.x + stick.width * 0.95, y: stick.y + stick.height / 2, id: 1 };
  const before = await page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x);
  await touch('touchStart', [point]);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.state))
    .toBe('Run');
  const knob = await page.evaluate(
    () => getComputedStyle(document.querySelector('#touch-stick span')!).transform,
  );
  const translate = Math.abs(Number.parseFloat(knob.split(',')[4] ?? '0'));
  expect(translate).toBeGreaterThan(30);
  expect(translate).toBeLessThan(42);
  await touch('touchEnd', []);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.x))
    .toBeGreaterThan(before + 5);
  const attack = (await page.locator('[data-action=attack]').boundingBox())!;
  const center = { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2, id: 3 };
  await touch('touchStart', [center]);
  await touch('touchMove', [{ ...center, y: center.y - attack.height * 0.8 }]);
  await touch('touchEnd', []);
  await expect
    .poll(() => page.evaluate(() => window.__VALKYRIE__!.snapshot().player.attack))
    .toBe('rising');
  expect(errors).toEqual([]);
  await close();
});

test('phone landscape keeps the play surface clear and honours the player scale', async ({
  browser,
}) => {
  const phone = await open(browser, { width: 844, height: 390 });
  const layout = await phone.page.evaluate(readLayout);
  expect(layout.hudScale).toBeCloseTo(0.85, 2);
  expect(layout.touchScale).toBeCloseTo(1, 1);
  expect(layout.overlaps).toEqual([]);
  expect(layout.items['#travel-hint'].bottom).toBeLessThan(layout.items['.touch-actions'].top);
  expect(phone.errors).toEqual([]);
  await phone.close();

  const bigger = await open(browser, { width: 844, height: 390 }, 120);
  const scaled = await bigger.page.evaluate(readLayout);
  expect(scaled.touchScale).toBeGreaterThan(1.15);
  expect(scaled.items['#touch-stick'].width).toBeGreaterThan(layout.items['#touch-stick'].width);
  expect(scaled.overlaps).toEqual([]);
  await bigger.close();
});
