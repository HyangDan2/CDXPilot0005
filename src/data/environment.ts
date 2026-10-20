/** Stage environment prototypes. Coordinates use ground/depth space, never screen Y. */
export interface GroundRect {
  x: number;
  y: number;
  width: number;
  depth: number;
}
export const prototypeArena = { start: 120, end: 920, minY: 330, maxY: 480 } as const;
/** Piecewise-linear upper ground edge, shared by movement, routing and presentation. */
export const depthProfile = [
  { x: 24, minY: 376 },
  { x: 120, minY: 330 },
  { x: 920, minY: 330 },
  { x: 1080, minY: 376 },
  { x: 1180, minY: 330 },
  { x: 1760, minY: 330 },
  { x: 1920, minY: 376 },
  { x: 3600, minY: 376 },
] as const;
export function stageDepth(x: number): [number, number] {
  for (let i = 1; i < depthProfile.length; i++) {
    const a = depthProfile[i - 1],
      b = depthProfile[i];
    if (x <= b.x) {
      const t = Math.max(0, (x - a.x) / (b.x - a.x));
      return [a.minY + (b.minY - a.minY) * t, 480];
    }
  }
  return [376, 480];
}
/** Alternating wall piers leave bottom → top → bottom passages in encounter two. */
export const pillarDefinitions = [
  { id: -10, x: 1280, y: 330, width: 44, depth: 85, height: 120, hp: 1, blocksMelee: true },
  { id: -11, x: 1470, y: 405, width: 44, depth: 75, height: 120, hp: 1, blocksMelee: true },
  { id: -12, x: 1650, y: 330, width: 44, depth: 85, height: 120, hp: 1, blocksMelee: true },
] as const;
export const barricadeDefinitions = [
  { id: -1, x: 650, y: 395, width: 48, depth: 32, height: 60, hp: 64 },
] as const;
export const flameDefinitions = [
  { id: 'forge-vent', x: 770, y: 345, width: 100, depth: 55, offset: 0 },
] as const;
export const flameTiming = { rest: 2.8, warning: 1.4, active: 1.2 } as const;
export const flameRules = { damage: 12, interval: 0.75, safeHeight: 40 } as const;
