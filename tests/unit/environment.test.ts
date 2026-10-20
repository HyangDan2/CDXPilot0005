import { describe, expect, it } from 'vitest';
import { attacks } from '../../src/data/attacks';
import { flameRules, flameTiming, stageDepth } from '../../src/data/environment';
import { StageEnvironment, flamePhase } from '../../src/game/entities/environment';
import { createActor } from '../../src/game/entities/actor';
import type { GameEvent, Kind } from '../../src/game/entities/types';
import { collideSolids, expanded, inside, routeTarget } from '../../src/game/physics/obstacles';
import { updateAI } from '../../src/game/ai/brain';
import { integrate } from '../../src/game/physics/world';
import { advanceArrows, type Arrow } from '../../src/game/entities/projectiles';

const active = flameTiming.rest + flameTiming.warning + 0.01;
const arrow = (overrides: Partial<Arrow> = {}): Arrow => ({
  id: 1,
  owner: 0,
  player: true,
  x: 620,
  y: 410,
  z: 50,
  facing: 1,
  age: 0,
  ...overrides,
});

describe('courtyard geometry and barricades', () => {
  it('widens the courtyard and smoothly returns to the original depth', () => {
    expect(stageDepth(24)).toEqual([376, 480]);
    expect(stageDepth(500)).toEqual([330, 480]);
    expect(stageDepth(1000)[0]).toBeGreaterThan(330);
    expect(stageDepth(2020)).toEqual([376, 480]);
  });
  it.each(['player', 'grunt', 'boss'] as Kind[])(
    'stops fast %s movement without tunnelling',
    (kind) => {
      const env = new StageEnvironment();
      const a = createActor(1, kind, 800, 411);
      collideSolids(a, { x: 600, y: 411 }, env.barricades);
      expect(a.x).toBeLessThanOrEqual(634);
      expect(a.x).toBeGreaterThan(620);
      a.x = 600;
      collideSolids(a, { x: 800, y: 411 }, env.barricades);
      expect(a.x).toBeGreaterThanOrEqual(714);
    },
  );
  it('allows both detours, high jumps, and movement after destruction', () => {
    const env = new StageEnvironment();
    for (const y of [350, 465]) {
      const a = createActor(0, 'player', 800, y);
      collideSolids(a, { x: 600, y }, env.barricades);
      expect(a.x).toBeCloseTo(800);
    }
    const a = createActor(0, 'player', 675, 411);
    a.z = 70;
    collideSolids(a, { x: 600, y: 411 }, env.barricades);
    expect(a.x).toBeCloseTo(675);
    a.z = 0;
    collideSolids(a, a, env.barricades);
    expect(inside(a, expanded(env.barricades[0], 16, 10))).toBe(false);
    env.barricades[0].hp = 0;
    a.x = 800;
    a.y = 411;
    collideSolids(a, { x: 600, y: 411 }, env.barricades);
    expect(a.x).toBeCloseTo(800);
  });
  it('applies authored attack damage only once per swing and charges spin once', () => {
    const env = new StageEnvironment();
    const a = createActor(0, 'player', 620, 411);
    a.attack = { id: 'spin', elapsed: attacks.spin.startupFrames / 60 + 0.01, hit: new Set() };
    const events: GameEvent[] = [];
    env.strike(a, (e) => events.push(e));
    env.strike(a, (e) => events.push(e));
    expect(env.barricades[0].hp).toBe(64 - attacks.spin.damage);
    expect(a.hp).toBe(a.maxHp * 0.8);
    expect(events).toHaveLength(1);
    a.attack = { id: 'heavy', elapsed: attacks.heavy.startupFrames / 60 + 0.01, hit: new Set() };
    env.strike(a, () => {});
    expect(env.barricades[0].hp).toBe(Math.max(0, 64 - attacks.spin.damage - attacks.heavy.damage));
  });
  it('ignores windup, wrong depth and attacks above the wall', () => {
    const env = new StageEnvironment();
    const a = createActor(0, 'player', 620, 411);
    a.attack = { id: 'slash1', elapsed: 0, hit: new Set() };
    env.strike(a, () => {});
    a.attack.elapsed = attacks.slash1.startupFrames / 60 + 0.01;
    a.y = 330;
    env.strike(a, () => {});
    a.y = 411;
    a.z = 200;
    env.strike(a, () => {});
    expect(env.barricades[0].hp).toBe(64);
  });
  it('intercepts arrows before actors, in both directions, while high arrows pass', () => {
    for (const facing of [-1, 1] as const) {
      const env = new StageEnvironment();
      const target = createActor(2, 'grunt', facing === 1 ? 740 : 600, 411);
      const a = arrow({ facing, x: facing === 1 ? 620 : 740 });
      const result = advanceArrows(
        [a],
        [target],
        0.3,
        () => {},
        (shot, before, end) => env.interceptArrow(shot, before, end),
      );
      expect(result).toHaveLength(0);
      expect(target.hp).toBe(target.maxHp);
      expect(env.barricades[0].hp).toBe(64 - attacks.shot.damage);
    }
    const env = new StageEnvironment();
    expect(env.interceptArrow(arrow({ z: 80 }), 620, 760)).toBe(false);
    expect(env.interceptArrow(arrow({ y: 350 }), 620, 760)).toBe(false);
    env.barricades[0].hp = 0;
    expect(env.interceptArrow(arrow(), 620, 760)).toBe(false);
  });
  it('does not intercept an arrow that hits a nearer enemy first', () => {
    const env = new StageEnvironment();
    const enemy = createActor(2, 'grunt', 630, 410);
    const hp = enemy.hp;
    advanceArrows(
      [arrow({ x: 600 })],
      [enemy],
      0.3,
      () => {},
      (shot, before, end) => env.interceptArrow(shot, before, end),
    );
    expect(enemy.hp).toBeLessThan(hp);
    expect(env.barricades[0].hp).toBe(64);
  });
  it.each(['grunt', 'guard', 'rusher', 'archer'] as Kind[])(
    '%s finds a route without entering the barricade',
    (kind) => {
      const env = new StageEnvironment();
      const player = createActor(0, 'player', 500, 411);
      const enemy = createActor(2, kind, 760, 411);
      enemy.ai = 'Chase';
      for (let i = 0; i < 600; i++) {
        const before = { x: enemy.x, y: enemy.y };
        updateAI(enemy, player, 1 / 60, false, [], env.barricades);
        integrate(enemy, 1 / 60);
        collideSolids(enemy, before, env.barricades);
        expect(inside(enemy, expanded(env.barricades[0], 16, 10))).toBe(false);
      }
      // Archers can stop once they have a clear firing lane above/below the wall.
      expect(routeTarget(enemy, player, env.barricades)).toBe(player);
      if (kind !== 'archer') expect(enemy.x).toBeLessThan(630);
      expect(env.barricades[0].hp).toBe(64);
    },
  );
  it('routes to a player standing at a barricade contact edge', () => {
    const env = new StageEnvironment();
    const target = { x: 634, y: 411 };
    let point = { x: 760, y: 411 };
    for (let i = 0; i < 400; i++) {
      const goal = routeTarget(point, target, env.barricades);
      const distance = Math.hypot(goal.x - point.x, goal.y - point.y);
      if (distance < 0.001) break;
      const step = Math.min(distance, 2);
      point = {
        x: point.x + ((goal.x - point.x) / distance) * step,
        y: point.y + ((goal.y - point.y) / distance) * step,
      };
    }
    expect(Math.hypot(point.x - target.x, point.y - target.y)).toBeLessThan(10);
  });
  it('aligns an archer after a detour before shooting inside projectile depth range', () => {
    const player = createActor(0, 'player', 500, 400);
    const archer = createActor(2, 'archer', 620, 385);
    archer.ai = 'Flank';
    expect(updateAI(archer, player, 1 / 60)).toBeNull();
    expect(archer.y).toBeGreaterThan(385);
    for (let i = 0; i < 60 && !archer.attack; i++) updateAI(archer, player, 1 / 60);
    expect(archer.attack?.id).toBe('enemyShot');
    expect(Math.abs(archer.y - player.y)).toBeLessThan(attacks.enemyShot.hitbox.depth);
  });
});

