import {
  barricadeDefinitions,
  pillarDefinitions,
  flameDefinitions,
  flameRules,
  flameTiming,
} from '../../data/environment';
import { attacks, attackPhase } from '../../data/attacks';
import { hitbox, payAttackCost } from '../combat/combat';
import { firstArrowBlocker, inside } from '../physics/obstacles';
import { setState } from './stateMachine';
import type { Actor, GameEvent } from './types';
import type { Arrow } from './projectiles';

export type FlamePhase = 'rest' | 'warning' | 'active';
export function flamePhase(time: number, offset = 0): FlamePhase {
  const t = (time + offset) % (flameTiming.rest + flameTiming.warning + flameTiming.active);
  return t < flameTiming.rest
    ? 'rest'
    : t < flameTiming.rest + flameTiming.warning
      ? 'warning'
      : 'active';
}
export class StageEnvironment {
  time = 0;
  barricades = barricadeDefinitions.map((d) => ({ ...d, hp: Number(d.hp) }));
  readonly pillars = pillarDefinitions;
  get solids() {
    return [...this.barricades, ...this.pillars];
  }
  private lastDamage = new Map<number, number>();
  get flames() {
    return flameDefinitions.map((d) => ({ ...d, phase: flamePhase(this.time, d.offset) }));
  }
  advance(dt: number, emit: (event: GameEvent) => void) {
    const before = this.flames;
    this.time += dt;
    for (const f of this.flames)
      if (f.phase === 'warning' && before.find((p) => p.id === f.id)?.phase !== 'warning')
        emit({ type: 'hazardWarning', x: f.x + f.width / 2, y: f.y + f.depth / 2 });
  }
  strike(a: Actor, emit: (event: GameEvent) => void) {
    const attack = a.attack;
    if (
      !attack ||
      a.hp <= 0 ||
      ['shot', 'enemyShot'].includes(attack.id) ||
      attackPhase(attack.id, attack.elapsed) !== 'active'
    )
      return;
    const b = hitbox(a);
    for (const wall of this.barricades) {
      if (
        wall.hp <= 0 ||
        attack.hit.has(wall.id) ||
        b.x + b.width < wall.x ||
        b.x > wall.x + wall.width ||
        b.y + b.height < wall.y ||
        b.y > wall.y + wall.depth ||
        b.minZ > wall.height ||
        b.maxZ < 0
      )
        continue;
      attack.hit.add(wall.id);
      payAttackCost(a);
      const damage = Math.min(wall.hp, attacks[attack.id].damage);
      wall.hp -= damage;
      emit({ type: 'hit', x: wall.x + wall.width / 2, y: wall.y - wall.height / 2, value: damage });
    }
  }
  interceptArrow(arrow: Arrow, before: number, end: number): boolean {
    const solid = firstArrowBlocker(before, end, arrow.y, arrow.z, this.solids);
    if (!solid) return false;
    const wall = this.barricades.find((w) => w.id === solid.id);
    if (wall) wall.hp = Math.max(0, wall.hp - attacks[arrow.player ? 'shot' : 'enemyShot'].damage);
    return true;
  }
  burn(a: Actor): number {
    if (
      a.hp <= 0 ||
      a.invulnerable > 0 ||
      a.z >= flameRules.safeHeight ||
      (a.state === 'Roll' && a.stateTime >= 0.1 && a.stateTime < 0.3) ||
      this.time - (this.lastDamage.get(a.id) ?? -Infinity) < flameRules.interval ||
      !this.flames.some((f) => f.phase === 'active' && inside(a, f))
    )
      return 0;
    const damage = Math.min(a.hp, flameRules.damage);
    this.lastDamage.set(a.id, this.time);
    a.hp -= damage;
    a.invulnerable = flameRules.interval;
    a.attack = null;
    setState(a, a.hp === 0 ? 'Death' : 'Hit');
    return damage;
  }
}
