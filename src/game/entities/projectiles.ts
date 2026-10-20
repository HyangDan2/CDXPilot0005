import { attacks } from '../../data/attacks';
import { applyHit } from '../combat/combat';
import type { Actor } from './types';
export interface Arrow {
  id: number;
  owner: number;
  player: boolean;
  x: number;
  y: number;
  z: number;
  facing: 1 | -1;
  age: number;
}
export function advanceArrows(
  arrows: Arrow[],
  actors: Actor[],
  dt: number,
  hit: (target: Actor, damage: number) => void,
  intercept?: (arrow: Arrow, before: number, end: number) => boolean,
) {
  return arrows.filter((arrow) => {
    const before = arrow.x;
    arrow.x += arrow.facing * (arrow.player ? 520 : 350) * dt;
    arrow.age += dt;
    if (arrow.age > 1.5 || arrow.x < 0 || arrow.x > 3600) return false;
    const targets = actors
      .filter((a) => a.id !== arrow.owner && (a.kind === 'player') !== arrow.player && a.hp > 0)
      .sort((a, b) => Math.abs(a.x - before) - Math.abs(b.x - before));
    for (const target of targets) {
      if (
        target.x + 16 < Math.min(before, arrow.x) ||
        target.x - 16 > Math.max(before, arrow.x) ||
        Math.abs(target.y - arrow.y) > 12 ||
        target.z > arrow.z ||
        target.z + 95 < arrow.z
      )
        continue;
      if (intercept?.(arrow, before, target.x - arrow.facing * 16)) return false;
      const id = arrow.player ? 'shot' : 'enemyShot';
      const source: Actor = {
        ...target,
        id: arrow.owner,
        kind: arrow.player ? 'player' : 'archer',
        hp: 1,
        x: target.x - arrow.facing * 6,
        y: arrow.y,
        z: arrow.z - 50,
        facing: arrow.facing,
        attack: { id, elapsed: attacks[id].startupFrames / 60, hit: new Set(), projectile: true },
      };
      const damage = applyHit(source, target);
      if (damage) {
        hit(target, damage);
        return false;
      }
    }
    return !intercept?.(arrow, before, arrow.x);
  });
}
