export const flyerRules = {
  diveDelay: 2.4,
  diveSpeed: 900,
  diveDescentSpeed: 700,
  diveRecovery: 0.55,
  orbitSpeed: 1.75,
  orbitRadius: 245,
  minimumRadius: 145,
  radiusContraction: 18,
  orbitDepthScale: 0.38,
  maxDepthOffset: 88,
  altitude: 145,
  bob: 7,
  moveSpeed: 210,
  takeoffDuration: 0.45,
} as const;

export const mageRules = {
  castRangeMin: 220,
  castRangeMax: 520,
  approachSpeed: 95,
  retreatSpeed: 155,
  retreatDepthSpeed: 125,
  retreatTime: 0.9,
  recovery: 0.45,
  cooldown: 3.2,
} as const;

export const magicBoltRules = {
  speed: 300,
  turnRate: 2.4,
  lifetime: 2.6,
  radius: 20,
  height: 56,
} as const;

export const monasteryRules = { waterMoveScale: 0.68 } as const;
