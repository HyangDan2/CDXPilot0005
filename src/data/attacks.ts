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
}
const box = (width: number, depth = 30, maxZ = 90): HitboxDefinition => ({
  offsetX: 5,
  width,
  depth,
  minZ: -20,
  maxZ,
});
export const attacks: Record<AttackId, AttackDefinition> = {
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
    startupFrames: 6,
    activeFrames: 7,
    recoveryFrames: 15,
    knockbackX: 95,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(95),
    cancelInto: ['slash2', 'rising'],
  },
  slash2: {
    id: 'slash2',
    damage: 29,
    startupFrames: 7,
    activeFrames: 8,
    recoveryFrames: 16,
    knockbackX: 125,
    knockbackY: 0,
    launchVelocityZ: 0,
    hitbox: box(105),
    cancelInto: ['rising'],
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
    cancelInto: [],
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
