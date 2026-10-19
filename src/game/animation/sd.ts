import data from '../../../public/assets/sd-v3/manifest.json';
import { attacks, attackPhase } from '../../data/attacks';
import { twohandFrame } from './twohand';
import type { Actor } from '../entities/types';
export const sd = data;
export interface SDPose {
  sheet: string;
  frame: number;
}
export function sdFrame(a: Actor): SDPose {
  if (a.kind === 'player') return twohandFrame(a);
  if (a.kind === 'archer') {
    let frame = Math.floor(a.stateTime * 2) % 2;
    if (a.attack) {
      const phase = attackPhase(a.attack.id, a.attack.elapsed);
      frame =
        phase === 'startup'
          ? 6 + Math.min(3, Math.floor((a.attack.elapsed / 0.8) * 4))
          : phase === 'active'
            ? 10
            : 11;
    } else if (a.state === 'Walk' || a.state === 'Run')
      frame = (a.ai === 'Retreat' ? 4 : 2) + (Math.floor(a.stateTime * 8) % 2);
    else if (a.state === 'Hit') frame = 12 + Math.min(1, Math.floor(a.stateTime * 8));
    else if (['Death', 'Knockdown', 'Recovery'].includes(a.state)) frame = 15;
    return { sheet: 'smooth-archer', frame };
  }
  const sheet = 'smooth-' + a.kind;
  const grunt = a.kind === 'grunt',
    boss = a.kind === 'boss';
  if (a.attack) {
    const d = attacks[a.attack.id],
      phase = attackPhase(a.attack.id, a.attack.elapsed);
    const t = (a.attack.elapsed * 60 - d.startupFrames) / d.activeFrames;
    const wind = boss
      ? a.attack.id === 'slam'
        ? [19, 20]
        : a.attack.id === 'charge'
          ? [15, 16]
          : [7, 8]
      : grunt
        ? [6, 7]
        : [8, 9];
    const hit = boss
      ? a.attack.id === 'slam'
        ? [21, 22, 23]
        : a.attack.id === 'charge'
          ? [17, 18]
          : [9, 10, 11]
      : grunt
        ? [8, 9]
        : [10, 11];
    return {
      sheet,
      frame:
        phase === 'startup'
          ? wind[Math.min(1, Math.floor(((a.attack.elapsed * 60) / d.startupFrames) * 2))]
          : phase === 'active'
            ? hit[Math.min(hit.length - 1, Math.floor(Math.max(0, t) * hit.length))]
            : 0,
    };
  }
  if (a.state === 'Death' || a.state === 'Knockdown')
    return { sheet, frame: boss ? 14 : 14 + Math.min(1, Math.floor(a.stateTime / 0.15)) };
  if (a.state === 'Hit')
    return { sheet, frame: (grunt ? 10 : 12) + Math.min(1, Math.floor(a.stateTime / 0.15)) };
  if (a.state === 'Walk' || a.state === 'Run') {
    const f = grunt ? [2, 3, 4, 5, 3, 2, 5, 4] : [2, 3, 4, 5, 6, 7, 5, 3];
    return { sheet, frame: f[Math.floor(a.stateTime * (a.state === 'Run' ? 24 : 16)) % 8] };
  }
  return { sheet, frame: Math.floor(a.stateTime * 4) % 2 };
}
