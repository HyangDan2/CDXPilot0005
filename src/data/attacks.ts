import type { AttackId } from '../game/entities/types';
export interface HitboxDefinition {
  offsetX: number;
  width: number;
  depth: number;
  minZ: number;
  maxZ: number;
}
export interface AttackDefinition {
  id: AttackId;
  damage: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  knockbackX: number;
  knockbackY: number;
  launchVelocityZ: number;
  hitbox: HitboxDefinition;
  cancelInto: AttackId[];
  lungeDistance?: number;
  lungeSpeed?: number;
}
const box = (width: number, depth = 30, maxZ = 90): HitboxDefinition => ({
  offsetX: 5,
  width,
  depth,
  minZ: -20,
  maxZ,
});
export const attacks: Record<AttackId, AttackDefinition> = {
  shot: {
    id: 'shot',
    damage: 31,
    startupFrames: 42,
    activeFrames: 1,
    recoveryFrames: 36,
    knockbackX: 45,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(8, 12, 190),
    cancelInto: [],
  },
  enemyShot: {
    id: 'enemyShot',
    damage: 12,
    startupFrames: 48,
    activeFrames: 1,
    recoveryFrames: 54,
    knockbackX: 65,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(8, 12, 70),
    cancelInto: [],
  },
  dagger: {
    id: 'dagger',
    damage: 6,
    startupFrames: 14,
    activeFrames: 5,
    recoveryFrames: 24,
    knockbackX: 65,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(48, 20, 75),
    cancelInto: [],
  },
  heavy: {
    id: 'heavy',
    damage: 24,
    startupFrames: 40,
    activeFrames: 8,
    recoveryFrames: 42,
    knockbackX: 230,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(88, 28, 90),
    cancelInto: [],
  },
  spin: {
    id: 'spin',
    damage: 40,
    startupFrames: 6,
    activeFrames: 24,
    recoveryFrames: 24,
    knockbackX: 300,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: { offsetX: -95, width: 190, depth: 38, minZ: 10, maxZ: 100 },
    cancelInto: [],
  },
  slash1: {
    id: 'slash1',
    damage: 23,
    startupFrames: 11,
    activeFrames: 6,
    recoveryFrames: 14,
    knockbackX: 65,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(95),
    cancelInto: ['slash2', 'rising'],
  },
  slash2: {
    id: 'slash2',
    damage: 26,
    startupFrames: 10,
    activeFrames: 7,
    recoveryFrames: 16,
    knockbackX: 75,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(100),
    cancelInto: ['slash3', 'rising'],
  },
  slash3: {
    id: 'slash3',
    damage: 31,
    startupFrames: 12,
    activeFrames: 6,
    recoveryFrames: 17,
    knockbackX: 85,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(125, 18),
    cancelInto: ['slash4', 'rising'],
  },
  slash4: {
    id: 'slash4',
    damage: 41,
    startupFrames: 16,
    activeFrames: 10,
    recoveryFrames: 25,
    knockbackX: 320,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: { offsetX: -85, width: 195, depth: 34, minZ: 10, maxZ: 100 },
    lungeDistance: 100,
    lungeSpeed: 340,
    cancelInto: [],
  },
  kick: {
    id: 'kick',
    damage: 20,
    startupFrames: 5,
    activeFrames: 7,
    recoveryFrames: 17,
    knockbackX: 230,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(80),
    cancelInto: ['rising', 'slash1'],
  },
  rising: {
    id: 'rising',
    damage: 34,
    startupFrames: 9,
    activeFrames: 10,
    recoveryFrames: 22,
    knockbackX: 100,
    knockbackY: 0,
    launchVelocityZ: 420,
    hitbox: box(90, 34, 140),
    cancelInto: ['slash4'],
  },
  air: {
    id: 'air',
    damage: 27,
    startupFrames: 4,
    activeFrames: 11,
    recoveryFrames: 12,
    knockbackX: 140,
    knockbackY: 0,
    launchVelocityZ: 140,
    hitbox: box(100, 32, 95),
    cancelInto: [],
  },
  enemy: {
    id: 'enemy',
    damage: 10,
    startupFrames: 24,
    activeFrames: 6,
    recoveryFrames: 25,
    knockbackX: 160,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(65, 25, 65),
    cancelInto: [],
  },
  charge: {
    id: 'charge',
    damage: 16,
    startupFrames: 32,
    activeFrames: 20,
    recoveryFrames: 38,
    knockbackX: 270,
    knockbackY: 0,
    launchVelocityZ: 180,
    hitbox: box(65, 28, 70),
    cancelInto: [],
  },
  slam: {
    id: 'slam',
    damage: 24,
    startupFrames: 44,
    activeFrames: 9,
    recoveryFrames: 42,
    knockbackX: 280,
    knockbackY: 0,
    launchVelocityZ: 280,
    hitbox: { offsetX: -110, width: 220, depth: 60, minZ: -180, maxZ: 100 },
    cancelInto: [],
  },
  dive: {
    id: 'dive',
    damage: 20,
    startupFrames: 36,
    activeFrames: 10,
    recoveryFrames: 30,
    knockbackX: 190,
    knockbackY: 0,
    launchVelocityZ: 110,
    hitbox: { offsetX: -20, width: 72, depth: 54, minZ: -160, maxZ: 90 },
    cancelInto: [],
  },
  spell: {
    id: 'spell',
    damage: 14,
    startupFrames: 48,
    activeFrames: 1,
    recoveryFrames: 24,
    knockbackX: 115,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(8, 12, 90),
    cancelInto: [],
  },
};
export const attackPhase = (id: AttackId, elapsed: number) => {
  const a = attacks[id],
    frame = elapsed * 60;
  return frame < a.startupFrames
    ? 'startup'
    : frame < a.startupFrames + a.activeFrames
      ? 'active'
      : frame < a.startupFrames + a.activeFrames + a.recoveryFrames
        ? 'recovery'
        : 'done';
};
