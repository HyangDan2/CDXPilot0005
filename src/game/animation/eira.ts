import data from '../../../public/assets/characters/eira-v2/manifest.json';
import type { Actor } from '../entities/types';
import { attacks } from '../../data/attacks';
export interface Clip {
  file: string;
  count: number;
  frames: { hand: number[]; sourceBounds: number[] }[];
}
export const eira = data as {
  version: number;
  frameSize: number[];
  origin: number[];
  displayScale: number;
  clips: Record<string, Clip>;
};
export function eiraFrame(a: Actor): { clip: string; frame: number } {
  if (a.attack) {
    const clip =
      { slash1: 'slash', slash2: 'slash2', air: 'air', kick: 'kick', rising: 'rising' }[
        a.attack.id as 'slash1' | 'slash2' | 'air' | 'kick' | 'rising'
      ] ?? 'slash';
    const d = attacks[a.attack.id],
      f = a.attack.elapsed * 60;
    const frame =
      f < d.startupFrames
        ? Math.floor((f / d.startupFrames) * 2)
        : f < d.startupFrames + d.activeFrames
          ? 2 + Math.floor(((f - d.startupFrames) / d.activeFrames) * 2)
          : 4 +
            Math.min(
              1,
              Math.floor(((f - d.startupFrames - d.activeFrames) / d.recoveryFrames) * 2),
            );
    return { clip, frame };
  }
  if (a.state === 'Walk') return { clip: 'walk', frame: Math.floor(a.stateTime * 12) % 8 };
  if (a.state === 'Run') return { clip: 'run', frame: Math.floor(a.stateTime * 16) % 8 };
  if (a.state === 'Jump') return { clip: 'jump', frame: Math.min(3, Math.floor(a.stateTime * 10)) };
  if (a.state === 'Fall') return { clip: 'jump', frame: a.vz < -180 ? 4 : 3 };
  if (a.state === 'Land') return { clip: 'jump', frame: 5 };
  if (a.state === 'Hit')
    return { clip: 'reaction', frame: Math.min(3, Math.floor(a.stateTime * 14)) };
  if (a.state === 'Knockdown' || a.state === 'Death')
    return { clip: 'reaction', frame: 4 + Math.min(3, Math.floor(a.stateTime * 10)) };
  if (a.state === 'Recovery') {
    const t = a.stateTime / 0.35;
    return t < 0.25
      ? { clip: 'reaction', frame: 7 }
      : t < 0.8
        ? { clip: 'jump', frame: t < 0.5 ? 5 : 0 }
        : { clip: 'idle', frame: 0 };
  }
  if (a.state === 'Guard') return { clip: 'guard', frame: Math.floor(a.stateTime * 10) % 6 };
  return { clip: 'idle', frame: Math.floor(a.stateTime * 8) % 6 };
}
export function eiraHand(a: Actor) {
  const f = eiraFrame(a);
  const frame = eira.clips[f.clip]?.frames[f.frame];
  const hand = frame?.hand ?? [192, 230];
  return {
    x: (hand[0] - 192) * eira.displayScale * a.facing,
    y: (hand[1] - 350) * eira.displayScale,
  };
}
