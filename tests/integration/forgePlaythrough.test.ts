import { expect, it } from 'vitest';
import { attackPhase } from '../../src/data/attacks';
import { inside, meleeOccluded, routeTarget } from '../../src/game/physics/obstacles';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput, type Command } from '../../src/game/entities/types';

it('clears the five forge areas with ordinary movement and attacks, collecting the optional garden heal', () => {
  const s = new Simulation(731, 'forge');
  const visited = new Set<number>();
  let action = 0,
    gardenCollected = false,
    deviceSeen = false,
    wallBroken = false;
  for (let tick = 0; tick < 60 * 240 && s.status === 'playing'; tick++) {
    const input = emptyInput(),
      p = s.player;
    visited.add(s.sectionIndex);
    const target = s.enemies
      .filter((e) => e.hp > 0)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    if (target) {
      // Flyers are engaged during their dive; player arrows keep one authored launch height.
      if (p.weapon === 'bow') {
        if (p.state !== 'Switch' && !p.attack) input.commands = ['switch'];
      }
      const waypoint = routeTarget(p, target, s.environment.solids);
      const detour = waypoint !== target;
      const dx = target.x - p.x,
        dy = target.y - p.y;
      input.x = detour
        ? Math.abs(waypoint.x - p.x) > 2
          ? Math.sign(waypoint.x - p.x)
          : 0
        : Math.abs(dx) > 48 || p.facing !== Math.sign(dx)
          ? Math.sign(dx)
          : 0;
      input.y = Math.abs(waypoint.y - p.y) > (detour ? 2 : 6) ? Math.sign(waypoint.y - p.y) : 0;
      if (
        !meleeOccluded(p, target, s.environment.solids) &&
        Math.abs(dx) < 85 &&
        Math.abs(dy) < 22 &&
        tick % 14 === 0
      )
        input.commands = [(['sword', 'sword', 'sword', 'rising'] as Command[])[action++ % 4]];
      const diving = s.enemies.find(
        (enemy) =>
          enemy.kind === 'flyer' &&
          enemy.attack?.id === 'dive' &&
          attackPhase('dive', enemy.attack.elapsed) === 'active',
      );
      const activeThreat = s.enemies.find(
        (enemy) =>
          enemy.attack &&
          attackPhase(enemy.attack.id, enemy.attack.elapsed) === 'active' &&
          Math.hypot(enemy.x - p.x, enemy.y - p.y) < 190,
      );
      if ((diving || activeThreat) && p.rollCooldown <= 0) {
        const threat = diving ?? activeThreat!;
        input.x = diving ? 0 : p.x <= threat.x ? -1 : 1;
        input.y = p.y <= threat.y ? -1 : 1;
        input.commands = ['roll'];
      } else if (
        s.enemies.some(
          (enemy) =>
            enemy.attack && attackPhase(enemy.attack.id, enemy.attack.elapsed) === 'active',
        )
      ) {
        input.commands = [];
        input.guard = true;
      }
    } else {
      const potion = s.loot.find((l) => l.id === -20001);
      const destination = potion ?? { x: (s.stage.waves[s.wave]?.trigger ?? 7150) + 5, y: 410 };
      const next = routeTarget(p, destination, s.environment.solids);
      input.x = Math.abs(next.x - p.x) > 2 ? Math.sign(next.x - p.x) : 0;
      input.y = Math.abs(next.y - p.y) > 2 ? Math.sign(next.y - p.y) : 0;
    }
    // Read the visible warning, finish the current attack, and step into the safe depth lane.
    if (s.environment.flames.some((f) => f.phase !== 'rest' && inside(p, f))) {
      input.y = Math.sign(410 - p.y);
      input.commands = [];
    }
    const hadPotion = s.loot.some((l) => l.id === -20001);
    s.step(1 / 60, input);
    if (hadPotion && !s.loot.some((l) => l.id === -20001)) gardenCollected = true;
    if (s.environment.flames.some((f) => f.controlled && f.phase !== 'rest')) deviceSeen = true;
    if (s.environment.barricades.some((w) => w.x > 6500 && w.hp === 0)) wallBroken = true;
    s.drainEvents();
  }
  const result = {
    status: s.status,
    wave: s.wave,
    hp: s.player.hp,
    kills: s.kills,
    x: s.player.x,
    y: s.player.y,
    enemies: s.enemies.map((e) => ({ kind: e.kind, hp: e.hp, x: e.x, y: e.y })),
  };
  expect(s.status, JSON.stringify(result)).toBe('clear');
  expect(s.player.hp).toBeGreaterThan(0);
  expect(s.wave).toBe(5);
  expect(visited.size).toBe(5);
  expect(gardenCollected).toBe(true);
  expect(deviceSeen).toBe(true);
  expect(wallBroken).toBe(true);
  expect(s.kills).toBeGreaterThanOrEqual(9);
  expect(s.kills).toBeLessThanOrEqual(13);
});
