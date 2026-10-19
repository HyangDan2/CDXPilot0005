import { describe, it, expect } from 'vitest';
import { CombatInput } from '../../src/game/input/combatInput';
import { createActor } from '../../src/game/entities/actor';
import { startAttack, applyHit, AttackBuffer } from '../../src/game/combat/combat';
import { rollLoot, collectLoot } from '../../src/game/entities/loot';
import { seededRandom } from '../../src/utils/random';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';
const free = { free: true, facing: 1 as const },
  busy = { free: false, facing: 1 as const };
describe('strict deliberate chords', () => {
  it.each([0, 20, 40])('accepts fresh J+K at %d ms', (delay) => {
    const c = new CombatInput();
    c.press('KeyJ', 0, free);
    c.press('KeyK', delay, free);
    expect(c.read(delay, free).commands).toEqual(['spin']);
  });
  it('rejects 41ms, held keys, repeats and requires both releases', () => {
    const c = new CombatInput();
    c.press('KeyJ', 0, free);
    c.press('KeyK', 41, free);
    expect(c.read(100, free).commands).toEqual(['sword']);
    c.release('KeyK');
    c.press('KeyK', 110, free);
    expect(c.read(160, free).commands).toEqual([]);
    c.release('KeyJ');
    c.release('KeyK');
    c.press('KeyK', 200, free);
    c.press('KeyJ', 220, free);
    expect(c.read(220, free).commands).toEqual(['spin']);
    c.press('KeyJ', 225, free, true);
    expect(c.read(300, free).commands).toEqual([]);
  });
  it('never promotes an attack/guard/hit input to a delayed special', () => {
    const c = new CombatInput();
    c.press('KeyJ', 0, busy);
    c.press('KeyK', 20, busy);
    expect(c.read(100, free).commands).not.toContain('spin');
    c.clear();
    c.press('KeyJ', 0, free);
    c.read(10, busy);
    c.press('KeyK', 20, free);
    expect(c.read(100, free).commands).not.toContain('spin');
    const q = new AttackBuffer(),
      p = createActor(0, 'player', 0, 420);
    startAttack(p, 'slash1');
    q.push(['spin'], 0);
    p.attack = null;
    p.state = 'Idle';
    expect(q.consume(p, 0.1)).toBeNull();
  });
  it('delays only 40ms, released tap is preserved, K becomes guard, old L is inert', () => {
    const c = new CombatInput();
    c.press('KeyJ', 0, free);
    c.release('KeyJ');
    expect(c.read(40, free).commands).toEqual([]);
    expect(c.read(41, free).commands).toEqual(['sword']);
    c.press('KeyK', 100, free);
    expect(c.read(141, free).guard).toBe(true);
    c.press('KeyJ', 145, busy);
    expect(c.read(150, busy).guard).toBe(true);
    c.release('KeyJ');
    c.read(190, busy);
    c.press('KeyL', 200, free);
    expect(c.read(200, free).commands).toEqual([]);
  });
  it.each([1, -1] as const)(
    'recognizes down-forward-J facing %d and consumes the motion',
    (facing) => {
      const c = new CombatInput(),
        ctx = { free: true, facing };
      c.press('KeyS', 0, ctx);
      c.press(facing === 1 ? 'KeyD' : 'KeyA', 100, ctx);
      c.press('KeyJ', 200, ctx);
      expect(c.read(241, ctx).commands).toEqual(['rising']);
      c.release('KeyJ');
      c.press('KeyJ', 300, ctx);
      expect(c.read(341, ctx).commands).toEqual(['sword']);
    },
  );
  it('expires motion and locks facing at down input', () => {
    const c = new CombatInput();
    c.press('KeyS', 0, free);
    c.press('KeyD', 100, { free: true, facing: -1 });
    c.press('KeyJ', 200, free);
    expect(c.read(241, free).commands).toEqual(['rising']);
    c.clear();
    c.press('KeyS', 0, free);
    c.press('KeyD', 100, free);
    c.press('KeyJ', 401, free);
    expect(c.read(442, free).commands).toEqual(['sword']);
  });
});
describe('spin armor and cost', () => {
  it('costs 20% max HP once on contact, no cost on whiff, blocks low HP and cancel', () => {
    const p = createActor(0, 'player', 500, 420);
    expect(startAttack(p, 'spin')).toBe(true);
    expect(p.hp).toBe(180);
    p.attack!.elapsed = 0.2;
    for (const x of [450, 550]) {
      const e = createActor(x, 'grunt', x, 420);
      expect(applyHit(p, e)).toBe(40);
    }
    expect(p.hp).toBe(144);
    expect(startAttack(p, 'spin', true)).toBe(false);
    p.attack = null;
    p.state = 'Idle';
    p.hp = 36;
    expect(startAttack(p, 'spin')).toBe(false);
  });
  it('takes reduced damage without stagger or launch but can die', () => {
    const p = createActor(0, 'player', 500, 420),
      e = createActor(1, 'boss', 450, 420);
    startAttack(p, 'spin');
    e.facing = 1;
    startAttack(e, 'charge');
    e.attack!.elapsed = 0.6;
    const attack = p.attack;
    expect(applyHit(e, p)).toBe(3);
    expect(p.attack).toBe(attack);
    expect(p.vz).toBe(0);
    expect(p.vx).toBe(0);
    expect(p.state).toBe('Attack');
    p.hp = 1;
    p.invulnerable = 0;
    e.attack!.hit.clear();
    applyHit(e, p);
    expect(p.state).toBe('Death');
    expect(p.attack).toBeNull();
  });
  it('guards only the front with K-style guard state', () => {
    const p = createActor(0, 'player', 500, 420),
      e = createActor(1, 'grunt', 550, 420);
    p.state = 'Guard';
    p.facing = 1;
    e.facing = -1;
    startAttack(e, 'enemy');
    e.attack!.elapsed = 0.45;
    expect(applyHit(e, p)).toBe(2);
    p.invulnerable = 0;
    e.attack!.hit.clear();
    e.x = 450;
    e.facing = 1;
    expect(applyHit(e, p)).toBe(10);
  });
});
describe('rare potion drops', () => {
  it('uses exact 5% threshold and 70/25/5 item tiers', () => {
    const draw = (a: number, b: number) => {
      const values = [a, b];
      return rollLoot(() => values.shift()!);
    };
    expect(draw(0.05, 0)).toBeNull();
    expect(draw(0.049, 0)).toBe(0.1);
    expect(draw(0, 0.7)).toBe(0.2);
    expect(draw(0, 0.95)).toBe(0.5);
    const rng = seededRandom(22);
    let drops = 0;
    for (let i = 0; i < 100000; i++) if (rollLoot(rng)) drops++;
    expect(drops).toBeGreaterThan(4700);
    expect(drops).toBeLessThan(5300);
  });
  it('caps all healing and removes wave healing', () => {
    expect(collectLoot(100, 180, 0.1)).toBe(118);
    expect(collectLoot(100, 180, 0.2)).toBe(136);
    expect(collectLoot(100, 180, 0.5)).toBe(180);
    const s = new Simulation();
    s.active = true;
    s.player.hp = 100;
    s.step(1 / 60, emptyInput());
    expect(s.player.hp).toBe(100);
    s.loot = [{ id: 9, x: s.player.x, y: s.player.y, fraction: 0.2, age: 1 }];
    s.step(1 / 60, emptyInput());
    expect(s.player.hp).toBe(136);
    expect(s.loot).toEqual([]);
  });
});
