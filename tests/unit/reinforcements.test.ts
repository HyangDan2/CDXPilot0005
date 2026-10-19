import { it, expect } from 'vitest';
import { Reinforcements } from '../../src/game/entities/reinforcements';
import { createActor } from '../../src/game/entities/actor';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';
import { canRoll, movePlayer } from '../../src/game/entities/movement';
import { integrate } from '../../src/game/physics/world';
import { PLAYER } from '../../src/game/config/constants';
it('reserves at most three slots, telegraphs, and queues the fourth without repeat thresholds', () => {
  const r = new Reinforcements(),
    b = createActor(1, 'boss', 3300, 420),
    p = createActor(0, 'player', 2800, 400);
  const enemies = [b];
  b.hp = b.maxHp * 0.3;
  const update = (dt: number) =>
    r.update(b, p, enemies, [2620, 3550], dt, (k, x, y) =>
      enemies.push(createActor(enemies.length + 1, k, x, y)),
    );
  update(1 / 60);
  expect(enemies.length).toBe(1);
  expect(r.warnings.length).toBe(3);
  update(0.99);
  expect(enemies.length).toBe(1);
  update(0.02);
  expect(enemies.filter((e) => e.kind !== 'boss').map((e) => e.kind)).toEqual([
    'rusher',
    'grunt',
    'archer',
  ]);
  for (let i = 0; i < 10; i++) update(1);
  expect(enemies.length).toBe(4);
  enemies[1].hp = 0;
  update(0.1);
  expect(r.warnings.length).toBe(1);
  update(1.01);
  expect(enemies.length).toBe(5);
  for (const e of enemies.slice(1)) e.hp = 0;
  update(2);
  expect(r.warnings.length).toBe(0);
  expect(enemies.length).toBe(5);
});
it('does not spawn beside the player; moving to a warning causes a new telegraph at the far edge', () => {
  const r = new Reinforcements(),
    b = createActor(1, 'boss', 3300, 420),
    p = createActor(0, 'player', 2800, 400);
  b.hp = b.maxHp * 0.7;
  let count = 0;
  const update = (dt: number) => r.update(b, p, [b], [2620, 3550], dt, () => count++);
  update(0.01);
  p.x = r.warnings[0].x;
  update(1.01);
  expect(count).toBe(0);
  expect(r.warnings[0].remaining).toBe(1);
  expect(Math.abs(r.warnings[0].x - p.x)).toBeGreaterThan(160);
});
it('boss death immediately wins and clears surviving adds, projectiles and pending reinforcements', () => {
  const s = new Simulation();
  s.wave = 3;
  s.active = true;
  const b = createActor(1, 'boss', 3300, 420);
  b.hp = 0;
  s.enemies = [b, createActor(2, 'archer', 3000, 420)];
  s.arrows = [
    { id: 1, owner: 2, player: false, x: s.player.x, y: s.player.y, z: 50, facing: 1, age: 0 },
  ];
  s.step(1 / 60, emptyInput());
  expect(s.status).toBe('clear');
  expect(s.player.hp).toBe(PLAYER.hp);
  expect(s.enemies).toHaveLength(0);
  expect(s.arrows).toHaveLength(0);
  expect(s.reinforcements.warnings).toHaveLength(0);
});
it('roll readiness matches cooldown and state restrictions', () => {
  const p = createActor(0, 'player', 200, 400);
  expect(canRoll(p)).toBe(true);
  movePlayer(p, { ...emptyInput(), commands: ['roll'] }, 1 / 60);
  expect(p.rollCooldown).toBe(1.2);
  expect(canRoll(p)).toBe(false);
  for (let i = 0; i < 73; i++) integrate(p, 1 / 60, [24, 920]);
  expect(p.rollCooldown).toBe(0);
  expect(canRoll(p)).toBe(true);
  p.state = 'Hit';
  expect(canRoll(p)).toBe(false);
  p.state = 'Idle';
  p.z = 1;
  expect(canRoll(p)).toBe(false);
});
