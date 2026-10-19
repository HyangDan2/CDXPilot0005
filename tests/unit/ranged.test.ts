import { expect, it } from 'vitest';
import { Simulation } from '../../src/game/entities/simulation';
import { createActor } from '../../src/game/entities/actor';
import { emptyInput } from '../../src/game/entities/types';
import { applyHit, startAttack } from '../../src/game/combat/combat';
import { attacks } from '../../src/data/attacks';
import { advanceArrows, type Arrow } from '../../src/game/entities/projectiles';
import { updateAI } from '../../src/game/ai/brain';
const tick = (s: Simulation, n: number) => {
  for (let i = 0; i < n; i++) s.step(1 / 60, emptyInput());
};
const command = (s: Simulation, c: 'switch' | 'roll' | 'sword') =>
  s.step(1 / 60, { ...emptyInput(), commands: [c] });
it('switch takes time, bow cannot use sword skills, shot has windup and cooldown', () => {
  const s = new Simulation();
  command(s, 'switch');
  expect(s.player.weapon).toBe('sword');
  tick(s, 25);
  expect(s.player.weapon).toBe('bow');
  expect(startAttack(s.player, 'spin')).toBe(false);
  expect(startAttack(s.player, 'rising')).toBe(false);
  command(s, 'sword');
  tick(s, 35);
  expect(s.arrows).toHaveLength(0);
  tick(s, 7);
  expect(s.arrows).toHaveLength(1);
  expect(startAttack(s.player, 'shot')).toBe(false);
  tick(s, 36);
  expect(s.player.attack).toBeNull();
});
it.each(['guard', 'roll'] as const)('bow preparation cancelled by %s emits no arrow', (action) => {
  const s = new Simulation();
  s.player.weapon = 'bow';
  command(s, 'sword');
  tick(s, 15);
  s.step(1 / 60, {
    ...emptyInput(),
    guard: action === 'guard',
    commands: action === 'roll' ? ['roll'] : [],
  });
  expect(s.player.attack).toBeNull();
  tick(s, 75);
  expect(s.arrows).toHaveLength(0);
});
it('arrow hits first enemy once, respects depth, and is swept across long frame', () => {
  const a = createActor(1, 'grunt', 160, 400),
    b = createActor(2, 'grunt', 210, 400),
    off = createActor(3, 'grunt', 130, 450);
  const arrow: Arrow = { id: 1, owner: 0, player: true, x: 100, y: 400, z: 50, facing: 1, age: 0 };
  let hits = 0;
  const remaining = advanceArrows([arrow], [off, b, a], 0.3, () => hits++);
  expect(hits).toBe(1);
  expect(a.hp).toBe(31);
  expect(b.hp).toBe(62);
  expect(off.hp).toBe(62);
  expect(remaining).toHaveLength(0);
});
it.each(['sword', 'bow'] as const)(
  '%s blocks front arrows at the correct damage fraction',
  (weapon) => {
    const p = createActor(0, 'player', 160, 400);
    p.weapon = weapon;
    p.state = 'Guard';
    p.facing = -1;
    advanceArrows(
      [{ id: 1, owner: 1, player: false, x: 100, y: 400, z: 50, facing: 1, age: 0 }],
      [p],
      0.2,
      () => {},
    );
    expect(p.hp).toBe(180 - Math.round(12 * (weapon === 'bow' ? 0.4 : 0.2)));
  },
);
it('roll has vulnerable beginning/landing and middle-only dodge, and cannot spam', () => {
  const s = new Simulation(),
    e = createActor(1, 'grunt', s.player.x + 30, s.player.y);
  e.facing = -1;
  command(s, 'roll');
  expect(s.player.state).toBe('Roll');
  startAttack(e, 'enemy');
  e.attack!.elapsed = 0.42;
  expect(applyHit(e, s.player)).toBe(10);
  const p = createActor(0, 'player', 100, 400);
  p.state = 'Roll';
  p.stateTime = 0.2;
  e.x = 130;
  e.attack!.hit.clear();
  expect(applyHit(e, p)).toBe(0);
  p.stateTime = 0.4;
  expect(applyHit(e, p)).toBe(10);
  const s2 = new Simulation();
  command(s2, 'roll');
  tick(s2, 31);
  command(s2, 'roll');
  expect(s2.player.state).not.toBe('Roll');
  tick(s2, 45);
  command(s2, 'roll');
  expect(s2.player.state).toBe('Roll');
});
it('normal attack cannot roll-cancel windup but late recovery allows it', () => {
  const s = new Simulation();
  command(s, 'sword');
  command(s, 'roll');
  expect(s.player.state).toBe('Attack');
  const d = attacks.slash1;
  s.player.attack!.elapsed = (d.startupFrames + d.activeFrames + d.recoveryFrames * 0.7) / 60;
  command(s, 'roll');
  expect(s.player.state).toBe('Roll');
  expect(s.player.attack).toBeNull();
});
it('archer commits aim and does not flee indefinitely; dagger and heavy have distinct stats', () => {
  const p = createActor(0, 'player', 100, 400),
    e = createActor(1, 'archer', 300, 400);
  updateAI(e, p, 0.6);
  expect(e.attack?.id).toBe('enemyShot');
  const facing = e.facing;
  p.x = 500;
  updateAI(e, p, 0.1);
  expect(e.facing).toBe(facing);
  expect(attacks.dagger.damage).toBeLessThan(attacks.enemy.damage);
  expect(attacks.heavy.damage).toBeGreaterThan(attacks.enemy.damage);
  expect(attacks.heavy.startupFrames).toBeGreaterThan(attacks.dagger.startupFrames);
});
it('being hit during draw cancels the shot permanently', () => {
  const s = new Simulation();
  s.player.weapon = 'bow';
  command(s, 'sword');
  const e = createActor(1, 'grunt', s.player.x + 30, s.player.y);
  e.facing = -1;
  startAttack(e, 'enemy');
  e.attack!.elapsed = 0.42;
  expect(applyHit(e, s.player)).toBe(10);
  tick(s, 90);
  expect(s.arrows).toHaveLength(0);
});
