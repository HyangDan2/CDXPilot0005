import { describe, expect, it } from 'vitest';
import { waves } from '../../src/data/stage';
import { Simulation } from '../../src/game/entities/simulation';
import { createActor } from '../../src/game/entities/actor';
import { emptyInput } from '../../src/game/entities/types';
import {
  expanded,
  inside,
  meleeOccluded,
  onGround,
  routeTarget,
} from '../../src/game/physics/obstacles';
import { attacks } from '../../src/data/attacks';

const dt = 1 / 60;
describe('second encounter cover integration', () => {
  it('spawns the authored archer in the upper firing lane without overlaps', () => {
    const a = new Simulation(42),
      b = new Simulation(42);
    for (const s of [a, b]) {
      s.wave = 1;
      s.player.x = 1180;
      s.step(dt, emptyInput());
    }
    expect(a.enemies).toEqual(b.enemies);
    expect(a.enemies.map((e) => ({ x: e.x, y: e.y }))).toEqual(waves[1].spawns);
    expect(a.enemies.find((e) => e.kind === 'archer')).toMatchObject({ x: 1580, y: 365 });
    for (const e of a.enemies)
      for (const p of a.environment.pillars) expect(inside(e, expanded(p, 16, 10))).toBe(false);
    a.enemies.forEach((e) => {
      e.hp = 0;
    });
    a.step(dt, emptyInput());
    expect(a.wave).toBe(2);
    expect(a.active).toBe(false);
  });
  it('walks the complete S corridor with real movement commands and no position overrides en route', () => {
    const s = new Simulation();
    s.wave = 1;
    s.active = true;
    s.player.x = 1180;
    s.player.y = 450;
    const watcher = createActor(100, 'guard', 1740, 450);
    watcher.aiTime = -1000;
    s.enemies = [watcher];
    let sawUpperPassage = false;
    const target = { x: 1730, y: 450 };
    for (let tick = 0; tick < 1800; tick++) {
      const p = s.player,
        next = routeTarget(p, target, s.environment.solids);
      if (Math.hypot(p.x - target.x, p.y - target.y) < 5) break;
      s.step(dt, {
        ...emptyInput(),
        x: Math.abs(next.x - p.x) > 2 ? Math.sign(next.x - p.x) : 0,
        y: Math.abs(next.y - p.y) > 2 ? Math.sign(next.y - p.y) : 0,
      });
      expect(onGround(p)).toBe(true);
      for (const column of s.environment.pillars)
        expect(inside(p, expanded(column, 16, 10))).toBe(false);
      if (p.x > 1470 && p.x < 1514 && p.y <= 395) sawUpperPassage = true;
    }
    expect(s.player.x).toBeGreaterThan(1725);
    expect(sawUpperPassage).toBe(true);
    expect(s.player.hp).toBe(s.player.maxHp);
  });
  it('prevents a long melee strike from damaging an enemy through stone', () => {
    const s = new Simulation();
    s.wave = 1;
    s.active = true;
    s.player.x = 1264;
    s.player.y = 370;
    const target = createActor(100, 'grunt', 1340, 370);
    target.aiTime = -1000;
    s.enemies = [target];
    s.player.attack = {
      id: 'slash4',
      elapsed: attacks.slash4.startupFrames / 60 + 0.01,
      hit: new Set(),
    };
    s.player.state = 'Attack';
    expect(meleeOccluded(s.player, target, s.environment.solids)).toBe(true);
    s.step(dt, emptyInput());
    expect(target.hp).toBe(target.maxHp);
  });
  it('absorbs a committed enemy shot even when the player takes cover after its tell', () => {
    const s = new Simulation();
    s.wave = 1;
    s.active = true;
    s.player.x = 1240;
    s.player.y = 370;
    const archer = createActor(100, 'archer', 1400, 370);
    archer.state = 'Attack';
    archer.ai = 'Attack';
    archer.attack = {
      id: 'enemyShot',
      elapsed: attacks.enemyShot.startupFrames / 60 - 0.1,
      hit: new Set(),
    };
    s.enemies = [archer];
    for (let i = 0; i < 65; i++) s.step(dt, emptyInput());
    expect(s.arrows).toHaveLength(0);
    expect(s.player.hp).toBe(s.player.maxHp);
    expect(s.environment.pillars[0].hp).toBe(1);
  });
});
