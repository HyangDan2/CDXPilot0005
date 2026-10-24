import bowIdle from '../../../public/assets/sd-v3/bow-idle.json';
import { walkFrame } from './walk';
import { attacks, attackPhase } from '../../data/attacks';
import { activeProgress } from '../../data/motions';
import type { Actor } from '../entities/types';
// Approved idle cadence: preserve authored pixels and avoid the low final poses.
const swordIdleFrames = [0, 1, 2, 3, 4, 5, 6, 7, 6, 4, 2, 1] as const;
const step = (t: number, n: number) => Math.min(n - 1, Math.floor(Math.max(0, t) * n));
export function twohandFrame(a: Actor) {
  if (a.state === 'Roll')
    return {
      sheet: 'smooth-roll',
      frame: (a.weapon === 'bow' ? 6 : 0) + step(a.stateTime / 0.5, 6),
    };
  if (a.state === 'Switch')
    return {
      sheet: 'smooth-bow',
      frame:
        12 + (a.weapon === 'sword' ? step(a.stateTime / 0.4, 4) : 3 - step(a.stateTime / 0.4, 4)),
    };
  if (a.weapon === 'bow') {
    const idleDuration = bowIdle.durations.reduce((sum, duration) => sum + duration, 0);
    let idleTime = Math.max(0, a.stateTime) % idleDuration;
    let frame = bowIdle.frames[0];
    for (let index = 0; index < bowIdle.frames.length; index++) {
      if (idleTime < bowIdle.durations[index]) {
        frame = bowIdle.frames[index];
        break;
      }
      idleTime -= bowIdle.durations[index];
    }
    if (a.attack?.id === 'shot')
      frame = a.attack.elapsed < 0.7 ? 4 + step(a.attack.elapsed / 0.7, 3) : 7;
    else if (a.state === 'Guard') frame = 8;
    else if (a.state === 'Hit') frame = 9;
    else if (['Death', 'Knockdown'].includes(a.state)) frame = 11;
    else if (['Jump', 'Fall', 'Land', 'Recovery'].includes(a.state)) frame = 10;
    else if (a.state === 'Walk') return { sheet: 'smooth-bow-walk', frame: walkFrame(a.stateTime) };
    else if (a.state === 'Run')
      return { sheet: 'smooth-bow-run', frame: Math.floor(a.stateTime * 24) % 8 };
    return { sheet: 'smooth-bow', frame };
  }
  if (a.attack) {
    const d = attacks[a.attack.id],
      phase = attackPhase(a.attack.id, a.attack.elapsed);
    const active = activeProgress(a.attack.elapsed, d.startupFrames, d.activeFrames);
    const prep = (a.attack.elapsed * 60) / d.startupFrames;
    const recovery = (a.attack.elapsed * 60 - d.startupFrames - d.activeFrames) / d.recoveryFrames;
    if (a.attack.id === 'spin')
      return {
        sheet: 'smooth-defense',
        frame:
          phase === 'startup' ? 8 + step(prep, 2) : phase === 'active' ? 10 + step(active, 5) : 15,
      };
    if (['slash1', 'slash2', 'slash3', 'slash4'].includes(a.attack.id)) {
      const frames = {
        slash1: [0, 1, 2, 3, 4, 5],
        slash2: [8, 9, 10, 11, 7, 8],
        slash3: [12, 12, 13, 14, 15, 16],
        slash4: [17, 18, 22, 23, 20, 21],
      }[a.attack.id as 'slash1' | 'slash2' | 'slash3' | 'slash4'];
      const index =
        phase === 'startup'
          ? step(prep, 2)
          : phase === 'active'
            ? 2 + step(active, 2)
            : 4 + step(recovery, 2);
      return { sheet: 'smooth-combo', frame: frames[index] };
    }
    const base =
      a.attack.id === 'rising' ? 0 : a.attack.id === 'air' ? 6 : a.attack.id === 'slash2' ? 6 : 0;
    if (a.attack.id === 'rising')
      return {
        sheet: 'smooth-attack',
        frame:
          phase === 'startup'
            ? base + step(prep, 2)
            : phase === 'active'
              ? base + 2 + step(active, 4)
              : base + 5,
      };
    return {
      sheet: 'smooth-attack',
      frame:
        base +
        (phase === 'startup'
          ? step(prep, 2)
          : phase === 'active'
            ? 2 + step(active, 2)
            : 4 + step(recovery, 2)),
    };
  }
  if (a.state === 'Guard')
    return {
      sheet: 'smooth-defense',
      frame:
        a.stateTime < 0.08 ? step(a.stateTime / 0.08, 2) : 2 + (Math.floor(a.stateTime * 4) % 2),
    };
  if (a.state === 'Jump')
    return { sheet: 'smooth-reaction', frame: 2 + Math.min(1, Math.floor(a.stateTime / 0.18)) };
  if (a.state === 'Fall')
    return { sheet: 'smooth-reaction', frame: 4 + Math.min(1, Math.floor(a.stateTime / 0.15)) };
  if (a.state === 'Land')
    return { sheet: 'smooth-reaction', frame: 6 + step(a.stateTime / 0.1, 2) };
  if (a.state === 'Hit') return { sheet: 'smooth-reaction', frame: 8 + step(a.stateTime / 0.3, 2) };
  if (a.state === 'Death' || a.state === 'Knockdown')
    return {
      sheet: 'smooth-reaction',
      frame: a.z > 0 ? 10 + step(a.stateTime / 0.3, 2) : 12 + step(a.stateTime / 0.4, 2),
    };
  if (a.state === 'Recovery')
    return { sheet: 'smooth-reaction', frame: 14 + step(a.stateTime / 0.35, 2) };
  if (a.state === 'Run')
    return { sheet: 'smooth-move', frame: 8 + (Math.floor(a.stateTime * 24) % 8) };
  if (a.state === 'Walk') return { sheet: 'smooth-sword-walk', frame: walkFrame(a.stateTime) };
  if (a.stopTime !== undefined && a.stopTime < 0.3)
    return { sheet: 'smooth-stop', frame: step(a.stopTime / 0.3, 6) };
  return {
    sheet: 'smooth-idle',
    frame: swordIdleFrames[Math.floor(Math.max(0, a.stateTime) * 4) % swordIdleFrames.length],
  };
}
