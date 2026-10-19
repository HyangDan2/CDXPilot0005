import { it, expect } from 'vitest';
import { attacks } from '../../src/data/attacks';
import { createActor } from '../../src/game/entities/actor';
import { applyHit, startAttack } from '../../src/game/combat/combat';
import { integrate, FixedClock } from '../../src/game/physics/world';
import type { Actor, AttackId } from '../../src/game/entities/types';
function hit(a: Actor, b: Actor, id: AttackId = 'rising') {
  a.attack = null;
  a.state = 'Idle';
  a.x = b.x - 45;
  a.y = b.y;
  startAttack(a, id);
  a.attack!.elapsed = (attacks[id].startupFrames + 2) / 60;
  return applyHit(a, b);
}
it('reduces second launch and rejects all hits after third forced knockdown', () => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'guard', 145, 400);
  b.hp = b.maxHp = 1000;
  hit(a, b);
  expect(b.vz).toBe(420);
  integrate(b, 0.1);
  hit(a, b);
  expect(b.vz).toBe(147);
  integrate(b, 0.1);
  hit(a, b);
  expect(b.juggle.forced).toBe(true);
  expect(b.vz).toBeLessThan(0);
  const hp = b.hp;
  integrate(b, 0.1);
  expect(hit(a, b)).toBe(0);
  expect(b.hp).toBe(hp);
});
it('allows no more than three additional air hits even with non-launch attacks', () => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'guard', 145, 400);
  b.hp = 1000;
  hit(a, b);
  for (let i = 0; i < 3; i++) {
    b.invulnerable = 0;
    b.z = 20;
    hit(a, b, 'slash1');
  }
  expect(b.juggle.airHits).toBe(3);
  expect(b.juggle.forced).toBe(true);
});
it('keeps the budget until recovery finishes and grants wake protection', () => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'guard', 145, 400);
  hit(a, b);
  b.z = 0;
  b.vz = 0;
  integrate(b, 0.1);
  expect(b.juggle.active).toBe(true);
  expect(hit(a, b)).toBe(0);
  integrate(b, 0.21);
  expect(b.state).toBe('Recovery');
  expect(hit(a, b)).toBe(0);
  integrate(b, 0.36);
  expect(b.juggle.active).toBe(false);
  expect(b.invulnerable).toBe(0.5);
  expect(hit(a, b)).toBe(0);
});
it('boss staggers without being launched', () => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'boss', 145, 400);
  expect(hit(a, b)).toBe(34);
  expect(b.vz).toBe(0);
  expect(b.juggle.active).toBe(false);
  expect(b.state).toBe('Hit');
});
it.each([30, 60, 144])(
  'repeated rising cannot prevent wakeup at %i render Hz, including arena edge',
  (fps) => {
    const a = createActor(0, 'player', 800, 400),
      b = createActor(1, 'guard', 900, 400);
    b.hp = 10000;
    let recovered = false;
    const c = new FixedClock();
    for (let i = 0; i < fps * 4; i++)
      c.advance(1 / fps, (dt) => {
        hit(a, b);
        integrate(b, dt, [800, 900]);
        if (b.state === 'Recovery') recovered = true;
      });
    expect(recovered).toBe(true);
  },
);
it('tracks two targets independently and rising has no recovery cancel', () => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'guard', 145, 400),
    c = createActor(2, 'guard', 160, 400);
  hit(a, b);
  expect(c.juggle.active).toBe(false);
  expect(a.attack?.hit.has(c.id)).toBe(false);
});
