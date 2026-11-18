import { describe, expect, it } from 'vitest';
import { hudEdgeFor, hudScaleFor, touchInsetBoost, touchScaleFor } from '../../src/game/ui/layout';

const phone = { width: 693, height: 390, coarse: true };
const tablet = { width: 1180, height: 664, coarse: true };
const smallTablet = { width: 1024, height: 576, coarse: true };
const desktop = { width: 1200, height: 675, coarse: false };

describe('stage layout scales', () => {
  it('keeps the phone HUD slightly under desktop size', () => {
    expect(hudScaleFor(phone)).toBeCloseTo(0.85, 5);
    expect(hudScaleFor(tablet)).toBeCloseTo(1180 / 960, 5);
    expect(hudScaleFor(smallTablet)).toBeCloseTo(1.15, 5);
    expect(hudScaleFor(desktop)).toBeCloseTo(1, 5);
  });

  it('shrinks the HUD instead of letting it fill a narrow desktop stage', () => {
    expect(hudScaleFor({ width: 720, height: 405, coarse: false })).toBeCloseTo(0.72, 5);
    expect(hudScaleFor({ width: 1000, height: 563, coarse: false })).toBeCloseTo(1, 5);
  });

  it('scales touch buttons up on a tablet and leaves the phone near 1', () => {
    expect(touchScaleFor(phone)).toBeCloseTo(1, 5);
    expect(touchScaleFor(tablet)).toBeCloseTo(1180 / 960, 5);
    expect(touchScaleFor(smallTablet)).toBeCloseTo(1.15, 5);
    expect(touchScaleFor({ width: 1600, height: 900, coarse: true })).toBeCloseTo(1.38, 5);
    expect(touchScaleFor(desktop)).toBeCloseTo(1, 5);
  });

  it('caps the automatic scale so the stick and the action cluster never meet', () => {
    const tiny = { width: 340, height: 191, coarse: true };
    const auto = touchScaleFor(tiny, 1, 20);
    // usable width = 340 - 40 - 28 for two clusters of 320 layout px scaled by auto
    expect(auto).toBeCloseTo(272 / 320, 5);
    expect(320 * auto).toBeLessThanOrEqual(tiny.width - 40);
  });

  it('counts the player scale when reserving room for both clusters', () => {
    const auto = touchScaleFor(tablet, 1.2, 20);
    expect(auto * 1.2).toBeLessThanOrEqual((tablet.width - 40 - 28) / 320);
  });

  it('grows edge gaps with the surface but stays bounded', () => {
    expect(hudEdgeFor(390)).toBeCloseTo(10, 5);
    expect(hudEdgeFor(1180)).toBeCloseTo(21.24, 5);
    expect(hudEdgeFor(1600)).toBeCloseTo(28, 5);
    expect(touchInsetBoost(693)).toBeCloseTo(1, 5);
    expect(touchInsetBoost(1180)).toBeLessThanOrEqual(1.15);
  });
});
