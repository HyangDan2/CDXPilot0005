import type { AttackId } from '../game/entities/types';
export interface StrikeShape {
  offsetX: number;
  width: number;
  depth: number;
  minZ: number;
  maxZ: number;
}
// Authored weapon/foot envelopes in world pixels, relative to the pelvis/ground anchor.
// The renderer and simulation use the same active phase progress.
const strike = (
  offsetX: number,
  width: number,
  minZ: number,
  maxZ: number,
  depth = 25,
): StrikeShape => ({ offsetX, width, minZ, maxZ, depth });
export const strikeTracks: Partial<Record<AttackId, readonly StrikeShape[]>> = {
  slash1: [strike(3, 78, 16, 73), strike(8, 98, 42, 73)],
  slash2: [strike(8, 98, 42, 73), strike(3, 78, 16, 73)],
  kick: [strike(4, 49, 33, 69, 22), strike(8, 54, 53, 88, 22)],
  rising: [
    strike(3, 58, 20, 65, 27),
    strike(8, 85, 45, 88, 27),
    strike(5, 70, 65, 130, 27),
    strike(5, 55, 85, 145, 27),
  ],
  air: [strike(3, 48, 0, 65), strike(8, 86, 30, 73)],
  enemy: [strike(4, 92, 35, 78, 24), strike(4, 92, 35, 78, 24)],
  charge: [strike(3, 90, 30, 78, 25), strike(3, 90, 30, 78, 25)],
};
export function activeProgress(elapsed: number, startupFrames: number, activeFrames: number) {
  return Math.max(0, Math.min(1, (elapsed * 60 - startupFrames) / activeFrames));
}
export function sampleStrike(track: readonly StrikeShape[], t: number): StrikeShape {
  const p = Math.max(0, Math.min(1, t)) * (track.length - 1),
    i = Math.floor(p),
    a = track[i],
    b = track[Math.min(i + 1, track.length - 1)],
    u = p - i;
  return {
    offsetX: a.offsetX + (b.offsetX - a.offsetX) * u,
    width: a.width + (b.width - a.width) * u,
    depth: a.depth + (b.depth - a.depth) * u,
    minZ: a.minZ + (b.minZ - a.minZ) * u,
    maxZ: a.maxZ + (b.maxZ - a.maxZ) * u,
  };
}

/** Select the authored contact pose; only sweep when a contact pose changes. */
export function strikePoseProgress(id: AttackId, t: number) {
  if (id === 'rising') return Math.min(3, Math.floor(Math.max(0, t) * 4)) / 3;
  return t < (id === 'kick' ? 0.4 : 0.5) ? 0 : 1;
}