describe('telegraphed furnace vent', () => {
  it('cycles rest → warning → active → rest and emits one warning per cycle', () => {
    const env = new StageEnvironment();
    const events: GameEvent[] = [];
    const phases = new Set<string>();
    for (let i = 0; i < 60 * 11; i++) {
      env.advance(1 / 60, (e) => events.push(e));
      phases.add(env.flames[0].phase);
    }
    expect([...phases]).toEqual(['rest', 'warning', 'active']);
    expect(events.filter((e) => e.type === 'hazardWarning')).toHaveLength(2);
    expect(flamePhase(0)).toBe('rest');
    expect(flamePhase(flameTiming.rest + 0.01)).toBe('warning');
    expect(flamePhase(active)).toBe('active');
  });
  it.each(['player', 'grunt'] as Kind[])(
    'burns %s with a cooldown and interrupts its attack',
    (kind) => {
      const env = new StageEnvironment();
      env.time = active;
      const a = createActor(1, kind, 810, 365);
      const hp = a.hp;
      a.attack = { id: 'slash1', elapsed: 0, hit: new Set() };
      expect(env.burn(a)).toBe(flameRules.damage);
      expect(a.hp).toBe(hp - flameRules.damage);
      expect(a.attack).toBeNull();
      expect(a.state).toBe('Hit');
      expect(env.burn(a)).toBe(0);
      a.invulnerable = 0;
      env.time += flameRules.interval - 0.01;
      expect(env.burn(a)).toBe(0);
      env.time += 0.02;
      expect(env.burn(a)).toBe(flameRules.damage);
    },
  );
  it('is harmless during warning, outside its footprint, and above jump clearance', () => {
    const env = new StageEnvironment();
    const a = createActor(0, 'player', 810, 365);
    env.time = flameTiming.rest + 0.1;
    expect(env.burn(a)).toBe(0);
    env.time = active;
    a.z = flameRules.safeHeight;
    expect(env.burn(a)).toBe(0);
    a.z = 0;
    a.y = 430;
    expect(env.burn(a)).toBe(0);
  });
  it('respects the roll window, but guard and roll startup do not block floor fire', () => {
    for (const [state, time, expected] of [
      ['Roll', 0.15, 0],
      ['Roll', 0.05, 12],
      ['Roll', 0.35, 12],
      ['Guard', 0.2, 12],
    ] as const) {
      const env = new StageEnvironment();
      env.time = active;
      const a = createActor(0, 'player', 810, 365);
      a.state = state;
      a.stateTime = time;
      expect(env.burn(a)).toBe(expected);
    }
  });
});
