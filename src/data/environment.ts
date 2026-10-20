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
  { x: 3700, minY: 330 },
  { x: 7200, minY: 330 },
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
  return [depthProfile[depthProfile.length - 1].minY, 480];
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

export interface BarricadeDefinition extends GroundRect {
  id: number;
  height: number;
  hp: number;
}
export interface PillarDefinition extends BarricadeDefinition {
  blocksMelee: boolean;
}
export interface FlameDefinition extends GroundRect {
  id: string;
  offset: number;
  controlled?: boolean;
}
export const forgeBarricadeDefinitions: readonly BarricadeDefinition[] = [
  { id: -21, x: 4000, y: 395, width: 48, depth: 32, height: 60, hp: 40 },
  { id: -22, x: 6740, y: 405, width: 48, depth: 32, height: 60, hp: 64 },
  { id: -23, x: 6960, y: 365, width: 48, depth: 32, height: 60, hp: 64 },
];
export const forgePillarDefinitions: readonly PillarDefinition[] = [
  { id: -30, x: 4420, y: 330, width: 44, depth: 85, height: 120, hp: 1, blocksMelee: true },
  { id: -31, x: 4600, y: 405, width: 44, depth: 75, height: 120, hp: 1, blocksMelee: true },
];
export const forgeFlameDefinitions: readonly FlameDefinition[] = [
  { id: 'furnace-north', x: 5080, y: 345, width: 110, depth: 55, offset: 0 },
  { id: 'furnace-south', x: 5300, y: 420, width: 110, depth: 55, offset: 2.7 },
  { id: 'warden-north', x: 6580, y: 335, width: 480, depth: 55, offset: 0, controlled: true },
  { id: 'warden-south', x: 6580, y: 425, width: 480, depth: 50, offset: 0, controlled: true },
];
export const allBarricades = [...barricadeDefinitions, ...forgeBarricadeDefinitions];
export const allPillars = [...pillarDefinitions, ...forgePillarDefinitions];
export const allFlames: readonly FlameDefinition[] = [
  ...flameDefinitions,
  ...forgeFlameDefinitions,
];
export const forgeDeviceRules = { slamMarker: -1000, warning: 1.4, active: 1.2 } as const;
