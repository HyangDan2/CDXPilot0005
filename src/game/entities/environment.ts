import type { StageId } from '../../data/stages';
import {
  barricadeDefinitions,
  pillarDefinitions,
  flameDefinitions,
  flameRules,
  flameTiming,
  forgeBarricadeDefinitions,
  forgePillarDefinitions,
  forgeFlameDefinitions,
  forgeDeviceRules,
  monasteryPillarDefinitions,
  monasteryWaterZones,
  type BarricadeDefinition,
  type PillarDefinition,
  type FlameDefinition,
} from '../../data/environment';
import { attacks, attackPhase } from '../../data/attacks';
import { hitbox, payAttackCost } from '../combat/combat';
import { firstArrowBlocker, inside, crosses, expanded, type Point } from '../physics/obstacles';
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
  barricades: BarricadeDefinition[];
  private readonly pillarDefinitions: readonly PillarDefinition[];
  private readonly vents: readonly FlameDefinition[];
  private readonly firedAt = new Map<string, number>();
  private bank = 0;
  waterBank = 0;
  private stopped = false;
  constructor(readonly stageId: StageId = 'gate') {
    this.barricades =
      stageId === 'gate'
        ? barricadeDefinitions.map((d) => ({ ...d }))
        : stageId === 'forge'
          ? forgeBarricadeDefinitions.map((d) => ({ ...d }))
          : [];
    this.pillarDefinitions =
      stageId === 'gate'
        ? pillarDefinitions
        : stageId === 'forge'
          ? forgePillarDefinitions
          : monasteryPillarDefinitions;
    this.vents =
      stageId === 'gate' ? flameDefinitions : stageId === 'forge' ? forgeFlameDefinitions : [];
  }
  get solids() {
    return [...this.barricades, ...this.pillars];
  }
  get pillars() {
    return this.pillarDefinitions.filter((pillar) => pillar.id !== -40 || this.waterBank === 0);
  }
  private lastDamage = new Map<number, number>();
  get flames() {
    return this.vents.map((d) => {
      const started = this.firedAt.get(d.id);
      const elapsed = started === undefined ? Infinity : this.time - started;
      const phase: FlamePhase = this.stopped
        ? 'rest'
        : d.controlled
          ? elapsed < forgeDeviceRules.warning
            ? 'warning'
            : elapsed < forgeDeviceRules.warning + forgeDeviceRules.active
              ? 'active'
              : 'rest'
          : flamePhase(this.time, d.offset);
      return { ...d, phase };
    });
  }
  advance(dt: number, emit: (event: GameEvent) => void) {
    const before = this.flames;
    this.time += dt;
    for (const f of this.flames)
      if (f.phase === 'warning' && before.find((p) => p.id === f.id)?.phase !== 'warning')
        emit({ type: 'hazardWarning', x: f.x + f.width / 2, y: f.y + f.depth / 2 });
  }
  extinguish() {
    this.stopped = true;
    this.firedAt.clear();
  }
  isWet(x: number, y: number) {
    if (this.stageId !== 'monastery') return false;
    return monasteryWaterZones.some(
      (zone, index) =>
        index !== this.waterBank &&
        x > zone.x &&
        x < zone.x + zone.width &&
        y > zone.y &&
        y < zone.y + zone.depth,
    );
  }
  bossMotion(a: Actor, before: Point, emit: (event: GameEvent) => void) {
    if (
      this.stopped ||
      this.stageId === 'gate' ||
      a.kind !== 'boss' ||
      a.hp <= 0 ||
      a.attack?.id !== 'charge' ||
      attackPhase('charge', a.attack.elapsed) !== 'active'
    )
      return;
    for (const wall of this.barricades)
      if (wall.hp > 0 && crosses(before, a, expanded(wall, 16, 10))) {
        const value = wall.hp;
        wall.hp = 0;
        emit({ type: 'hit', x: wall.x + wall.width / 2, y: wall.y - wall.height / 2, value });
      }
  }
  bossImpact(a: Actor, emit: (event: GameEvent) => void) {
    if (
      this.stopped ||
      !['forge', 'monastery'].includes(this.stageId) ||
      a.kind !== 'boss' ||
      a.hp <= 0 ||
      a.z !== 0 ||
      a.attack?.id !== 'slam' ||
      attackPhase('slam', a.attack.elapsed) !== 'active' ||
      a.attack.hit.has(forgeDeviceRules.slamMarker)
    )
      return;
    a.attack.hit.add(forgeDeviceRules.slamMarker);
    if (this.stageId === 'monastery') {
      this.waterBank = (this.waterBank + 1) % monasteryWaterZones.length;
      const zone = monasteryWaterZones[this.waterBank];
      emit({ type: 'hazardWarning', x: zone.x + zone.width / 2, y: zone.y + zone.depth / 2 });
      return;
    }
    if (this.flames.some((f) => f.controlled && f.phase !== 'rest')) return;
    const devices = this.vents.filter((f) => f.controlled);
    const device = devices[this.bank++ % devices.length];
    if (!device) return;
    this.firedAt.set(device.id, this.time);
    emit({ type: 'hazardWarning', x: device.x + device.width / 2, y: device.y + device.depth / 2 });
  }
  strike(a: Actor, emit: (event: GameEvent) => void) {
    const attack = a.attack;
    if (
      !attack ||
      a.hp <= 0 ||
      ['shot', 'enemyShot', 'spell'].includes(attack.id) ||
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
