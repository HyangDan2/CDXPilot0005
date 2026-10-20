import { describe, expect, it } from 'vitest';
import { pillarDefinitions, stageDepth } from '../../src/data/environment';
import { StageEnvironment } from '../../src/game/entities/environment';
import { createActor } from '../../src/game/entities/actor';
import { advanceArrows, type Arrow } from '../../src/game/entities/projectiles';
import type { Kind } from '../../src/game/entities/types';
import { updateAI } from '../../src/game/ai/brain';
import { integrate } from '../../src/game/physics/world';
import {
  collideSolids,
  expanded,
  firstArrowBlocker,
  inside,
  meleeOccluded,
  onGround,
  routeTarget,
} from '../../src/game/physics/obstacles';

describe('stone cover and S passage', () => {
  it('widens encounter two and returns to the corridor before encounter three', () => {
    expect(stageDepth(1180)).toEqual([330, 480]);
    expect(stageDepth(1760)).toEqual([330, 480]);
    expect(stageDepth(1850)[0]).toBeGreaterThan(330);
    expect(stageDepth(2020)).toEqual([376, 480]);
  });
  it.each([1, -1] as const)(
    'routes the entire S passage in direction %s without leaving the floor',
    (direction) => {
      const env = new StageEnvironment();
      const start = { x: direction === 1 ? 1180 : 1740, y: 450 };
      const target = { x: direction === 1 ? 1740 : 1180, y: 450 };
      let point = start;
      const crossings = new Map<number, number>();
      for (let i = 0; i < 1800; i++) {
        expect(onGround(point)).toBe(true);
        for (const p of env.pillars) {
          expect(inside(point, expanded(p, 16, 10))).toBe(false);
          if (Math.abs(point.x - p.x - p.width / 2) < 3) crossings.set(p.id, point.y);
        }
        const goal = routeTarget(point, target, env.solids);
        const distance = Math.hypot(goal.x - point.x, goal.y - point.y);
        if (distance < 0.001) break;
        const step = Math.min(2, distance);
        point = {
          x: point.x + ((goal.x - point.x) / distance) * step,
          y: point.y + ((goal.y - point.y) / distance) * step,
        };
      }
      expect(Math.hypot(point.x - target.x, point.y - target.y)).toBeLessThan(1);
      expect(crossings.size).toBe(3);
      expect(crossings.get(-10)).toBeGreaterThanOrEqual(425);
      expect(crossings.get(-11)).toBeLessThanOrEqual(395);
      expect(crossings.get(-12)).toBeGreaterThanOrEqual(425);
    },
  );
  it.each(['player', 'grunt', 'boss'] as Kind[])(
    'stops %s movement even at normal jump peak',
    (kind) => {
      const env = new StageEnvironment();
      const actor = createActor(1, kind, 1380, 370);
      actor.z = 95;
      collideSolids(actor, { x: 1230, y: 370 }, env.solids);
      expect(actor.x).toBeLessThanOrEqual(1264);
    },
  );
  it.each([true, false])('blocks %s-side arrows without damaging stone', (player) => {
    const env = new StageEnvironment();
    const target = createActor(2, player ? 'grunt' : 'player', 1370, 370);
    const shot: Arrow = { id: 1, owner: 100, player, x: 1240, y: 370, z: 50, facing: 1, age: 0 };
    const result = advanceArrows(
      [shot],
      [target],
      0.4,
      () => {},
      (arrow, before, end) => env.interceptArrow(arrow, before, end),
    );
    expect(result).toHaveLength(0);
    expect(target.hp).toBe(target.maxHp);
    expect(env.pillars).toEqual(pillarDefinitions);
    expect(env.pillars[0].hp).toBe(1);
  });
  it('selects the nearest surface in either direction and honors height/depth', () => {
    const env = new StageEnvironment();
    expect(firstArrowBlocker(1180, 1750, 370, 50, env.solids)?.x).toBe(1280);
    expect(firstArrowBlocker(1750, 1180, 370, 50, env.solids)?.x).toBe(1650);
    expect(firstArrowBlocker(1180, 1750, 450, 50, env.solids)?.x).toBe(1470);
    expect(firstArrowBlocker(1180, 1750, 370, 130, env.solids)).toBeUndefined();
    expect(firstArrowBlocker(1345, 1430, 450, 50, env.solids)).toBeUndefined();
  });
  it('blocks melee across stone while retaining authored reach across the low wooden barrier', () => {
    const env = new StageEnvironment();
    const a = createActor(0, 'player', 1264, 370),
      b = createActor(1, 'grunt', 1340, 370);
    expect(meleeOccluded(a, b, env.solids)).toBe(true);
    a.x = 634;
    a.y = 410;
    b.x = 714;
    b.y = 410;
    expect(meleeOccluded(a, b, env.solids)).toBe(false);
  });
  it('resolves landing or spawn overlap at boundary piers onto the floor, never beyond it', () => {
    const env = new StageEnvironment();
    for (const pillar of env.pillars) {
      for (const y of [pillar.y + 3, pillar.y + pillar.depth - 3]) {
        const actor = createActor(1, 'grunt', pillar.x + pillar.width / 2, y);
        collideSolids(actor, actor, env.solids);
        expect(onGround(actor)).toBe(true);
        for (const p of env.pillars) expect(inside(actor, expanded(p, 16, 10))).toBe(false);
      }
    }
  });
  it.each(['grunt', 'guard', 'rusher', 'archer'] as Kind[])(
    '%s follows the passages until it reaches its combat position',
    (kind) => {
      const env = new StageEnvironment();
      const player = createActor(0, 'player', 1180, 450);
      const enemy = createActor(2, kind, 1740, 450);
      enemy.ai = 'Chase';
      for (let i = 0; i < 1800; i++) {
        const before = { x: enemy.x, y: enemy.y };
        updateAI(enemy, player, 1 / 60, false, [], env.solids);
        integrate(enemy, 1 / 60);
        collideSolids(enemy, before, env.solids);
        expect(onGround(enemy)).toBe(true);
        for (const p of env.pillars) expect(inside(enemy, expanded(p, 16, 10))).toBe(false);
      }
      if (kind === 'archer') {
        expect(enemy.x).toBeLessThan(1454);
        expect(routeTarget(enemy, player, env.solids)).toBe(player);
        expect(
          firstArrowBlocker(enemy.x + enemy.facing * 24, player.x, enemy.y, 50, env.solids),
        ).toBeUndefined();
        expect(Math.abs(enemy.y - player.y)).toBeLessThanOrEqual(8);
      } else expect(enemy.x).toBeLessThan(1280);
    },
  );
  it('repositions a blocked archer and only fires once its actual arrow lane is clear', () => {
    const env = new StageEnvironment();
    const player = createActor(0, 'player', 1240, 370);
    const archer = createActor(2, 'archer', 1400, 370);
    expect(updateAI(archer, player, 1 / 60, true, [], env.solids)).toBeNull();
    expect(archer.attack).toBeNull();
    let fired = false;
    for (let i = 0; i < 1200; i++) {
      const before = { x: archer.x, y: archer.y };
      const attack = updateAI(archer, player, 1 / 60, true, [], env.solids);
      integrate(archer, 1 / 60);
      collideSolids(archer, before, env.solids);
      if (attack) {
        expect(attack).toBe('enemyShot');
        expect(
          firstArrowBlocker(archer.x + archer.facing * 24, player.x, archer.y, 50, env.solids),
        ).toBeUndefined();
        expect(Math.abs(archer.y - player.y)).toBeLessThan(12);
        fired = true;
        break;
      }
    }
    expect(fired).toBe(true);
  });
  it('can shoot a target beside a pier when only the larger walking clearance overlaps cover', () => {
    const env = new StageEnvironment();
    const player = createActor(0, 'player', 1300, 425);
    const archer = createActor(2, 'archer', 1400, 450);
    let fired = false;
    for (let i = 0; i < 300; i++) {
      const before = { x: archer.x, y: archer.y };
      const attack = updateAI(archer, player, 1 / 60, true, [], env.solids);
      integrate(archer, 1 / 60);
      collideSolids(archer, before, env.solids);
      if (attack) {
        fired = true;
        break;
      }
    }
    expect(fired).toBe(true);
    expect(
      firstArrowBlocker(archer.x + archer.facing * 24, player.x, archer.y, 50, env.solids),
    ).toBeUndefined();
  });
});
