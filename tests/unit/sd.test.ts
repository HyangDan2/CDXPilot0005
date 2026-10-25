import { describe, expect, it } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import { canHit, hitbox, applyHit, startAttack } from '../../src/game/combat/combat';
import { attacks } from '../../src/data/attacks';
import { sd, sdFrame } from '../../src/game/animation/sd';
import type { AttackId, Actor } from '../../src/game/entities/types';
import { updateAI } from '../../src/game/ai/brain';
function attacking(id: AttackId, t = 0.5) {
  const p = createActor(0, 'player', 500, 420);
  startAttack(p, id);
  p.attack!.elapsed = (attacks[id].startupFrames + attacks[id].activeFrames * t) / 60;
  return p;
}
describe('authored SD motion and collision', () => {
  it('has no damage during preparation or recovery, and a single hit per swing', () => {
    const p = attacking('slash1'),
      e = createActor(1, 'grunt', 540, 420);
    p.attack!.elapsed = 0;
    expect(canHit(p, e)).toBe(false);
    p.attack!.elapsed = (attacks.slash1.startupFrames + 3) / 60;
    expect(applyHit(p, e)).toBe(23);
    e.invulnerable = 0;
    expect(applyHit(p, e)).toBe(0);
    p.attack!.hit.clear();
    p.attack!.elapsed = (attacks.slash1.startupFrames + attacks.slash1.activeFrames) / 60;
    expect(canHit(p, e)).toBe(false);
  });
  it('keeps kicks shorter than sword reach and respects depth and airborne separation', () => {
    const p = attacking('kick', 0.9),
      e = createActor(1, 'grunt', 585, 420);
    expect(canHit(p, e)).toBe(false);
    p.attack!.id = 'slash1';
    p.attack!.elapsed = (11 + 5) / 60;
    expect(canHit(p, e)).toBe(true);
    e.y = 450;
    expect(canHit(p, e)).toBe(false);
    e.y = 420;
    e.z = 100;
    expect(canHit(p, e)).toBe(false);
  });
  it('mirrors the strike envelope around the actor without changing range', () => {
    const p = attacking('slash1', 0.9),
      r = hitbox(p);
    p.facing = -1;
    const l = hitbox(p);
    expect(l.x + l.width).toBeCloseTo(1000 - r.x);
    expect(l.width).toBe(r.width);
    const e = createActor(1, 'grunt', 440, 420);
    expect(canHit(p, e)).toBe(true);
    e.x = 560;
    expect(canHit(p, e)).toBe(false);
  });
  it('rising follows a rising blade and includes the previous fixed-step envelope', () => {
    const p = attacking('rising', 0.05),
      low = hitbox(p);
    p.attack!.elapsed = (9 + 9) / 60;
    const high = hitbox(p);
    expect(high.minZ).toBeGreaterThan(low.minZ);
    expect(high.maxZ).toBeGreaterThan(low.maxZ);
    expect(high.maxZ).toBeLessThanOrEqual(180);
  });
  it('uses two-handed slash, spin, rising and enemy weapons at their active timing', () => {
    expect(sdFrame(attacking('spin', 0.8))).toEqual({ sheet: 'smooth-defense', frame: 14 });
    expect(sdFrame(attacking('slash1', 0.8))).toEqual({ sheet: 'smooth-combo', frame: 3 });
    expect(sdFrame(attacking('rising', 0.8))).toEqual({ sheet: 'smooth-attack', frame: 5 });
    for (const kind of ['player', 'grunt', 'rusher', 'guard', 'boss'] as Actor['kind'][]) {
      const a = createActor(1, kind, 0, 420);
      for (const state of [
        'Idle',
        'Run',
        'Walk',
        'Jump',
        'Fall',
        'Land',
        'Guard',
        'Hit',
        'Knockdown',
        'Recovery',
        'Death',
      ] as const) {
        a.state = state;
        for (const t of [0, 0.1, 0.3, 1, 3]) {
          a.stateTime = t;
          const pose = sdFrame(a);
          expect(pose.frame).toBeLessThan(sd.sheets[pose.sheet as keyof typeof sd.sheets].count);
        }
      }
    }
  });
  it('pressures sooner while preserving the readable attack windup', () => {
    const e = createActor(1, 'grunt', 100, 420),
      p = createActor(0, 'player', 500, 420);
    e.ai = 'Chase';
    e.aiTime = 1;
    updateAI(e, p, 0.1);
    expect(e.x).toBeCloseTo(115.8);
    e.x = 450;
    e.ai = 'Recover';
    e.aiTime = 0.23;
    updateAI(e, p, 0.02);
    expect(e.ai).toBe('Retreat');
    expect(attacks.enemy.startupFrames).toBeGreaterThanOrEqual(20);
  });
});
