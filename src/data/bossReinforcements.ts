import type { Kind } from '../game/entities/types';
export const bossReinforcements: { threshold: number; kinds: Kind[] }[] = [
  { threshold: 0.7, kinds: ['rusher', 'grunt'] },
  { threshold: 0.35, kinds: ['archer', 'grunt'] },
];
export const reinforcementRules = {
  warningSeconds: 1,
  maxAlive: 3,
  edgeInset: 36,
  safeDistance: 160,
} as const;
