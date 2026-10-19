export const WORLD = {
  width: 960,
  height: 540,
  length: 3600,
  minY: 376,
  maxY: 480,
  gravity: 980,
  step: 1 / 60,
} as const;
export const PLAYER = {
  hp: 180,
  speed: 185,
  dashSpeed: 314.5,
  jump: 440,
  invulnerability: 0.7,
  bufferSeconds: 0.2,
} as const;
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const JUGGLE = {
  maxAirHits: 3,
  relaunchScale: 0.35,
  wakeProtection: 0.5,
  groundDownTime: 0.3,
} as const;
