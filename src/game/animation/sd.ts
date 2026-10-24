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
  if (a.kind === 'flyer') {
    const sheet = 'smooth-flyer';
    if (a.attack?.id === 'dive') {
      const phase = attackPhase(a.attack.id, a.attack.elapsed);
      return { sheet, frame: phase === 'startup' ? 8 : phase === 'active' ? 9 : 6 };
    }
    if (a.state === 'Death') return { sheet, frame: a.z > 0 ? 12 : 14 };
    if (a.state === 'Hit')
      return {
        sheet,
        frame: a.z > 0 ? 10 + Math.min(1, Math.floor(a.stateTime * 12)) : 14,
      };
    if (a.state === 'Knockdown')
      return { sheet, frame: a.z > 0 ? 12 + Math.min(1, Math.floor(a.stateTime * 8)) : 14 };
    if (a.state === 'Recovery') return { sheet, frame: 15 };
    return { sheet, frame: Math.floor(Math.max(0, a.stateTime) * 16) % 8 };
  }
  if (a.kind === 'mage') {
    if (a.attack) {
      const phase = attackPhase(a.attack.id, a.attack.elapsed);
      return {
        sheet: 'smooth-mage',
        frame:
          phase === 'startup'
            ? 6 + Math.min(3, Math.floor((a.attack.elapsed / 0.8) * 4))
            : phase === 'active'
              ? 10
              : 11,
      };
    }
    if (a.state === 'Walk' || a.state === 'Run') {
      const start = a.ai === 'Retreat' ? 4 : 2;
      return { sheet: 'smooth-mage', frame: start + (Math.floor(a.stateTime * 8) % 2) };
    }
    if (a.state === 'Hit')
      return { sheet: 'smooth-mage', frame: 12 + Math.min(1, Math.floor(a.stateTime * 8)) };
    if (a.state === 'Death') return { sheet: 'smooth-mage', frame: 15 };
    if (a.state === 'Knockdown') return { sheet: 'smooth-mage', frame: 14 };
    if (a.state === 'Recovery') return { sheet: 'smooth-mage', frame: 0 };
    return { sheet: 'smooth-mage', frame: Math.floor(a.stateTime * 2) % 2 };
  }
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
  const visualKind = a.kind;
  const sheet = 'smooth-' + visualKind;
  const grunt = visualKind === 'grunt',
    boss = visualKind === 'boss';
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
