import { it, expect } from 'vitest';
import { DoubleTap } from '../../src/game/input/doubleTap';
it('requires a released, second physical press within 250ms', () => {
  const t = new DoubleTap();
  t.press('KeyD', 0);
  expect(t.active).toBe(false);
  t.press('KeyD', 100, true);
  expect(t.active).toBe(false);
  t.release('KeyD');
  t.press('KeyD', 240);
  expect(t.active).toBe(true);
  t.release('KeyD');
  expect(t.active).toBe(false);
});
it('handles all directions and aliases without treating concurrent aliases as taps', () => {
  for (const [a, b] of [
    ['KeyD', 'ArrowRight'],
    ['KeyA', 'ArrowLeft'],
    ['KeyW', 'ArrowUp'],
    ['KeyS', 'ArrowDown'],
  ]) {
    const t = new DoubleTap();
    t.press(a, 0);
    t.press(b, 10);
    expect(t.active).toBe(false);
    t.release(a);
    t.release(b);
    t.press(b, 150);
    expect(t.active).toBe(true);
  }
});
it('rejects slow taps, opposite direction, Shift and interruptions', () => {
  const t = new DoubleTap();
  t.press('KeyD', 0);
  t.release('KeyD');
  t.press('KeyD', 251);
  expect(t.active).toBe(false);
  t.release('KeyD');
  t.press('KeyD', 400);
  expect(t.active).toBe(true);
  t.press('KeyA', 450);
  expect(t.active).toBe(false);
  t.clear();
  t.press('ShiftLeft', 500);
  expect(t.active).toBe(false);
  t.press('KeyW', 600);
  t.release('KeyW');
  t.press('KeyW', 700);
  t.cancel();
  expect(t.active).toBe(false);
  t.press('KeyW', 710, true);
  expect(t.active).toBe(false);
});

it('clears a pending first tap on blur or pause', () => {
  const t = new DoubleTap();
  t.press('KeyA', 0);
  t.release('KeyA');
  t.clear();
  t.press('KeyA', 100);
  expect(t.active).toBe(false);
});
